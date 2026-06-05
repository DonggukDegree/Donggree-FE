import axiosInstance from '@/apis/axiosInstance';
import type { TCourseType } from '@/types/course';
import type { TGetReportDetailResponse } from '@/types/report/TGetReportDetail';
import type { TGetReportSummaryResponse } from '@/types/report/TGetReportSummary';
import type { TGetUserReportsResponse } from '@/types/report/TGetUserReports';
import type { TPatchReportRequest, TPatchReportResponse } from '@/types/report/TPatchReport';
import type { TPutTranscriptResponse } from '@/types/report/TPutTranscript';

// 성적표(학업 리포트) 조회. 성적표가 없으면 404(TRANSCRIPT404_1)를 반환한다.
export const getUserReports = async () => {
  const { data } = await axiosInstance.get<TGetUserReportsResponse>('/api/users/me/reports');
  return data.result;
};

// 졸업 달성률 요약 조회. 리포트 없음(404 GRADUATION404_1)·요건 없음(404 GRADUATION404_2) 가능.
export const getReportSummary = async () => {
  const { data } = await axiosInstance.get<TGetReportSummaryResponse>('/api/reports/summary');
  return data.result;
};

// courseType별 영역 상세 조회. 잘못된 courseType은 400(COMMON400_1).
export const getReportDetail = async (courseType: TCourseType) => {
  const { data } = await axiosInstance.get<TGetReportDetailResponse>('/api/reports', { params: { courseType } });
  return data.result;
};

// 수강 이력 수동 추가. 성적표 없으면 404(TRANSCRIPT404_1), 허용되지 않은 성적 값은 400(TRANSCRIPT400_4).
export const patchReportCourses = async (body: TPatchReportRequest) => {
  const { data } = await axiosInstance.patch<TPatchReportResponse>('/api/users/me/reports', body);
  return data.result;
};

// 성적표 PDF 업로드 (multipart/form-data, 파트명 'file').
// 서버가 PDF를 파싱해 학업 정보를 저장하며, 기존 성적표가 있으면 soft-delete 후 새로 생성한다.
// 성공 코드는 COMMON201_1이며, result로 학점 정합성 정보(totalCredits/recordedCredits/creditGap)를 돌려준다.
export const putTranscript = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  // FormData를 전달하면 axios가 multipart 경계(boundary)를 자동으로 설정한다. (Content-Type 수동 지정 금지)
  const { data } = await axiosInstance.put<TPutTranscriptResponse>('/api/users/me/reports', formData);
  return data;
};
