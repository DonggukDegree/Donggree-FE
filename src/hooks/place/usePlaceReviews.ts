import { getPlaceReviews } from '@/apis/place/place';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreInfiniteQuery } from '@/hooks/customQuery';

// [동글맵 > 리뷰] 장소 리뷰 목록. 최신순 10개씩 "더보기"로 이어 받는다(커서 기반).
export default function usePlaceReviews(placeId: number) {
  const query = useCoreInfiniteQuery(
    QUERY_KEYS.GET_PLACE_REVIEWS(placeId),
    (cursor: number | null) => getPlaceReviews({ placeId, cursor }),
    { initialPageParam: null, getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const pages = query.data?.pages ?? [];
  return {
    ...query,
    reviews: pages.flatMap((page) => page.reviews),
    // 본인 리뷰는 모든 페이지에 같이 오므로 첫 페이지 값을 쓴다.
    myReview: pages[0]?.myReview ?? null,
  };
}
