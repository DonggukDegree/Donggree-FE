/** [라우팅 > 분석] 실제 화면이 마운트된 뒤에만 조회를 기록하는 경계 */
import type { ReactNode } from 'react';

import usePageTracking from '@/hooks/usePageTracking';

export default function TrackedPage({ children }: { children: ReactNode }) {
  usePageTracking();
  return children;
}
