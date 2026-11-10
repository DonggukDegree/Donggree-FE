/**
 * [FAQ] 아코디언 한 줄
 * 제목 행을 누르면 본문이 슬라이드로 펼쳐지고, 다시 누르면 닫힌다.
 *
 * 높이 애니메이션은 max-height 대신 grid-template-rows(0fr → 1fr)를 쓴다.
 * 본문 길이가 글마다 달라 max-height 상한을 고정하면 긴 답변이 잘리기 때문.
 */
import { useId, useState } from 'react';

import type { TFaq } from '@/types/support/TFaq';

interface IFaqAccordionItemProps {
  faq: TFaq;
}

export default function FaqAccordionItem({ faq }: IFaqAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="w-full border-b border-coolgray-30">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 lg:gap-4 py-5 lg:py-6 text-left cursor-pointer group"
      >
        <span className="text-heading-6 lg:text-heading-5 text-primary-60 shrink-0">Q.</span>
        <span className="flex-1 text-body-m lg:text-body-l text-coolgray-90 group-hover:text-primary-60 transition-colors duration-200">
          {faq.title}
        </span>
        {/* 펼침 상태를 알려 주는 꺽쇠. 열리면 180도 돌아 위를 향한다. */}
        <svg
          className={`w-5 h-5 shrink-0 text-coolgray-60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          {/* 본문은 평문이라 줄바꿈만 살려서 그대로 렌더한다. */}
          <div className="flex gap-3 lg:gap-4 pb-5 lg:pb-6">
            <span className="text-heading-6 lg:text-heading-5 text-coolgray-60 shrink-0">A.</span>
            <p className="flex-1 whitespace-pre-line text-body-s lg:text-body-m text-coolgray-60">{faq.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
