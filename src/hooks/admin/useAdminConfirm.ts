import { useModalStore } from '@/stores/modalStore';

// [관리자 > 신고 관리] 숨김·처리·기각·되돌리기·정지 해제는 누르자마자 반영되므로 공용 확인 모달을 한 번 거친다.
export default function useAdminConfirm() {
  const openConfirm = useModalStore((state) => state.openConfirm);
  return ({
    action,
    description,
    confirmText,
    danger = false,
    onConfirm,
  }: {
    action: string;
    description?: string;
    confirmText: string;
    danger?: boolean;
    onConfirm: () => void;
  }) =>
    openConfirm({
      title: '신고 관리',
      action,
      description,
      confirmText,
      confirmVariant: danger ? 'alert' : 'primary',
      onConfirm,
    });
}
