import { getPlaces } from '@/apis/place/place';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// [동글맵] 지도 장소 목록. 카테고리 칩은 이 목록을 브라우저에서 걸러 즉시 반영한다.
export default function usePlaces() {
  return useCoreQuery(QUERY_KEYS.GET_PLACES, getPlaces);
}
