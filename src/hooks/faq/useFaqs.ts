import { getFaqs } from '@/apis/support/faq';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';
import type { TFaqTag } from '@/types/support/TFaq';

// FAQ 목록 조회 훅. tag가 null이면 전체를 가져온다.
// 로그인 없이도 호출 가능한 공개 API라 인증 상태와 무관하게 동작한다.
export default function useFaqs(tag: TFaqTag | null) {
  return useCoreQuery(QUERY_KEYS.GET_FAQS(tag), () => getFaqs(tag));
}
