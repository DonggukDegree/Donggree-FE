/** [울타리치기] 풀이 스톱워치. 판과 따로 1초마다 다시 그려 게임판 전체가 매초 렌더되지 않게 한다. */
import { useEffect, useState } from 'react';

import { formatFenceTime } from '@/utils/fence/fenceGrid';

export default function FenceStopwatch({ startedAt, stoppedAt }: { startedAt: number; stoppedAt: number | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (stoppedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [stoppedAt]);
  const seconds = Math.floor(((stoppedAt ?? now) - startedAt) / 1000);
  return (
    <span className="fence-stopwatch" aria-label={`풀이 시간 ${formatFenceTime(seconds)}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2M10 2h4" strokeLinecap="round" />
      </svg>
      {formatFenceTime(seconds)}
    </span>
  );
}
