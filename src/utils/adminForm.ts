/**
 * [관리자 공용] 폼 입력값 변환·검증 헬퍼
 * 관리자 화면(과목 관리 · 졸업 요건 관리)의 폼은 모든 값을 문자열/배열로 다루다가
 * 저장 직전에 API 스키마(숫자·null·중첩 배열)로 바꾼다. 그 변환과 서버→폼 역변환을 여기 모았다.
 * 컨트롤러 훅(hooks/admin/use*Editor)들이 공유하므로 페이지가 아닌 utils에 둔다.
 */
import type { TCourseClassificationDraft } from '@/components/admin/courseClassification/courseClassificationForm';
import type { TGraduationRuleDraft } from '@/components/admin/graduationRule/graduationRuleForm';
import type { TRequirementSetFormState } from '@/components/admin/requirementSet/requirementSetForm';
import type { TAdminDepartment } from '@/types/admin/TGetAcademicOrganizations';
import type { TAdminCourseClassification } from '@/types/admin/TGetCourseClassifications';
import type { TAdminGraduationRule } from '@/types/admin/TGetGraduationRules';
import type { TCourseType } from '@/types/course';

// 신규 졸업 규칙 행의 초기값. 모든 입력값은 편의를 위해 문자열/배열로 다룬다.
export const EMPTY_RULE_DRAFT: Omit<TGraduationRuleDraft, 'clientId'> = {
  id: null,
  ruleTypeId: '',
  ruleName: '',
  description: '',
  minCredits: '',
  minGpa: '',
  minCount: '',
  courseType: '',
  areaNames: [],
  subCategories: '',
  pdfAreaNames: [],
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

// 공백을 제거하고, 빈 문자열이면 null로 바꾼다. (선택 입력 필드의 직렬화용)
export const optionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

// 콤마로 구분된 문자열을 trim·빈값 제거한 배열로 변환한다.
export const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// splitList 결과가 비어 있으면 null을 반환한다. (선택 목록 필드용)
export const nullableList = (value: string) => {
  const list = splitList(value);
  return list.length > 0 ? list : null;
};

// 양의 정수만 허용한다. 그 외에는 null.
export const toPositiveInteger = (value: string) => {
  const parsed = Number(value.trim());
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

// 유한한 숫자만 허용한다. 그 외에는 null. (평점평균처럼 소수 허용)
// 빈 문자열은 Number('')가 0을 반환하므로, 미입력(빈 값)과 실제 0을 구분하기 위해 먼저 걸러낸다.
export const toNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
};

// 숫자 배열에서 target을 토글한다.
export const toggleNumber = (values: number[], target: number) => {
  if (values.includes(target)) return values.filter((value) => value !== target);
  return [...values, target];
};

// 이수구분 배열에서 target을 토글한다.
export const toggleCourseType = (values: TCourseType[], target: TCourseType) => {
  if (values.includes(target)) return values.filter((value) => value !== target);
  return [...values, target];
};

// 콤마로 구분해 입력한 입학년도 문자열을 양의 정수 배열로 변환한다. (중복 제거)
export const parseYears = (value: string) => {
  const parsed = value
    .split(',')
    .map((year) => Number(year.trim()))
    .filter((year) => Number.isInteger(year) && year > 0);
  return Array.from(new Set(parsed));
};

// 신규 과목 분류 행의 초기값.
export const EMPTY_COURSE_CLASSIFICATION_DRAFT: Omit<TCourseClassificationDraft, 'clientId'> = {
  id: null,
  courseCode: '',
  tag: '',
  studentYearStart: '',
  studentYearEnd: '',
  courseType: '',
  areaTypeId: '',
  subCategory: '',
  subjectDomain: '',
};

// 서버 과목 분류를 폼 입력용 draft로 변환한다. (숫자·null을 모두 문자열로 평탄화)
export const toCourseClassificationDraft = (course: TAdminCourseClassification): TCourseClassificationDraft => ({
  ...EMPTY_COURSE_CLASSIFICATION_DRAFT,
  clientId: `course-${course.id}`,
  id: course.id,
  courseCode: course.courseCode,
  tag: course.tag ?? '',
  studentYearStart: String(course.studentYearStart),
  studentYearEnd: String(course.studentYearEnd),
  courseType: course.courseType,
  areaTypeId: course.areaTypeId === null ? '' : String(course.areaTypeId),
  subCategory: course.subCategory ?? '',
  subjectDomain: course.subjectDomain ?? '',
});

// ruleConfig의 unknown 값에서 문자열 배열만 안전하게 추출한다.
const readStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
};

