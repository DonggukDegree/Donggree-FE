/** [관리자 > 졸업 규칙] 이수구분과 PDF 교직 영역 선택지 */
import { COURSE_LABEL, COURSE_TYPES } from '@/types/course';

export const COURSE_TYPE_OPTIONS = COURSE_TYPES.map((courseType) => ({
  value: courseType,
  label: COURSE_LABEL[courseType],
}));
export const TEACHING_AREA_OPTIONS = [
  { value: '교직선택', label: '교직선택 (직선)' },
  { value: '교직필수', label: '교직필수 (직필)' },
];
