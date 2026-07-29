/**
 * [공통 > 분석] SPA 라우트 변경 페이지뷰 추적 훅
 * CSR은 물리적 새로고침 없이 경로만 바뀌므로, location 변경을 감지해 GA4 페이지뷰를 수동 전송한다.
 * 공통 레이아웃(Layout)에서 한 번 장착한다.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { trackPageView } from '@/utils/analytics';

export default function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // 검색 파라미터까지 포함해 경로별 유입을 구분한다.
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
