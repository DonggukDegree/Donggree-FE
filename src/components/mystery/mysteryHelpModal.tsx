/** [정각원의 비밀] 공통 일일 문제·추리별 단서·참여 기준을 안내하는 게임 방법 모달. */
import '@/pages/mystery/mystery.css';

import { useEffect, useRef } from 'react';

import { useModalStore } from '@/stores/modalStore';

export default function MysteryHelpModal() {
  const close = useModalStore((state) => state.closeModal);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const panel = dialog.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // 네이티브 모달의 배경 비활성화·포커스 제한·Escape 처리를 사용한다.
    panel?.showModal();
    return () => {
      panel?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="mystery-help-title"
      className="mystery-help font-pretendard text-body-s backdrop:bg-overlay"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="mystery-help-content">
        <header className="mystery-help-heading">
          <h2 id="mystery-help-title" className="text-heading-5">
            게임 방법
          </h2>
          <button type="button" className="mystery-help-close" aria-label="게임 방법 닫기" onClick={close}>
            ×
          </button>
        </header>
        <div className="mystery-help-body text-coolgray-60">
          <p>
            매일 자정에 새로운 문제 하나가 열리고, 그날은 모두가 같은 문제를 풀어요. 단서는 각자가 제출한 추리에 따라
            달라져요. 결과를 공유해 누가 더 적은 시도로 같은 문제를 해결했는지 비교해 보세요.
          </p>
          <p>
            세 덱에서 카드를 한 장씩 골라 10회 안에 정답을 맞히세요. 마우스를 올리거나 카드를 터치하면 자세히 볼 수
            있어요.
          </p>
          <p>
            오답을 제출하면 추리 문장에서 선택한 학과·장소·수단 중 한 항목과 관련된 참인 단서 하나가 두루마리로
            공개돼요. 제출한 선택지를 제외하거나 정답이 포함된 후보를 알려주니, 단서를 반영해 다음 추리 문장을 완성해
            보세요.
          </p>
          <p>맞은 개수나 항목별 정오 여부는 알려주지 않아요.</p>
          <p>로그인 없이도 같은 문제를 풀 수 있어요. 로그인하면 정답을 맞힐 때 하루에 한 번 10P가 적립돼요.</p>
          <p>
            로그인 회원은 성공하거나 10회 추리를 마치면 참여일로 인정돼요. 미완료로 자정을 넘기거나 하루를 쉬면 스트릭과
            통계가 초기화돼요.
          </p>
        </div>
      </div>
    </dialog>
  );
}
