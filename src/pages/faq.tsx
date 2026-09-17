/**
 * [자주 묻는 질문] 페이지 (/faq)
 * 읽기 전용 화면. 상단 칩으로 태그를 고르고, 제목 행을 누르면 답변이 펼쳐진다.
 */
import { useState } from 'react';

import Messages from '@/assets/icons/messages.svg?react';
import Loading from '@/components/common/loading';
import FaqAccordionItem from '@/components/faq/faqAccordionItem';
import FaqTagChips from '@/components/faq/faqTagChips';
import useFaqs from '@/hooks/faq/useFaqs';
import useInView from '@/hooks/useInView';
import type { TFaqTag } from '@/types/support/TFaq';

export default function Faq() {
  // null = '전체' 칩. 서버에 tag 파라미터를 붙이지 않는 것과 같다.
  const [selectedTag, setSelectedTag] = useState<TFaqTag | null>(null);
  const { data: faqs, isLoading, isError } = useFaqs(selectedTag);
  const [headerRef, headerInView] = useInView();

  return (
    <div className="mx-auto w-full max-w-[1120px] flex flex-col gap-8 lg:gap-12 px-6 lg:px-10 py-10 lg:py-20">
      <div
        ref={headerRef}
        className={`flex flex-col items-center gap-8 lg:gap-12 ${headerInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <Messages className="w-10 h-10 lg:w-20 lg:h-20 shrink-0" />
        <h1 className="text-heading-4 lg:text-heading-2">자주 묻는 질문</h1>
      </div>

      <FaqTagChips selected={selectedTag} onSelect={setSelectedTag} />

      {isLoading && <Loading variant="inline" />}

      {isError && (
        <p className="py-10 text-center text-body-s lg:text-body-m text-coolgray-60">
          질문 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}

      {!isLoading && !isError && faqs && faqs.length === 0 && (
        <p className="py-10 text-center text-body-s lg:text-body-m text-coolgray-60">아직 등록된 질문이 없어요.</p>
      )}

      {!isLoading && !isError && faqs && faqs.length > 0 && (
        <div className="w-full border-t border-coolgray-30">
          {faqs.map((faq) => (
            <FaqAccordionItem key={faq.id} faq={faq} />
          ))}
        </div>
      )}
    </div>
  );
}
