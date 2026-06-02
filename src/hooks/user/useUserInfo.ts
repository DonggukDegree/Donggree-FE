import { getUserInfo } from '@/apis/user/user';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// 사용자 정보 조회 훅
// 라우팅 게이트(인증/온보딩 판단)와 화면 표시에 함께 쓰이므로
// data뿐 아니라 isPending/isError 등 query 상태 전체를 반환한다.
export default function useUserInfo() {
  return useCoreQuery(QUERY_KEYS.GET_USER_INFO, () => getUserInfo());
}
