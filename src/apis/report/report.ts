import axiosInstance from '@/apis/axiosInstance';
import type { TGetUserReportsResponse } from '@/types/report/TGetUserReports';
import type { TPutTranscriptResponse } from '@/types/report/TPutTranscript';

// 성적표(학업 리포트) 조회. 성적표가 없으면 404(TRANSCRIPT404_1)를 반환한다.
export const getUserReports = async () => {
  const { data } = await axiosInstance.get<TGetUserReportsResponse>('/api/users/me/reports');
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
