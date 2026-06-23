import axiosInstance from '@/apis/axiosInstance';
import type { TGetAdminAreaTypesResponse } from '@/types/admin/TGetAdminAreaTypes';
import type {
  TCourseClassificationFilters,
  TGetCourseClassificationsResponse,
} from '@/types/admin/TGetCourseClassifications';
import type {
  TCourseClassificationUpsertRequest,
  TPutCourseClassificationsResponse,
} from '@/types/admin/TPutCourseClassifications';

const joinParam = <T extends string | number>(values?: T[]) => {
  if (!values || values.length === 0) return undefined;
  return values.join(',');
};

// 과목 분류 필터/폼의 이수 영역 선택지 조회.
export const getAdminAreaTypes = async () => {
  const { data } = await axiosInstance.get<TGetAdminAreaTypesResponse>('/api/admin/area-types');
  return data.result;
};

// 과목 분류 다중 필터 조회. 백엔드는 반복 파라미터와 콤마 문자열을 모두 허용하므로 콤마 문자열로 직렬화한다.
export const getAdminCourseClassifications = async (filters: TCourseClassificationFilters) => {
  const { data } = await axiosInstance.get<TGetCourseClassificationsResponse>('/api/admin/course-classifications', {
    params: {
      areaTypeIds: joinParam(filters.areaTypeIds),
      courseTypes: joinParam(filters.courseTypes),
      years: joinParam(filters.years),
    },
  });
  return data.result;
};

// 과목 분류 배치 업서트. 단일 항목 저장 UI에서도 API 스펙에 맞춰 items 배열로 보낸다.
export const putAdminCourseClassifications = async (body: TCourseClassificationUpsertRequest) => {
  const { data } = await axiosInstance.put<TPutCourseClassificationsResponse>(
    '/api/admin/course-classifications',
    body,
  );
  return data.result;
};
