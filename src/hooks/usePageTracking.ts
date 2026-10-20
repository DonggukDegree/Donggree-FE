/** [공통 > 분석] 가드와 지연 로딩을 통과한 화면의 방문만 기록한다. */
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { trackPageView } from '@/utils/analytics/analytics';

export default function usePageTracking() {
  const { pathname, key } = useLocation();
  // 하위 화면의 행동·오류 effect보다 먼저 방문 ID와 제목을 준비한다.
  useLayoutEffect(() => {
    trackPageView(pathname, key);
  }, [pathname, key]);
}
