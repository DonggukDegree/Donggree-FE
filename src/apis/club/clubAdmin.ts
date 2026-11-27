/**
 * [관리자 > 동아리 관리] API
 * 요청 승인·반려, 동아리 임시 등록·정보 수정·직접 수정 권한 회수, 목록 상단 배너 관리, 관리자 사진 올리기.
 */
import axiosInstance from '@/apis/axiosInstance';
import type { TClubRequestStatus, TClubSaveRequest, TClubUploadedImage } from '@/types/club/TClub';
import type { TAdminClub, TAdminClubBanner, TAdminClubBannerSave, TAdminClubRequest } from '@/types/club/TClubAdmin';
import type { TCommonResponse } from '@/types/common';

// 요청 목록. 검토 중은 먼저 들어온 순(대기 순서, 다시 보낸 요청은 맨 뒤), 그 밖과 전체(null)는 최신순.
export const getAdminClubRequests = async (status: TClubRequestStatus | null): Promise<TAdminClubRequest[]> => {
  const { data } = await axiosInstance.get<TCommonResponse<TAdminClubRequest[]>>('/api/admin/clubs/requests', {
    params: { status: status ?? undefined },
  });
  return data.result;
};

// 승인: 요청 값을 반영하고(임시 등록 동아리는 정식 전환) 요청자에게 직접 수정 권한을 준다. 처리된 요청은 409(CLUB409_4).
export const approveAdminClubRequest = async (requestId: number): Promise<void> => {
  await axiosInstance.post(`/api/admin/clubs/requests/${requestId}/approve`);
};

// 반려 사유는 1~200자(CLUB400_6)이며 요청자의 내 요청 내역에 보인다.
export const rejectAdminClubRequest = async ({ requestId, reason }: { requestId: number; reason: string }) => {
  await axiosInstance.post(`/api/admin/clubs/requests/${requestId}/reject`, { reason });
};

// 동아리 목록(먼저 등록된 순). keyword는 이름 부분 일치.
export const getAdminClubs = async (keyword: string): Promise<TAdminClub[]> => {
  const { data } = await axiosInstance.get<TCommonResponse<TAdminClub[]>>('/api/admin/clubs', {
    params: { keyword: keyword.trim() || undefined },
  });
  return data.result;
};

export const revokeAdminClubEditor = async ({ clubId, memberId }: { clubId: number; memberId: number }) => {
  await axiosInstance.delete(`/api/admin/clubs/${clubId}/editors/${memberId}`);
};

// 관리자 임시 등록. 회원 요청이 처음 승인되면 정식 등록으로 바뀌고 그 회원이 최초 등록 포인트를 받는다.
export const createAdminClub = async (body: TClubSaveRequest): Promise<{ clubId: number }> => {
  const { data } = await axiosInstance.post<TCommonResponse<number>>('/api/admin/clubs', body);
  return { clubId: data.result };
};

export const updateAdminClub = async ({ clubId, body }: { clubId: number; body: TClubSaveRequest }) => {
  await axiosInstance.put(`/api/admin/clubs/${clubId}`, body);
  return { clubId };
};

// 관리자 사진 올리기. 배너 이미지는 BANNER(정리하지 않음), 동아리 사진은 CLUB.
export const uploadAdminClubImage = async ({
  file,
  purpose,
}: {
  file: File;
  purpose: 'CLUB' | 'BANNER';
}): Promise<TClubUploadedImage> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axiosInstance.post<TCommonResponse<TClubUploadedImage>>('/api/admin/clubs/images', formData, {
    params: { purpose },
  });
  return data.result;
};

// 배너(노출 순서대로, 꺼짐·기간 밖 포함)
export const getAdminClubBanners = async (): Promise<TAdminClubBanner[]> => {
  const { data } = await axiosInstance.get<TCommonResponse<TAdminClubBanner[]>>('/api/admin/clubs/banners');
  return data.result;
};

// 새 배너는 맨 뒤 순서로 들어간다. 링크·이미지는 동그리 경로 또는 https만(CLUB400_7).
export const saveAdminClubBanner = async ({
  bannerId,
  body,
}: {
  bannerId: number | null;
  body: TAdminClubBannerSave;
}): Promise<void> => {
  if (bannerId === null) await axiosInstance.post('/api/admin/clubs/banners', body);
  else await axiosInstance.put(`/api/admin/clubs/banners/${bannerId}`, body);
};

export const deleteAdminClubBanner = async (bannerId: number): Promise<void> => {
  await axiosInstance.delete(`/api/admin/clubs/banners/${bannerId}`);
};

// 노출 순서를 한 칸 앞(-1)·뒤(+1)로. 맨 앞·뒤면 그대로 둔다.
export const moveAdminClubBanner = async ({ bannerId, offset }: { bannerId: number; offset: -1 | 1 }) => {
  await axiosInstance.post(`/api/admin/clubs/banners/${bannerId}/move`, { offset });
};
