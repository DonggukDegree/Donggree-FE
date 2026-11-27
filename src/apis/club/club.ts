/**
 * [동아리] API
 * 목록·상세·배너·찜은 로그인 회원 누구나, 등록·수정·모집·사진 올리기는 학생 인증 회원(미인증 403 CLUB403_1)만 쓴다.
 * 정보 수정·모집은 직접 수정 권한이 있으면 바로 반영(DIRECT), 아니면 관리자 승인 요청(PENDING)이다.
 */
import axiosInstance from '@/apis/axiosInstance';
import type {
  TClubBanner,
  TClubDetail,
  TClubListParams,
  TClubPage,
  TClubRecruitmentSaveRequest,
  TClubRequest,
  TClubSaveRequest,
  TClubSaveResult,
  TClubUploadedImage,
  TMyClubRequestDetail,
} from '@/types/club/TClub';
import type { TCommonResponse } from '@/types/common';

// 같은 이름을 반복하는 쿼리(affiliations=A&affiliations=B)로 보낸다. BE가 배열 표기(a[]=)를 받지 않는다.
const REPEAT_PARAMS = { indexes: null } as const;

// 목록 상단 광고 배너. 켜져 있고 노출 기간 안인 배너만 노출 순서대로 받는다.
export const getClubBanners = async (): Promise<TClubBanner[]> => {
  const { data } = await axiosInstance.get<TCommonResponse<TClubBanner[]>>('/api/clubs/banners');
  return data.result;
};

// 목록(정렬 위치 기반 커서, 12개씩). 잘못된 커서는 400(CLUB400_1).
// 찜 모아보기에서 찜한 동아리가 없으면 서버가 전체를 주지 않도록 부르지 않고 빈 목록을 돌려준다.
export const getClubs = async (params: TClubListParams, cursor: string | null): Promise<TClubPage> => {
  if (params.favoriteIds !== null && params.favoriteIds.length === 0) {
    return { clubs: [], nextCursor: null, totalCount: 0 };
  }
  const { data } = await axiosInstance.get<TCommonResponse<TClubPage>>('/api/clubs', {
    params: {
      affiliations: params.filters.affiliations,
      fields: params.filters.fields,
      recruitmentStatuses: params.filters.recruitmentStatuses,
      sort: params.sort,
      ids: params.favoriteIds ?? undefined,
      cursor: cursor ?? undefined,
    },
    paramsSerializer: REPEAT_PARAMS,
  });
  return data.result;
};

// 상세. 직접 수정 권한이 있으면 canEditDirectly가 true다. 없는 동아리는 404(CLUB404_1).
export const getClubDetail = async (clubId: number): Promise<TClubDetail> => {
  const { data } = await axiosInstance.get<TCommonResponse<TClubDetail>>(`/api/clubs/${clubId}`);
  return data.result;
};

// 내 요청 내역(최신순). 바로 반영된 변경은 요청이 아니라 없다.
export const getMyClubRequests = async (): Promise<TClubRequest[]> => {
  const { data } = await axiosInstance.get<TCommonResponse<TClubRequest[]>>('/api/clubs/me/requests');
  return data.result;
};

// 신규 등록은 항상 승인 요청이다. 같은 동아리·종류의 검토 중 요청이 있으면 409(CLUB409_1).
export const postClub = async (body: TClubSaveRequest): Promise<TClubSaveResult> => {
  const { data } = await axiosInstance.post<TCommonResponse<TClubSaveResult>>('/api/clubs', body);
  return data.result;
};

export const putClub = async ({
  clubId,
  body,
}: {
  clubId: number;
  body: TClubSaveRequest;
}): Promise<TClubSaveResult> => {
  const { data } = await axiosInstance.put<TCommonResponse<TClubSaveResult>>(`/api/clubs/${clubId}`, body);
  return data.result;
};

// 모집 등록·수정. 진행 중·예정 모집은 고쳐 쓰고, 없거나 마감됐으면 새 모집 건이 된다.
export const putClubRecruitment = async ({
  clubId,
  body,
}: {
  clubId: number;
  body: TClubRecruitmentSaveRequest;
}): Promise<TClubSaveResult> => {
  const { data } = await axiosInstance.put<TCommonResponse<TClubSaveResult>>(`/api/clubs/${clubId}/recruitment`, body);
  return data.result;
};

// 내 요청 한 건(보냈던 값 포함). 다른 회원의 요청은 404(CLUB404_2).
export const getMyClubRequestDetail = async (requestId: number): Promise<TMyClubRequestDetail> => {
  const { data } = await axiosInstance.get<TCommonResponse<TMyClubRequestDetail>>(
    `/api/clubs/me/requests/${requestId}`,
  );
  return data.result;
};

// 신규 등록·정보 수정 요청을 고쳐 다시 요청한다. 검토 중이면 기존 요청은 취소되고 새 요청이 맨 뒤로 들어간다.
// 승인·취소된 요청은 409(CLUB409_2).
export const resubmitMyClubRequest = async ({
  requestId,
  body,
}: {
  requestId: number;
  body: TClubSaveRequest;
}): Promise<TClubSaveResult> => {
  const { data } = await axiosInstance.post<TCommonResponse<TClubSaveResult>>(
    `/api/clubs/me/requests/${requestId}/resubmit`,
    body,
  );
  return data.result;
};

export const resubmitMyRecruitmentRequest = async ({
  requestId,
  body,
}: {
  requestId: number;
  body: TClubRecruitmentSaveRequest;
}): Promise<TClubSaveResult> => {
  const { data } = await axiosInstance.post<TCommonResponse<TClubSaveResult>>(
    `/api/clubs/me/requests/${requestId}/resubmit-recruitment`,
    body,
  );
  return data.result;
};

// 동아리 사진 올리기(JPG·PNG·WEBP, 5MB). 형식이 다르거나 크면 400(CLUB400_8).
export const uploadClubImage = async (file: File): Promise<TClubUploadedImage> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axiosInstance.post<TCommonResponse<TClubUploadedImage>>('/api/clubs/images', formData);
  return data.result;
};

// 내가 찜한 동아리 ID(최근 찜한 순).
export const getFavoriteClubIds = async (): Promise<number[]> => {
  const { data } = await axiosInstance.get<TCommonResponse<number[]>>('/api/clubs/favorites');
  return data.result;
};

// 찜·찜 해제는 여러 번 보내도 결과가 같다.
export const putClubFavorite = async (clubId: number): Promise<void> => {
  await axiosInstance.put(`/api/clubs/${clubId}/favorite`);
};

export const deleteClubFavorite = async (clubId: number): Promise<void> => {
  await axiosInstance.delete(`/api/clubs/${clubId}/favorite`);
};
