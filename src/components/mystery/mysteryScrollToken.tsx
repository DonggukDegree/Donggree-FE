/** [정각원의 비밀] 봉인 전후의 천 리본과 나무 마개를 그린 작은 두루마리. */
import { useId } from 'react';

export default function MysteryScrollToken({ opened }: { opened: boolean }) {
  const id = useId();
  return (
    <svg className="mystery-scroll-roll" viewBox="0 0 56 116" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#c9aa72" />
          <stop offset=".2" stopColor="#f0d9a7" />
          <stop offset=".48" stopColor="#fff0c8" />
          <stop offset=".8" stopColor="#ecd19b" />
          <stop offset="1" stopColor="#b99860" />
        </linearGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#8e6136" />
          <stop offset=".45" stopColor="#c49a61" />
          <stop offset="1" stopColor="#8e6136" />
        </linearGradient>
      </defs>
      <rect x="25" y="2" width="6" height="109" rx="2.5" fill="#9a7548" />
      <rect x="11" y="8" width="34" height="6" rx="3" fill={`url(#${id}-wood)`} />
      <path d="M13 14Q28 11 43 14L43 99Q28 102 13 99Z" fill={`url(#${id}-paper)`} stroke="#b49765" strokeWidth=".8" />
      <path d="M38 15Q36 56 39 98M17 17Q18 55 17 96" fill="none" stroke="#bd9d6660" strokeWidth=".7" />
      <rect x="11" y="99" width="34" height="6" rx="3" fill={`url(#${id}-wood)`} />
      {opened ? (
        <g stroke="#925447" strokeWidth=".7" strokeLinejoin="round">
          <path d="M12 53Q28 60 44 52L44 56Q27 64 12 57Z" fill="#b67662" />
          <path d="M15 55C5 63 13 70 7 82L13 78L17 82C22 68 10 64 20 59Z" fill="#b67662" />
          <path d="M40 55C52 55 39 68 46 79L49 73L54 74C47 66 57 56 45 52Z" fill="#c58b74" />
        </g>
      ) : (
        <g stroke="#925447" strokeWidth=".7" strokeLinejoin="round">
          <path d="M12 54Q28 57 44 54V60Q28 63 12 60Z" fill="#ad6955" />
          <path d="M26 59L20 77L26 74L30 78L31 59Z" fill="#b77965" />
          <path d="M29 59L35 76L37 71L42 73L34 57Z" fill="#c88b74" />
          <path d="M28 56C20 43 6 45 12 53C16 58 22 59 28 56Z" fill="#c88b74" />
          <path d="M28 56C36 43 50 45 44 53C40 58 34 59 28 56Z" fill="#b77965" />
          <path d="M15 49Q19 48 24 54M41 49Q37 48 32 54" fill="none" stroke="#e1b29a" />
          <rect x="25" y="53" width="7" height="9" rx="2.5" fill="#ad6955" />
        </g>
      )}
    </svg>
  );
}
