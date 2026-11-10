import axiosInstance from '@/apis/axiosInstance';
import type {
  TGetPlaceDetailResponse,
  TGetPlaceDuplicatesResponse,
  TGetPlacesResponse,
  TPlaceDetail,
  TPlaceDuplicates,
  TPlaceRegisterRequest,
  TPlaceSummary,
  TPostPlaceResponse,
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
