import axiosInstance from '@/apis/axiosInstance';
import type {
  TAdminMemberDetail,
  TAdminMemberRow,
  TAdminPage,
  TAdminPlaceReport,
  TAdminPlaceReportDetail,
  TAdminResponse,
  TAdminReviewReport,
  TAdminReviewReportDetail,
  TAdminSuspension,
  TAdminSuspensionRequest,
  TReportStatus,
} from '@/types/admin/TAdminReport';

// [관리자 > 신고 관리] 통합 신고 대시보드 API. 모두 ADMIN 이상만 호출할 수 있다.

type TListParams = { status: TReportStatus | null; page: number };
const toParams = ({ status, page }: TListParams) => (status ? { status, page } : { page });

export const getAdminPlaceReports = async (params: TListParams) => {
  const { data } = await axiosInstance.get<TAdminResponse<TAdminPage<TAdminPlaceReport>>>('/api/admin/reports/places', {
    params: toParams(params),
  });
  return data.result;
};

export const getAdminPlaceReport = async (reportId: number) => {
  const { data } = await axiosInstance.get<TAdminResponse<TAdminPlaceReportDetail>>(
    `/api/admin/reports/places/${reportId}`,
  );
  return data.result;
};

export const getAdminReviewReports = async (params: TListParams) => {
  const { data } = await axiosInstance.get<TAdminResponse<TAdminPage<TAdminReviewReport>>>(
    '/api/admin/reports/reviews',
    { params: toParams(params) },
  );
  return data.result;
};

export const getAdminReviewReport = async (reportId: number) => {
  const { data } = await axiosInstance.get<TAdminResponse<TAdminReviewReportDetail>>(
    `/api/admin/reports/reviews/${reportId}`,
  );
  return data.result;
};

// 신고 처리 완료·기각. 이미 처리한 신고는 409(PLACE409_7).
export const postAdminReportAction = async ({
  target,
  reportId,
  action,
}: {
  target: 'places' | 'reviews';
  reportId: number;
  action: 'resolve' | 'reject';
}) => {
  await axiosInstance.post(`/api/admin/reports/${target}/${reportId}/${action}`);
};

// 신고를 근거로 회원 정지. 정지하면 그 신고는 처리 완료된다.
export const postAdminReportSuspension = async ({
  target,
  reportId,
  body,
}: {
  target: 'places' | 'reviews';
  reportId: number;
  body: TAdminSuspensionRequest;
}) => {
  const { data } = await axiosInstance.post<TAdminResponse<TAdminSuspension>>(
    `/api/admin/reports/${target}/${reportId}/suspensions`,
    body,
  );
  return data.result;
};

export const postAdminPlaceVisibility = async ({ placeId, hidden }: { placeId: number; hidden: boolean }) => {
  await axiosInstance.post(`/api/admin/places/${placeId}/${hidden ? 'hide' : 'unhide'}`);
};

export const postAdminReviewVisibility = async ({ reviewId, hidden }: { reviewId: number; hidden: boolean }) => {
  await axiosInstance.post(`/api/admin/reviews/${reviewId}/${hidden ? 'hide' : 'unhide'}`);
};

// 수정 이력의 수정 전 값으로 장소 정보를 되돌린다.
export const postAdminRevertEdit = async ({ placeId, historyId }: { placeId: number; historyId: number }) => {
  await axiosInstance.post(`/api/admin/places/${placeId}/edit-histories/${historyId}/revert`);
};

export const getAdminMembers = async ({ keyword, page }: { keyword: string; page: number }) => {
  const { data } = await axiosInstance.get<TAdminResponse<TAdminPage<TAdminMemberRow>>>('/api/admin/members', {
    params: keyword.trim() ? { keyword: keyword.trim(), page } : { page },
  });
  return data.result;
};

export const getAdminMember = async (memberId: number) => {
  const { data } = await axiosInstance.get<TAdminResponse<TAdminMemberDetail>>(`/api/admin/members/${memberId}`);
  return data.result;
};

export const postAdminMemberSuspension = async ({
  memberId,
  body,
}: {
  memberId: number;
  body: TAdminSuspensionRequest;
}) => {
  const { data } = await axiosInstance.post<TAdminResponse<TAdminSuspension>>(
    `/api/admin/members/${memberId}/suspensions`,
    body,
  );
  return data.result;
};

export const postAdminLiftSuspension = async (memberId: number) => {
  await axiosInstance.post(`/api/admin/members/${memberId}/suspensions/lift`);
};
