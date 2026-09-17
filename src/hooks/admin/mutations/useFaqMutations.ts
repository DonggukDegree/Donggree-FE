import { useQueryClient } from '@tanstack/react-query';

import { deleteAdminFaq, postAdminFaq, putAdminFaq } from '@/apis/support/faq';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import type { TFaqRequest } from '@/types/support/TFaq';

// 등록·수정·삭제 모두 목록 캐시를 통째로 무효화한다.
// 태그가 바뀌면 어느 태그 목록이 영향받는지 특정할 수 없어 접두사 단위로 비운다.
function useInvalidateFaqs() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAQS_ROOT });
}

export function useCreateFaq() {
  const invalidate = useInvalidateFaqs();
  return useCoreMutation<number, TFaqRequest>((body) => postAdminFaq(body), { onSuccess: invalidate });
}

export function useUpdateFaq() {
  const invalidate = useInvalidateFaqs();
  return useCoreMutation<void, { id: number; body: TFaqRequest }>(({ id, body }) => putAdminFaq(id, body), {
    onSuccess: invalidate,
  });
}

export function useDeleteFaq() {
  const invalidate = useInvalidateFaqs();
  return useCoreMutation<void, number>((id) => deleteAdminFaq(id), { onSuccess: invalidate });
}
