// TODO: 피드백 폼 모달 구현
// - 입력 필드 (textarea 등)
// - 자체 useState로 입력 상태 관리
// - 제출 시 API 호출 후 closeModal()
// - 취소 버튼은 closeModal()만 호출

import { useModalStore } from '@/stores/modalStore';

export default function FeedbackModal() {
  const {
    // closeModal,
    type,
  } = useModalStore();
  if (type !== 'feedback') return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-overlay">
      <div className="w-200 rounded-2xl bg-white p-12 flex flex-col items-center justify-center gap-10">
        {/* TODO: 폼 내용 구현 */}
      </div>
    </div>
  );
}
