/**
 * [공용] React Query 전역 기본 정책
 * QueryClient와 useCoreQuery가 같은 값을 보게 한곳에 모아 둔다.
 * 이 파일이 유일한 출처이므로, 누가 useQuery를 직접 쓰더라도 정책이 새어 나가지 않는다.
 */
import { getErrorStatus } from '@/utils/error';

// 조회 결과를 신선하다고 볼 시간. 관리자 목록·리포트 모두 초 단위로 바뀌는 데이터가 아니다.
export const QUERY_STALE_TIME = 1000 * 60 * 5;

/**
 * 4xx(인증 실패·리소스 없음 등)는 재시도해도 결과가 같아 backoff 지연만 늘어나므로 즉시 중단한다.
 * 특히 401은 이미 axios 인터셉터가 refresh를 시도한 "최종 실패"라 여기서 또 재시도할 이유가 없다.
 * 서버 오류(5xx)·네트워크 오류 같은 일시적 실패만 최대 3회 재시도한다.
 */
export const retryOnlyTransientFailure = (failureCount: number, error: unknown) => {
  const status = getErrorStatus(error);
  if (status && status >= 400 && status < 500) return false;
  return failureCount < 3;
};

export const QUERY_CLIENT_DEFAULT_OPTIONS = {
  queries: {
    staleTime: QUERY_STALE_TIME,
    retry: retryOnlyTransientFailure,
    /**
     * 창을 다시 포커스할 때마다 전 화면이 재요청하는 기본 동작을 끈다.
     * 졸업 판정·관리자 데이터는 다른 탭을 보는 사이에 바뀌지 않는다. 바뀌는 시점(저장·업로드)에는
     * 각 mutation이 invalidateQueries로 명시적으로 무효화하므로 포커스 재조회가 대신할 일이 없다.
     */
    refetchOnWindowFocus: false,
  },
} as const;
