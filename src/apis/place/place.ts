import axiosInstance from '@/apis/axiosInstance';
import type {
  TEmptyResponse,
  TGetPlaceDetailResponse,
  TGetPlaceDuplicatesResponse,
  TGetPlaceReviewsResponse,
  TGetPlacesResponse,
  TPlaceDetail,
  TPlaceDuplicates,
  TPlaceInfoEditRequest,
  TPlaceRegisterRequest,
  TPlaceReportRequest,
  TPlaceReviewPage,
  TPlaceReviewRequest,
  TPlaceSummary,
  TPostPlaceReportResponse,
  TPostPlaceResponse,
  TPostPlaceReviewResponse,
  TPutPlaceInfoResponse,
  TReviewReportReason,
} from '@/types/place/TPlace';

// 지도 장소 목록 조회. 서비스 영역이 좁아 숨김 제외 전체를 한 번에 받는다.
export const getPlaces = async (): Promise<TPlaceSummary[]> => {
  const { data } = await axiosInstance.get<TGetPlacesResponse>('/api/places');
  return data.result;
};

// 장소 상세 조회. 숨김·없는 장소는 404(PLACE404_1).
export const getPlaceDetail = async (placeId: number): Promise<TPlaceDetail> => {
  const { data } = await axiosInstance.get<TGetPlaceDetailResponse>(`/api/places/${placeId}`);
  return data.result;
};

// 등록 전 중복 후보 확인. 반경 50m 안 같은 이름(exact)·포함 이름(similar).
export const getPlaceDuplicates = async (params: {
  name: string;
  latitude: number;
  longitude: number;
}): Promise<TPlaceDuplicates> => {
  const { data } = await axiosInstance.get<TGetPlaceDuplicatesResponse>('/api/places/duplicates', { params });
  return data.result;
};

// 장소 등록. 미인증 403(PLACE403_1), 영역 밖 400(PLACE400_1), 같은 이름 중복 409(PLACE409_1).
export const postPlace = async (body: TPlaceRegisterRequest): Promise<number> => {
  const { data } = await axiosInstance.post<TPostPlaceResponse>('/api/places', body);
  return data.result;
};

// 장소 정보(영업시간·설명·메뉴) 수정. 수정 후 상세를 돌려준다.
// 미인증 403(PLACE403_1), 없거나 숨김 404(PLACE404_1), 다른 회원이 먼저 수정 409(PLACE409_2).
export const putPlaceInfo = async ({
  placeId,
  body,
}: {
  placeId: number;
  body: TPlaceInfoEditRequest;
}): Promise<TPlaceDetail> => {
  const { data } = await axiosInstance.put<TPutPlaceInfoResponse>(`/api/places/${placeId}/info`, body);
  return data.result;
};

// 장소 신고. 접수된 신고 ID를 돌려준다.
// 미인증 403(PLACE403_1), 기타 사유 설명 누락 400(PLACE400_4), 없거나 숨김 404(PLACE404_1), 처리 대기 신고 있음 409(PLACE409_3).
export const postPlaceReport = async ({
  placeId,
  body,
}: {
  placeId: number;
  body: TPlaceReportRequest;
}): Promise<number> => {
  const { data } = await axiosInstance.post<TPostPlaceReportResponse>(`/api/places/${placeId}/reports`, body);
  return data.result;
};

// 리뷰 목록. 최신순 10개씩, cursor는 이전 페이지의 nextCursor(첫 페이지는 생략).
export const getPlaceReviews = async ({
  placeId,
  cursor,
}: {
  placeId: number;
  cursor: number | null;
}): Promise<TPlaceReviewPage> => {
  const { data } = await axiosInstance.get<TGetPlaceReviewsResponse>(`/api/places/${placeId}/reviews`, {
    params: cursor === null ? undefined : { cursor },
  });
  return data.result;
};

// 리뷰 작성. 장소마다 1건(이미 있으면 409 PLACE409_4), 별점·본문 오류 400(PLACE400_5).
export const postPlaceReview = async ({
  placeId,
  body,
}: {
  placeId: number;
  body: TPlaceReviewRequest;
}): Promise<number> => {
  const { data } = await axiosInstance.post<TPostPlaceReviewResponse>(`/api/places/${placeId}/reviews`, body);
  return data.result;
};

// 본인 리뷰 수정. 숨겨진 리뷰는 409(PLACE409_6), 본인 아님 403(PLACE403_2).
export const putPlaceReview = async ({
  placeId,
  reviewId,
  body,
}: {
  placeId: number;
  reviewId: number;
  body: TPlaceReviewRequest;
}): Promise<void> => {
  await axiosInstance.put<TEmptyResponse>(`/api/places/${placeId}/reviews/${reviewId}`, body);
};

// 본인 리뷰 삭제.
export const deletePlaceReview = async ({ placeId, reviewId }: { placeId: number; reviewId: number }) => {
  await axiosInstance.delete<TEmptyResponse>(`/api/places/${placeId}/reviews/${reviewId}`);
};

// 리뷰 신고. 본인 리뷰 400(PLACE400_6), 처리 대기 신고 있음 409(PLACE409_5).
export const postReviewReport = async ({
  placeId,
  reviewId,
  body,
}: {
  placeId: number;
  reviewId: number;
  body: { reason: TReviewReportReason; description: string | null };
}): Promise<number> => {
  const { data } = await axiosInstance.post<TPostPlaceReviewResponse>(
    `/api/places/${placeId}/reviews/${reviewId}/reports`,
    body,
  );
  return data.result;
};
