import { useEffect } from 'react';

// 저장하지 않은 작성 내용이 있을 때 새로고침·탭 닫기 전에 브라우저 확인 창을 띄운다.
// 브라우저가 문구를 직접 정하므로 메시지는 지정하지 않는다.
export default function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // 일부 브라우저는 returnValue가 있어야 확인 창을 띄운다.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
}
