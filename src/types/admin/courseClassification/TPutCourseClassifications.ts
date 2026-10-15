import type { TCommonResponse } from '@/types/common';
import type { TCourseType } from '@/types/course';

// PUT /api/admin/course-classifications 요청 항목
export type TCourseClassificationUpsertItem = {
  id: number | null;
  courseCode: string;
  tag: string | null;
  studentYearStart: number;
  studentYearEnd: number;
  courseType: TCourseType;
  areaTypeId: number | null;
  subCategory: string | null;
  subjectDomain: string | null;
};

export type TCourseClassificationUpsertRequest = {
  items: TCourseClassificationUpsertItem[];
};

export type TPutCourseClassificationsResponse = TCommonResponse<number[]>;
