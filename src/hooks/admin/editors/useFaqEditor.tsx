/**
 * [관리자 > FAQ 관리] 화면 컨트롤러 훅
 * 폼 상태·검증·저장·삭제를 모아 둔다. 페이지와 컴포넌트는 배치와 표현만 담당한다.
 *
 * 폼 하나를 등록/수정 겸용으로 쓴다. editingId가 null이면 등록, 값이 있으면 그 글을 수정한다.
 * 저장·삭제는 DB에 즉시 반영되므로 다른 관리자 화면과 동일하게 확인 모달을 한 번 거친다.
 */
import { useState } from 'react';
import { toast } from 'sonner';

import { FAQ_TAG_LABEL } from '@/constants/faq';
import { useCreateFaq, useDeleteFaq, useUpdateFaq } from '@/hooks/admin/mutations/useFaqMutations';
import useFaqs from '@/hooks/faq/useFaqs';
import { useModalStore } from '@/stores/modalStore';
import type { TFaq, TFaqTag } from '@/types/support/TFaq';

// 폼 입력 상태(UI 전용).
export type TFaqFormState = {
  tag: TFaqTag;
  title: string;
  content: string;
};

// 제목 길이 상한. 서버 @Size(max = 200)과 같은 값이라 여기서 먼저 막는다.
export const FAQ_TITLE_MAX_LENGTH = 200;

// 새 글의 기본 선택 태그. 초기 FAQ는 대부분 서비스 사용법이라 SERVICE로 둔다.
// 서버는 tag 누락을 400으로 거부하므로(기본값으로 대신 채우지 않는다) 폼에서 항상 하나가 선택돼 있어야 한다.
// TFaqFormState.tag가 non-nullable이라 비어 있는 상태 자체가 만들어지지 않는다.
const EMPTY_FORM: TFaqFormState = { tag: 'SERVICE', title: '', content: '' };

export default function useFaqEditor() {
  // 관리자는 항상 전체 목록을 본다. 태그 필터는 사용자 화면 전용이다.
  const { data: faqs = [], isLoading, isError } = useFaqs(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TFaqFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TFaqFormState, string>>>({});

  const openConfirm = useModalStore((state) => state.openConfirm);
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();

  const isSaving = createFaq.isPending || updateFaq.isPending || deleteFaq.isPending;
  const isEditing = editingId !== null;

  const changeField = <K extends keyof TFaqFormState>(field: K, value: TFaqFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // 입력을 고치는 순간 해당 칸의 에러는 지운다.
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  // 목록에서 한 건을 골라 폼으로 올린다.
  const startEdit = (faq: TFaq) => {
    setEditingId(faq.id);
    setForm({ tag: faq.tag, title: faq.title, content: faq.content });
    setErrors({});
    // 폼은 목록 위에 있으므로 화면을 올려 편집 중인 내용이 보이게 한다.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validate = () => {
    const next: Partial<Record<keyof TFaqFormState, string>> = {};
    if (!form.title.trim()) next.title = '제목을 입력해주세요.';
    else if (form.title.trim().length > FAQ_TITLE_MAX_LENGTH)
      next.title = `제목은 ${FAQ_TITLE_MAX_LENGTH}자 이하여야 합니다.`;
    if (!form.content.trim()) next.content = '본문을 입력해주세요.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    const body = { tag: form.tag, title: form.title.trim(), content: form.content.trim() };
    const onSuccess = () => {
      toast.success(isEditing ? 'FAQ를 수정했습니다.' : 'FAQ를 등록했습니다.');
      reset();
    };

    openConfirm({
      title: 'FAQ 관리',
      action: isEditing ? '이 내용으로 수정할까요?' : '이 내용으로 등록할까요?',
      description: '저장 즉시 사용자 화면에 반영됩니다.',
      details: (
        <div className="flex flex-col gap-1 text-body-s text-coolgray-90">
          <p>
            <span className="font-semibold">태그</span> · {FAQ_TAG_LABEL[body.tag]}
          </p>
          <p>
            <span className="font-semibold">제목</span> · {body.title}
          </p>
        </div>
      ),
      confirmText: isEditing ? '수정' : '등록',
      onConfirm: () => {
        if (editingId === null) createFaq.mutate(body, { onSuccess });
        else updateFaq.mutate({ id: editingId, body }, { onSuccess });
      },
    });
  };

  const remove = (faq: TFaq) => {
    openConfirm({
      title: 'FAQ 삭제',
      action: '이 질문을 삭제할까요?',
      description: '삭제하면 되돌릴 수 없습니다.',
      details: <p className="text-body-s text-coolgray-90">{faq.title}</p>,
      confirmText: '삭제',
      confirmVariant: 'alert',
      onConfirm: () => {
        deleteFaq.mutate(faq.id, {
          onSuccess: () => {
            toast.success('FAQ를 삭제했습니다.');
            // 편집 중이던 글이 사라졌다면 폼도 비운다.
            if (editingId === faq.id) reset();
          },
        });
      },
    });
  };

  return {
    faqs,
    isLoading,
    isError,
    form,
    errors,
    editingId,
    isEditing,
    isSaving,
    changeField,
    startEdit,
    reset,
    submit,
    remove,
  };
}
