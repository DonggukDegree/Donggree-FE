/**
 * [공용] 맨 위로 가기 버튼
 * 모노톤 원형 버튼. 한 화면 이상 내려가면 나타나고, 누르면 맨 위로 부드럽게 올라간다(줄어든 움직임 설정이면 바로 이동).
 * 위치는 화면 오른쪽 아래 떠 있는 버튼 묶음(FloatingActionStack)이 정한다.
 */
import { useEffect, useState } from 'react';

const SHOW_AFTER_PX = 400;

// 떠 있는 원형 버튼의 모양. 배경·테두리 색은 쓰는 곳에서 정한다(기본은 FLOATING_BUTTON_IDLE_CLASS).
export const FLOATING_BUTTON_CLASS =
  'flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border text-coolgray-90 shadow-[0_4px_14px_rgba(17,24,39,0.12)] lg:h-12 lg:w-12';
export const FLOATING_BUTTON_IDLE_CLASS = 'border-coolgray-20 bg-white hover:bg-coolgray-10';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > SHOW_AFTER_PX);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      aria-label="맨 위로"
      tabIndex={isVisible ? 0 : -1}
      onClick={scrollToTop}
      className={`${FLOATING_BUTTON_CLASS} ${FLOATING_BUTTON_IDLE_CLASS} transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
