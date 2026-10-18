/** [관리자 > 폼 모델] courseClassification 입력 상태와 변경 계약 */
import type { TCourseType } from '@/types/course';

export type TCourseClassificationFormState = {
  id: number | null;
  courseCode: string;
  tag: string;
  studentYearStart: string;
  studentYearEnd: string;
  courseType: TCourseType | '';
  areaTypeId: string;
  subCategory: string;
  subjectDomain: string;
  gradingSystem: string;
};

// 폼에서 관리하는 개별 행. clientId로 행을 구분한다.
export type TCourseClassificationDraft = TCourseClassificationFormState & {
  clientId: string;
};
