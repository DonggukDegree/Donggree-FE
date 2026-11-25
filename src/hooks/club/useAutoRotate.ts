/**
 * [동아리] 자동 넘김 순번
 * 카드 사진(2초)·상단 배너처럼 여러 장을 일정 간격으로 넘길 때 쓴다.
 * 한 장 이하이거나 멈춤(마우스 올림 등)·줄어든 움직임 설정이면 넘기지 않는다. 직접 넘기면 간격을 다시 센다.
 */
import { useEffect, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function useAutoRotate(count: number, intervalMs: number, paused = false) {
  const [index, setIndex] = useState(0);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (count <= 1 || paused || reduced) return;
    const timer = window.setInterval(() => setIndex((prev) => (prev + 1) % count), intervalMs);
    return () => window.clearInterval(timer);
  }, [count, intervalMs, paused, reduced, index]);

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return { index: count > 0 ? index % count : 0, go };
}
