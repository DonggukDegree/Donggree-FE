/** [정각원의 비밀] 스트릭 등급을 나타내는 연꽃. 색뿐 아니라 별도 등급명도 제공한다. */
import { useId } from 'react';

import type { TMysteryTier } from '@/types/mystery/TMystery';

const colors: Record<TMysteryTier, [string, string, string]> = {
  BRONZE: ['#f4d6b5', '#bd8656', '#785132'],
  SILVER: ['#f2f5f8', '#b8c5d1', '#718397'],
  GOLD: ['#fff0b1', '#e1b448', '#a57822'],
  DIAMOND: ['#e6fdff', '#8ad7e5', '#5188ac'],
};
export default function LotusBadge({ tier }: { tier: TMysteryTier }) {
  const id = useId();
  const [light, mid, dark] = colors[tier];
  return (
    <svg viewBox="0 0 200 150" className="mystery-lotus" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2=".5" y2="1">
          <stop stopColor={light} />
          <stop offset=".65" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="135" rx="64" ry="5" fill={mid} opacity=".12" />
      <g fill={`url(#${id})`} stroke={dark} strokeWidth="1.2" strokeLinejoin="round">
        <path d="M100 121C53 133 18 107 13 66C58 63 88 83 100 121Z" />
        <path d="M100 121C147 133 182 107 187 66C142 63 112 83 100 121Z" />
        <path d="M100 123C57 112 38 73 47 35C86 50 103 82 100 123Z" />
        <path d="M100 123C143 112 162 73 153 35C114 50 97 82 100 123Z" />
        <path d="M100 124C69 100 68 57 100 13C132 57 131 100 100 124Z" />
        <path d="M100 125C76 135 45 127 29 111C58 98 82 104 100 125Z" />
        <path d="M100 125C124 135 155 127 171 111C142 98 118 104 100 125Z" />
      </g>
      <path d="M100 34V110" stroke="white" strokeWidth="1.5" opacity=".48" />
      {tier === 'DIAMOND' && (
        <g fill={dark}>
          <path d="m166 16 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
          <path d="m24 38 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
        </g>
      )}
    </svg>
  );
}
