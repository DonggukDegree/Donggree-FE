/**
 * [울타리치기] 판을 만드는 동안의 로딩
 * 네 점이 차례로 초록 울타리로 이어지며 작은 고리를 만들고, 안에서 새싹이 고개를 내민다.
 * 대부분 금방 끝나므로 잠깐(0.3초) 기다려도 판이 없을 때만 보여 깜빡임을 막는다.
 */
import { useEffect, useState } from 'react';

const LOADING_DOTS = [
  { id: 1, x: 0, y: 0 },
  { id: 2, x: 200, y: 0 },
  { id: 3, x: 200, y: 200 },
  { id: 4, x: 0, y: 200 },
];

export default function FenceLoading() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 300);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return <div className="fence-loading" aria-hidden="true" />;
  return (
    <div className="fence-loading" role="status" aria-live="polite">
      <svg className="fence-loading-art" viewBox="-60 -60 320 320" aria-hidden="true">
        <g className="fence-loading-sprout">
          <path d="M100 155V105" />
          <path d="M100 118C80 118 68 104 68 88C88 88 100 100 100 118Z" />
          <path d="M100 110C122 110 136 94 136 76C112 76 100 90 100 110Z" />
        </g>
        <line className="fence-loading-line fence-loading-line--1" x1="0" y1="0" x2="200" y2="0" pathLength={1} />
        <line className="fence-loading-line fence-loading-line--2" x1="200" y1="0" x2="200" y2="200" pathLength={1} />
        <line className="fence-loading-line fence-loading-line--3" x1="200" y1="200" x2="0" y2="200" pathLength={1} />
        <line className="fence-loading-line fence-loading-line--4" x1="0" y1="200" x2="0" y2="0" pathLength={1} />
        {LOADING_DOTS.map(({ id, x, y }) => (
          <circle key={id} className={`fence-loading-dot fence-loading-dot--${id}`} cx={x} cy={y} r={13} />
        ))}
      </svg>
      <p className="text-body-s text-coolgray-60">울타리 재료를 모으는 중…</p>
    </div>
  );
}
