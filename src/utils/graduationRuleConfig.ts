/**
 * [관리자 > 졸업 요건 관리] 졸업 규칙 폼 → API 변환
 * 규칙 종류(typeName)별 설정값 검증과 rule_config 조립을 담당한다.
 * 컨트롤러 훅(useGraduationRuleEditor)에서 분리해 왔다 — 선택자가 늘수록 이 부분만 길어지는데,
 * 훅에 같이 두면 상태 관리 코드가 검증 코드에 묻힌다.
 *
 * 검증 실패는 toast로 알리고 null을 반환한다. (호출부가 null을 받으면 저장을 중단한다)
 */
import { toast } from 'sonner';

import type { TGraduationRuleDraft } from '@/components/admin/graduationRule/graduationRuleForm';
import type { TGraduationRuleConfig } from '@/types/admin/TGetGraduationRules';
import type { TAdminRuleType } from '@/types/admin/TGetRuleTypes';
import type { TGraduationRuleUpsertItem } from '@/types/admin/TPutGraduationRules';
import {
  nullableList,
  optionalText,
  parseRequiredCourseSets,
  splitList,
  toNumber,
  toPositiveInteger,
} from '@/utils/adminForm';

// 규칙 종류(typeName)별로 폼 입력값을 검증해 API용 ruleConfig를 조립한다. 누락 시 toast 후 null.
const buildRuleConfig = (
  draft: TGraduationRuleDraft,
  ruleType: TAdminRuleType,
  rowLabel: string,
): TGraduationRuleConfig | null => {
  if (ruleType.typeName === 'TOTAL_CREDITS') {
    const minCredits = toPositiveInteger(draft.minCredits);
    if (!minCredits) {
      toast.error(`${rowLabel}의 최소 취득학점을 입력해주세요.`);
      return null;
    }
    return { minCredits };
  }

  if (ruleType.typeName === 'GPA') {
    const minGpa = toNumber(draft.minGpa);
    if (minGpa === null || minGpa <= 0) {
      toast.error(`${rowLabel}의 최소 평점평균을 입력해주세요.`);
      return null;
    }
    return { minGpa };
  }

  // MIN_CREDITS: 채운 선택자를 모두 만족하는 과목만 집계한다(선택자 간 AND).
  // 한 선택자 안의 배열 값들끼리는 OR이고, 비운 선택자는 그 항목에 제약을 걸지 않는다.
  // 임계값 2종도 AND라 지정한 것을 모두 충족해야 하며, 최소 하나는 있어야 한다.
  // (임계값이 둘 다 없으면 서버가 판정 시점에 IllegalStateException을 던지므로 여기서 먼저 막는다)
  if (ruleType.typeName === 'MIN_CREDITS') {
    const minCredits = toPositiveInteger(draft.minCredits);
    const minCount = toPositiveInteger(draft.minCount);
    if (!minCredits && !minCount) {
      toast.error(`${rowLabel}의 최소 학점 또는 최소 과목 수 중 하나는 입력해주세요.`);
      return null;
    }
    if (draft.applicableMajorRoles.length === 0) {
      toast.error(`${rowLabel}의 규칙 적용 대상을 하나 이상 선택해주세요.`);
      return null;
    }

    const subCategories = splitList(draft.subCategories);
    const pdfCourseTypeNames = splitList(draft.pdfCourseTypeNames);
    const pdfAreaNames = splitList(draft.pdfAreaNames);
    const courseCodes = splitList(draft.courseCodes);

    // 이수구분·선택자를 하나도 지정하지 않는 것은 서버가 '제한 없음'(= 전체 수강 이력 대상)으로
    // 정의한 정상 설정이다(MinCreditsEvaluator javadoc). 스펙에 없는 제약을 프론트가 만들지 않는다.
    // 비어 있는 키는 null로 보내지 않고 아예 뺀다. (제약 없음 = 키 부재)
    return {
      ...(draft.courseType ? { courseType: draft.courseType } : {}),
      ...(draft.areaNames.length > 0 ? { areaNames: draft.areaNames } : {}),
      ...(subCategories.length > 0 ? { subCategories } : {}),
      ...(pdfCourseTypeNames.length > 0 ? { pdfCourseTypeNames } : {}),
      ...(pdfAreaNames.length > 0 ? { pdfAreaNames } : {}),
      ...(courseCodes.length > 0 ? { courseCodes } : {}),
      applicableMajorRoles: draft.applicableMajorRoles,
      ...(minCredits ? { minCredits } : {}),
      ...(minCount ? { minCount } : {}),
    };
  }

  if (ruleType.typeName === 'REQUIRED_COURSE') {
    const courseCodes = splitList(draft.courseCodes);
    if (courseCodes.length === 0) {
      toast.error(`${rowLabel}의 필수 과목코드를 입력해주세요.`);
      return null;
    }
    if (draft.applicableMajorRoles.length === 0) {
      toast.error(`${rowLabel}의 규칙 적용 대상을 하나 이상 선택해주세요.`);
      return null;
    }
    return {
      courseCodes,
      exemptEnglishLevels: nullableList(draft.exemptEnglishLevels),
      requiredEnglishLevels: nullableList(draft.requiredEnglishLevels),
      applicableMajorRoles: draft.applicableMajorRoles,
    };
  }

  if (ruleType.typeName === 'ENGLISH_COURSE') {
    const minCount = toPositiveInteger(draft.minCount);
    if (!minCount) {
      toast.error(`${rowLabel}의 최소 이수 개수를 입력해주세요.`);
      return null;
    }
    if (draft.applicableMajorRoles.length === 0) {
      toast.error(`${rowLabel}의 규칙 적용 대상을 하나 이상 선택해주세요.`);
      return null;
    }
    return {
      courseTypes: draft.courseTypes.length > 0 ? draft.courseTypes : null,
      minCount,
      applicableMajorRoles: draft.applicableMajorRoles,
    };
  }

  if (ruleType.typeName === 'PREREQUISITE') {
    const targetCourseCodes = splitList(draft.targetCourseCodes);
    const prerequisiteCourseCodes = splitList(draft.prerequisiteCourseCodes);
    if (targetCourseCodes.length === 0 || prerequisiteCourseCodes.length === 0) {
      toast.error(`${rowLabel}의 대상/선이수 과목코드를 입력해주세요.`);
      return null;
    }
    if (draft.conditionField && !draft.conditionValue.trim()) {
      toast.error(`${rowLabel}의 조건 값을 입력해주세요.`);
      return null;
    }
    return {
      targetCourseCodes,
      prerequisiteCourseCodes,
      conditionField: draft.conditionField || null,
      conditionValue: draft.conditionField ? draft.conditionValue.trim() : null,
    };
  }

  if (ruleType.typeName === 'SCIENCE_CONFLICT') {
    return {};
  }

  // THESIS: 과목 세트가 없으면 적용 역할의 주전공 또는 복수1 논문·시험 결과로 판정한다.
  // 기존 {} 규칙은 읽기 호환만 유지하며, 신규·수정 시에는 적용 대상을 반드시 전송한다.
  // exemptCourseCodes를 채우면 면제 학생유형에 전체 면제 대신 그 과목만 이수한 것으로 간주한다(부분 면제).
  if (ruleType.typeName === 'THESIS') {
    if (draft.applicableMajorRoles.length === 0) {
      toast.error(`${rowLabel}의 규칙 적용 대상을 하나 이상 선택해주세요.`);
      return null;
    }
    const exemptStudentTypes = splitList(draft.exemptStudentTypes);
    const exemptCourseCodes = splitList(draft.exemptCourseCodes);
    const requiredCourseSets = parseRequiredCourseSets(draft.requiredCourseSetsText);
    if (exemptCourseCodes.length > 0 && exemptStudentTypes.length === 0) {
      toast.error(`${rowLabel}의 면제 과목코드를 쓰려면 면제 학생유형도 입력해주세요.`);
      return null;
    }
    return {
      applicableMajorRoles: draft.applicableMajorRoles,
      ...(exemptStudentTypes.length > 0 ? { exemptStudentTypes } : {}),
      ...(exemptCourseCodes.length > 0 ? { exemptCourseCodes } : {}),
      ...(requiredCourseSets.length > 0 ? { requiredCourseSets } : {}),
    };
  }

  // 알 수 없는 규칙 종류는 검증할 수 없으므로 방어적으로 null을 반환한다.
  return null;
};

// 폼 draft 한 건을 업서트 요청 항목으로 변환한다. 검증 실패 시 toast 후 null.
export const buildRuleUpsertItem = (
  draft: TGraduationRuleDraft,
  index: number,
  ruleTypes: TAdminRuleType[],
): TGraduationRuleUpsertItem | null => {
  const rowLabel = `${index + 1}번째 규칙`;
  const ruleTypeId = toPositiveInteger(draft.ruleTypeId);
  const ruleType = ruleTypeId ? ruleTypes.find((type) => type.id === ruleTypeId) : null;
  const ruleName = draft.ruleName.trim();

  if (!ruleTypeId || !ruleType) {
    toast.error(`${rowLabel}의 규칙 종류를 선택해주세요.`);
    return null;
  }
  if (!ruleName) {
    toast.error(`${rowLabel}의 규칙명을 입력해주세요.`);
    return null;
  }

  const ruleConfig = buildRuleConfig(draft, ruleType, rowLabel);
  if (!ruleConfig) return null;

  return {
    id: draft.id,
    ruleTypeId,
    ruleName,
    ruleConfig,
    description: optionalText(draft.description),
  };
};
