/**
 * [동아리] 조회 훅
 * 목록은 조건(필터·정렬·찜)별 커서 기반 12개씩, 상세는 고른 동아리만 요청한다.
 */
import { getClubBanners, getClubDetail, getClubs, getMyClubRequestDetail, getMyClubRequests } from '@/apis/club/club';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreInfiniteQuery, useCoreQuery } from '@/hooks/customQuery';
import type { TClubListParams } from '@/types/club/TClub';

// 커서 기반 목록. 12개씩 받고 '더보기'로 다음 묶음을 이어 붙인다. 조건이 바뀌는 동안은 이전 목록을 유지한다.
export function useClubs(params: TClubListParams) {
  const query = useCoreInfiniteQuery(
    QUERY_KEYS.GET_CLUBS(params),
    (cursor: string | null) => getClubs(params, cursor),
    { initialPageParam: null, getNextPageParam: (lastPage) => lastPage.nextCursor, keepPreviousPages: true },
  );
  return {
    ...query,
    clubs: query.data?.pages.flatMap((page) => page.clubs) ?? [],
    totalCount: query.data?.pages[0]?.totalCount ?? 0,
  };
}

export function useClubDetail(clubId: number | null) {
  return useCoreQuery(QUERY_KEYS.GET_CLUB_DETAIL(clubId ?? 0), () => getClubDetail(clubId as number), {
    enabled: clubId !== null,
  });
}

export function useMyClubRequests(enabled: boolean) {
  return useCoreQuery(QUERY_KEYS.GET_MY_CLUB_REQUESTS, getMyClubRequests, { enabled });
}

export function useClubBanners() {
  return useCoreQuery(QUERY_KEYS.GET_CLUB_BANNERS, getClubBanners);
}

// 내 요청 한 건(수정해서 다시 요청할 때). 다른 화면에서 처리 상태가 바뀔 수 있어 열 때마다 새로 받는다.
export function useMyClubRequestDetail(requestId: number | null) {
  return useCoreQuery(
    QUERY_KEYS.GET_MY_CLUB_REQUEST(requestId ?? 0),
    () => getMyClubRequestDetail(requestId as number),
    { enabled: requestId !== null, staleTime: 0 },
  );
}
