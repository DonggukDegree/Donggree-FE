import { getUserInfo } from '@/apis/user/user';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// 사용자 정보 조회 훅
// 라우팅 게이트(인증/온보딩 판단)와 화면 표시에 함께 쓰이므로
// data뿐 아니라 isPending/isError 등 query 상태 전체를 반환한다.
export default function useUserInfo() {
  // 인증 게이트는 빠르게 판단해야 하므로 재시도하지 않는다.
  // (네트워크/5xx 실패 시 3회 backoff를 기다리지 않고 즉시 에러 화면으로 분기 — 호출부에서 처리)
  return useCoreQuery(QUERY_KEYS.GET_USER_INFO, () => getUserInfo(), { retry: false });
}
