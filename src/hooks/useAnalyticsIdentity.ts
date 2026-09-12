/**
 * [공통 > 분석] GA4 사용자 식별 훅
 * 액세스 토큰의 memberId를 GA4 user_id로 심어, 같은 사람이 폰·노트북을 오가도 한 명으로 집계되게 한다.
 * 이게 없으면 활성 사용자가 브라우저(client_id) 단위라 DAU/MAU가 부풀고, MAU가 더 크게 부풀어
 * DAU/MAU 비율이 실제보다 낮게 나온다.
 *
 * 공통 레이아웃(Layout)에서 한 번 장착한다. 토큰은 메모리 store에만 있어 새로고침마다 재발급되므로,
 * 토큰이 바뀔 때마다(로그인·재발급·로그아웃) 다시 심는다.
 */
import { useEffect } from 'react';

import { useAuthStore } from '@/stores/authStore';
import { setUserId } from '@/utils/analytics';
import { getMemberIdFromAccessToken } from '@/utils/authRole';

export default function useAnalyticsIdentity() {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // 로그아웃(토큰 null)이면 memberId도 null이 되어 user_id 연결이 끊긴다.
    setUserId(getMemberIdFromAccessToken(accessToken));
  }, [accessToken]);
}
