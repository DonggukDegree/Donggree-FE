/** [정각원의 비밀] 서버가 알려 준 다음 KST 문제 교체 시각까지의 실시간 카운트다운. */
import { useEffect, useState } from 'react';

import { mysteryCountdown } from '@/utils/mystery/mystery';

export default function MysteryCountdown({ resetAt }: { resetAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return (
    <p className="mystery-countdown">
      <span>다음 문제까지</span>
      <span role="timer" aria-live="off" className="mystery-gold-text">
        {mysteryCountdown(resetAt, now)}
      </span>
    </p>
  );
}
