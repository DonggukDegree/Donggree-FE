/** [관리자 > 졸업 규칙] 저장 시 검증되는 종류별 옵션. 조회의 레거시 JSON 타입과 구분한다. */
import type { TCreditAdjustment } from '@/types/admin/graduationRule/TGetGraduationRules';
import type { TMajorRole } from '@/types/admin/graduationRule/TMajorRole';
import type { TCourseType } from '@/types/course';

export type TRuleConfigByType = {
  TOTAL_CREDITS: { minCredits: number };
  GPA: { minGpa: number; gpaScope: 'TOTAL' | 'MAJOR' | 'TEACHING' };
  TEACHING_APTITUDE: { minCount: number };
  MIN_CREDITS: {
    minCredits?: number;
    minCount?: number;
    creditGroups?: { courseCodes: string[]; minCredits: number }[];
    minSatisfiedGroups?: number;
    creditSource?: 'TEACHING_SUMMARY';
    courseType?: TCourseType;
    areaNames?: string[];
    subCategories?: string[];
    pdfCourseTypeNames?: string[];
    pdfAreaNames?: string[];
    courseCodes?: string[];
    creditAdjustments?: TCreditAdjustment[];
    applicableMajorRoles: TMajorRole[];
  };
  REQUIRED_COURSE: {
    courseCodes?: string[];
    requiredCourseSets?: string[][][];
    exemptEnglishLevels: string[] | null;
    requiredEnglishLevels: string[] | null;
    applicableMajorRoles: TMajorRole[];
  };
  ENGLISH_COURSE: { courseTypes: TCourseType[] | null; minCount: number; applicableMajorRoles: TMajorRole[] };
  PREREQUISITE: {
    targetCourseCodes: string[];
    prerequisiteCourseCodes: string[];
    conditionField: 'englishLevel' | null;
    conditionValue: string | null;
  };
  SCIENCE_CONFLICT: Record<string, never>;
  THESIS: {
    applicableMajorRoles: TMajorRole[];
    exemptStudentTypes?: string[];
    exemptCourseCodes?: string[];
    requiredCourseSets?: string[][][];
  };
};

export type TValidatedRuleConfig = TRuleConfigByType[keyof TRuleConfigByType];
