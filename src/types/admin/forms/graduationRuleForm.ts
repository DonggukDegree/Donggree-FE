/** [관리자 > 폼 모델] graduationRule 입력 상태와 변경 계약 */
import type { TMajorRole } from '@/types/admin/graduationRule/TMajorRole';
import type { TCourseType } from '@/types/course';

export type TGraduationRuleDraft = {
  clientId: string;
  id: number | null;
  ruleTypeId: string;
  ruleName: string;
  description: string;
  minCredits: string;
  minGpa: string;
  gpaScope: 'TOTAL' | 'MAJOR' | 'TEACHING';
  creditSource: '' | 'TEACHING_SUMMARY';
  minCount: string;
  creditAdjustments: TCreditAdjustmentDraft[];
  courseType: TCourseType | '';
  // MIN_CREDITS 선택자 5종. areaNames만 area-types 다중선택이고, 나머지는 콤마 구분 입력이다.
  // (pdf* 는 성적표 PDF의 원문 문자열이라 프론트가 선택지를 확정할 수 없다)
  areaNames: string[];
  subCategories: string;
  pdfCourseTypeNames: string;
  pdfAreaNames: string;
  courseCodes: string;
  exemptEnglishLevels: string;
  requiredEnglishLevels: string;
  applicableMajorRoles: TMajorRole[];
  courseTypes: TCourseType[];
  targetCourseCodes: string;
  prerequisiteCourseCodes: string;
  conditionField: '' | 'englishLevel';
  conditionValue: string;
  exemptStudentTypes: string;
  exemptCourseCodes: string;
  requiredCourseSetsText: string;
};

export type TCreditAdjustmentDraft = {
  clientId: string;
  requiredCourseCodes: string;
  replacementCourseCodes: string;
  credits: string;
};

export type TGraduationRuleDraftField = Exclude<keyof TGraduationRuleDraft, 'clientId' | 'id'>;
export type TGraduationRuleFieldChange = <K extends TGraduationRuleDraftField>(
  field: K,
  value: TGraduationRuleDraft[K],
) => void;
export type TGraduationRuleDraftChange = <K extends TGraduationRuleDraftField>(
  clientId: string,
  field: K,
  value: TGraduationRuleDraft[K],
) => void;
