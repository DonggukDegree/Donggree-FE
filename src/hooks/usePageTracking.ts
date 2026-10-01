/** [공통 > 분석] 레이아웃 밖 로그인·콜백까지 포함하는 라우터 방문 추적 */
import { useEffect } from 'react';

import { router } from '@/routes';
import { trackPageView } from '@/utils/analytics';

export default function usePageTracking() {
  useEffect(() => {
    const record = () => {
      const { location } = router.state;
      trackPageView(location.pathname, location.key);
    };
    record();
    return router.subscribe(record);
  }, []);
}
