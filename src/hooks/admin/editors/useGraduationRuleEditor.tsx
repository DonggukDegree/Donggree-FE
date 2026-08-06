/**
 * [관리자 > 졸업 요건 관리 > 졸업 규칙 관리] 탭 컨트롤러 훅
 * 필터 상태 · 수정 대상(draft) 선택 · 규칙 종류별 설정값 검증 · 저장 확인 모달 · 저장을 담당한다.
 * 하단 규칙 목록 조회는 세트 관리 탭도 함께 쓰므로 이 훅이 소유하고 결과를 그대로 넘겨준다.
 */
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import type {
  TGraduationRuleDraft,
  TGraduationRuleDraftField,
  TGraduationRuleDraftValue,
} from '@/components/admin/graduationRule/graduationRuleForm';
import useUpsertGraduationRules from '@/hooks/admin/mutations/useUpsertGraduationRules';
import useAdminAreaTypes from '@/hooks/admin/queries/useAdminAreaTypes';
import useAdminGraduationRules from '@/hooks/admin/queries/useAdminGraduationRules';
import useAdminRequirementSets from '@/hooks/admin/queries/useAdminRequirementSets';
import useAdminRuleTypes from '@/hooks/admin/queries/useAdminRuleTypes';
import { useModalStore } from '@/stores/modalStore';
import type { TGraduationRuleConfig, TGraduationRuleFilters } from '@/types/admin/TGetGraduationRules';
import type { TAdminRuleType } from '@/types/admin/TGetRuleTypes';
import type { TGraduationRuleUpsertItem } from '@/types/admin/TPutGraduationRules';
import type { TCourseType } from '@/types/course';
import {
  EMPTY_RULE_DRAFT,
  nullableList,
  optionalText,
  parseRequiredCourseSets,
  splitList,
  toggleCourseType,
  toggleNumber,
  toNumber,
  toPositiveInteger,
  toRuleDraft,
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
  if (ruleType.typeName === 'MIN_CREDITS') {
    const minCredits = toPositiveInteger(draft.minCredits);
    const minCount = toPositiveInteger(draft.minCount);
    if (!minCredits && !minCount) {
      toast.error(`${rowLabel}의 최소 학점 또는 최소 과목 수 중 하나는 입력해주세요.`);
      return null;
    }

    const subCategories = splitList(draft.subCategories);
    const pdfCourseTypeNames = splitList(draft.pdfCourseTypeNames);
    const pdfAreaNames = splitList(draft.pdfAreaNames);
    const courseCodes = splitList(draft.courseCodes);
    const hasSelector =
      draft.areaNames.length > 0 ||
      subCategories.length > 0 ||
      pdfCourseTypeNames.length > 0 ||
      pdfAreaNames.length > 0 ||
      courseCodes.length > 0;
    // 이수구분도 선택자도 없으면 아무 제약이 없어 전 과목이 집계된다.
    // 서버가 config를 검증하지 않아 조용히 통과하므로 여기서 막는다.
    if (!draft.courseType && !hasSelector) {
      toast.error(`${rowLabel}의 이수구분이나 선택자 중 하나는 지정해주세요.`);
      return null;
    }

    // 비어 있는 키는 null로 보내지 않고 아예 뺀다. (제약 없음 = 키 부재)
    return {
      ...(draft.courseType ? { courseType: draft.courseType } : {}),
      ...(draft.areaNames.length > 0 ? { areaNames: draft.areaNames } : {}),
      ...(subCategories.length > 0 ? { subCategories } : {}),
      ...(pdfCourseTypeNames.length > 0 ? { pdfCourseTypeNames } : {}),
      ...(pdfAreaNames.length > 0 ? { pdfAreaNames } : {}),
      ...(courseCodes.length > 0 ? { courseCodes } : {}),
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
    return {
      courseCodes,
      exemptEnglishLevels: nullableList(draft.exemptEnglishLevels),
      requiredEnglishLevels: nullableList(draft.requiredEnglishLevels),
    };
  }

  if (ruleType.typeName === 'ENGLISH_COURSE') {
    const minCount = toPositiveInteger(draft.minCount);
    if (!minCount) {
      toast.error(`${rowLabel}의 최소 이수 개수를 입력해주세요.`);
      return null;
    }
    return {
      courseTypes: draft.courseTypes.length > 0 ? draft.courseTypes : null,
      minCount,
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

  // THESIS: requiredCourseSets가 있으면 그 과목 이수로, 없으면 성적표의 졸업논문심사 합격으로 판정한다.
  // 후자가 대부분의 학과라 빈 객체 {}도 정상 저장값이다.
  if (ruleType.typeName === 'THESIS') {
    const exemptStudentTypes = splitList(draft.exemptStudentTypes);
    const requiredCourseSets = parseRequiredCourseSets(draft.requiredCourseSetsText);
    return {
      ...(exemptStudentTypes.length > 0 ? { exemptStudentTypes } : {}),
      ...(requiredCourseSets.length > 0 ? { requiredCourseSets } : {}),
    };
  }

  // 알 수 없는 규칙 종류는 검증할 수 없으므로 방어적으로 null을 반환한다.
  return null;
};

// 폼 draft 한 건을 업서트 요청 항목으로 변환한다. 검증 실패 시 toast 후 null.
const buildRuleUpsertItem = (
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

export default function useGraduationRuleEditor() {
  const ruleDraftIndex = useRef(0);
  const openConfirm = useModalStore((state) => state.openConfirm);

  // 필터는 '고르는 중인 값'과 '적용된 값'을 나눠 둔다. 적용된 값만 조회에 쓰이므로
  // 드롭다운을 만지는 동안에는 목록이 흔들리지 않는다.
  const [selectedRuleTypeIds, setSelectedRuleTypeIds] = useState<number[]>([]);
  const [selectedCourseTypes, setSelectedCourseTypes] = useState<TCourseType[]>([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<TGraduationRuleFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [drafts, setDrafts] = useState<TGraduationRuleDraft[]>([]);

  const { data: areaTypes = [] } = useAdminAreaTypes();
  const { data: ruleTypes = [], isError: isRuleTypeError } = useAdminRuleTypes();
  // '적용 세트' 필터의 선택지. 필터 없이 전체 세트를 받는다.
  const { data: requirementSets = [] } = useAdminRequirementSets({});
  // 규칙 종류·이수구분·적용 세트 모두 서버가 AND로 걸러 준다. (requirementSetId 파라미터 지원)
  const {
    data: rules = [],
    isPending: isRulesLoading,
    isError: isRulesError,
  } = useAdminGraduationRules(appliedFilters);
  const { mutate: upsertGraduationRules, isPending: isSaving } = useUpsertGraduationRules();

  const clearDrafts = () => {
    setSelectedIds(new Set());
    setDrafts([]);
  };

  const onRuleTypeToggle = (ruleTypeId: number) => {
    setSelectedRuleTypeIds((prev) => toggleNumber(prev, ruleTypeId));
  };

  const onCourseTypeToggle = (courseType: TCourseType) => {
    setSelectedCourseTypes((prev) => toggleCourseType(prev, courseType));
  };

  // 목록이 바뀌면 화면에 없는 규칙을 편집 중인 상태가 남지 않도록 draft를 비운다.
  const applyFilters = () => {
    clearDrafts();
    const requirementSetId = toPositiveInteger(selectedSetId);
    setAppliedFilters({
      ...(selectedRuleTypeIds.length > 0 ? { ruleTypeIds: selectedRuleTypeIds } : {}),
      ...(selectedCourseTypes.length > 0 ? { courseTypes: selectedCourseTypes } : {}),
      ...(requirementSetId ? { requirementSetId } : {}),
    });
  };

  const resetFilters = () => {
    setSelectedRuleTypeIds([]);
    setSelectedCourseTypes([]);
    setSelectedSetId('');
    setAppliedFilters({});
    clearDrafts();
  };

  const addDraft = () => {
    const clientId = `new-rule-${ruleDraftIndex.current++}`;
    setDrafts((prev) => [...prev, { ...EMPTY_RULE_DRAFT, clientId }]);
  };

  const removeDraft = (clientId: string) => {
    const removedDraft = drafts.find((draft) => draft.clientId === clientId);
    if (removedDraft?.id !== null && removedDraft?.id !== undefined) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(removedDraft.id as number);
        return next;
      });
    }
    setDrafts((prev) => prev.filter((draft) => draft.clientId !== clientId));
  };

  const changeDraft = (clientId: string, field: TGraduationRuleDraftField, value: TGraduationRuleDraftValue) => {
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.clientId !== clientId) return draft;
        const next = { ...draft, [field]: value };
        // 규칙 종류를 바꾸면 종류별 설정값이 의미를 잃으므로 모두 초기화한다.
        if (field === 'ruleTypeId') {
          return {
            ...next,
            minCredits: '',
            minGpa: '',
            minCount: '',
            courseType: '',
            areaNames: [],
            subCategories: '',
            pdfCourseTypeNames: '',
            pdfAreaNames: '',
            courseCodes: '',
            exemptEnglishLevels: '',
            requiredEnglishLevels: '',
            courseTypes: [],
            targetCourseCodes: '',
            prerequisiteCourseCodes: '',
            conditionField: '',
            conditionValue: '',
            exemptStudentTypes: '',
            requiredCourseSetsText: '',
          };
        }
        return next;
      }),
    );
  };

  // 하단 공유 테이블에서 "전체 선택"을 눌렀을 때(규칙 편집 모드) 현재 목록을 draft로 시딩한다.
  const selectRows = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      rules.forEach((rule) => {
        if (checked) {
          next.add(rule.id);
        } else {
          next.delete(rule.id);
        }
      });
      return next;
    });
    setDrafts((prev) => {
      const newDrafts = prev.filter((draft) => draft.id === null);
      if (!checked) return newDrafts;
      const existingDraftIds = new Set(prev.filter((draft) => draft.id !== null).map((draft) => draft.id));
      const visibleDrafts = rules.filter((rule) => !existingDraftIds.has(rule.id)).map((rule) => toRuleDraft(rule));
      return [...prev, ...visibleDrafts];
    });
  };

  // 하단 공유 테이블에서 행 하나를 토글했을 때(규칙 편집 모드) draft를 추가/제거한다.
  const selectRow = (ruleId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(ruleId);
      } else {
        next.delete(ruleId);
      }
      return next;
    });
    setDrafts((prev) => {
      if (!checked) return prev.filter((draft) => draft.id !== ruleId);
      const selectedRule = rules.find((rule) => rule.id === ruleId);
      if (!selectedRule || prev.some((draft) => draft.id === ruleId)) return prev;
      return [...prev, toRuleDraft(selectedRule)];
    });
  };

  const submit = () => {
    if (drafts.length === 0) {
      toast.error('수정하거나 추가할 졸업 규칙을 먼저 선택해주세요.');
      return;
    }

    const items: TGraduationRuleUpsertItem[] = [];
    for (const [index, draft] of drafts.entries()) {
      const item = buildRuleUpsertItem(draft, index, ruleTypes);
      if (!item) return;
      items.push(item);
    }

    const createCount = items.filter((item) => item.id === null).length;
    const updateCount = items.length - createCount;
    const summaries = items.map((item, index) => ({
      clientId: drafts[index]?.clientId ?? item.ruleName,
      item,
    }));

    openConfirm({
      title: '졸업 규칙 수정',
      action: `총 ${items.length}건 저장 (수정 ${updateCount}건, 신규 ${createCount}건)`,
      description: '규칙 설정값은 졸업 판정에 바로 사용됩니다. 저장 전 내용을 확인해주세요.',
      confirmText: '수정하기',
      cancelText: '취소하기',
      details: (
        <div className="flex max-h-52 flex-col gap-2 overflow-y-auto text-body-s">
          {summaries.map(({ clientId, item }) => {
            const ruleType = ruleTypes.find((type) => type.id === item.ruleTypeId);
            return (
              <div key={clientId} className="rounded-lg bg-white px-4 py-3">
                <p className="font-semibold text-coolgray-90">
                  {item.id === null ? '신규' : `ID ${item.id}`} · {item.ruleName}
                </p>
                <p className="mt-1 text-coolgray-60">{ruleType?.typeName ?? item.ruleTypeId}</p>
              </div>
            );
          })}
        </div>
      ),
      onConfirm: () => {
        upsertGraduationRules(
          { items },
          {
            // 목록 재조회는 useUpsertGraduationRules의 invalidateQueries가 처리한다. (중복 요청 방지)
            onSuccess: () => {
              toast.success('졸업 규칙을 수정했어요.');
              clearDrafts();
            },
          },
        );
      },
    });
  };

  return {
    areaTypes,
    ruleTypes,
    isRuleTypeError,
    requirementSets,
    rules,
    isRulesLoading,
    isRulesError,
    selectedRuleTypeIds,
    selectedCourseTypes,
    selectedSetId,
    onRuleTypeToggle,
    onCourseTypeToggle,
    onSetChange: setSelectedSetId,
    applyFilters,
    resetFilters,
    drafts,
    selectedIds,
    addDraft,
    removeDraft,
    changeDraft,
    submit,
    isSaving,
    selectRows,
    selectRow,
  };
}
