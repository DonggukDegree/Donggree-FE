import { getPlaceDetail } from '@/apis/place/place';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// [동글맵] 선택한 장소 상세. 장소를 고르지 않았으면 요청하지 않는다.
export default function usePlaceDetail(placeId: number | null) {
  return useCoreQuery(QUERY_KEYS.GET_PLACE_DETAIL(placeId ?? 0), () => getPlaceDetail(placeId as number), {
    enabled: placeId !== null,
  });
}