// ruleConfig의 unknown 값에서 이수구분 배열만 안전하게 추출한다.
const readCourseTypeArray = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is TCourseType => typeof item === 'string') as TCourseType[];
};

// ruleConfig의 unknown 값을 문자열로 변환한다. (숫자도 문자열화)
const readString = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

// requiredCourseSets(3중 배열)를 폼 textarea용 텍스트로 직렬화한다.
// 한 줄 = 하나의 세트, '|'로 그룹 구분, 그룹 내부는 콤마 구분.
const formatRequiredCourseSets = (value: unknown) => {
  if (!Array.isArray(value)) return '';
  return value
    .map((set) => {
      if (!Array.isArray(set)) return '';
      return set
        .map((group) => (Array.isArray(group) ? group.filter((code) => typeof code === 'string').join(',') : ''))
        .filter(Boolean)
        .join(' | ');
    })
    .filter(Boolean)
    .join('\n');
};

// 폼 textarea 텍스트를 다시 requiredCourseSets(3중 배열)로 파싱한다.
export const parseRequiredCourseSets = (value: string) =>
  value
    .split('\n')
    .map((line) =>
      line
        .split('|')
        .map((group) => splitList(group))
        .filter((group) => group.length > 0),
    )
    .filter((set) => set.length > 0);

// 서버 졸업 규칙을 폼 입력용 draft로 변환한다.
export const toRuleDraft = (rule: TAdminGraduationRule): TGraduationRuleDraft => {
  const config = rule.ruleConfig;
  return {
    ...EMPTY_RULE_DRAFT,
    clientId: `rule-${rule.id}`,
    id: rule.id,
    ruleTypeId: String(rule.ruleTypeId),
    ruleName: rule.ruleName,
    description: rule.description ?? '',
    minCredits: readString(config.minCredits),
    minGpa: readString(config.minGpa),
    minCount: readString(config.minCount),
    courseType: readString(config.courseType) as TCourseType | '',
    areaNames: readStringArray(config.areaNames),
    subCategories: readStringArray(config.subCategories).join(', '),
    pdfAreaNames: readStringArray(config.pdfAreaNames),
    courseCodes: readStringArray(config.courseCodes).join(', '),
    exemptEnglishLevels: readStringArray(config.exemptEnglishLevels).join(', '),
    requiredEnglishLevels: readStringArray(config.requiredEnglishLevels).join(', '),
    courseTypes: readCourseTypeArray(config.courseTypes),
    targetCourseCodes: readStringArray(config.targetCourseCodes).join(', '),
    prerequisiteCourseCodes: readStringArray(config.prerequisiteCourseCodes).join(', '),
    conditionField: config.conditionField === 'englishLevel' ? 'englishLevel' : '',
    conditionValue: readString(config.conditionValue),
    exemptStudentTypes: readStringArray(config.exemptStudentTypes).join(', '),
    requiredCourseSetsText: formatRequiredCourseSets(config.requiredCourseSets),
  };
};

// 서버 졸업 요건 세트 상세를 폼 입력용 상태로 변환한다.
export const toRequirementSetForm = (
  set: {
    id: number;
    departmentId: number;
    departmentName: string;
    yearStart: number;
    yearEnd: number;
    version: number;
    description: string | null;
    sheetImageUrl: string | null;
    active: boolean;
  },
  department?: TAdminDepartment,
): TRequirementSetFormState => ({
  id: set.id,
  departmentId: set.departmentId,
  collegeName: department?.collegeName ?? '',
  departmentName: department?.departmentName ?? set.departmentName,
  yearStart: String(set.yearStart),
  yearEnd: String(set.yearEnd),
  version: String(set.version),
  description: set.description ?? '',
  sheetImageUrl: set.sheetImageUrl ?? '',
  active: set.active,
});
