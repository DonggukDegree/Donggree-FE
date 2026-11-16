import { getPointHistories } from '@/apis/point/point';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreInfiniteQuery } from '@/hooks/customQuery';

// [포인트] 내 적립 내역. 최신순 20개씩 "더보기"로 이어 받는다(커서 기반).
export default function usePointHistories() {
  const query = useCoreInfiniteQuery(
    QUERY_KEYS.GET_POINT_HISTORIES,
    (cursor: number | null) => getPointHistories(cursor),
    {
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 0,
    },
  );
  return { ...query, histories: query.data?.pages.flatMap((page) => page.histories) ?? [] };
}
