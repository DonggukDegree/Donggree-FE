import axiosInstance from '@/apis/axiosInstance';
import type { TGetPlaceDetailResponse, TGetPlacesResponse, TPlaceDetail, TPlaceSummary } from '@/types/place/TPlace';

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
