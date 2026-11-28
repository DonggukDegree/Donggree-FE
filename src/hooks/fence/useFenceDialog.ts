/** [울타리치기] 네이티브 모달 dialog 열기·닫기와 배경 스크롤 잠금, 닫은 뒤 포커스 복귀. */
import { useEffect, useRef } from 'react';

export default function useFenceDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const panel = dialog.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel?.showModal();
    return () => {
      panel?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return dialog;
}
