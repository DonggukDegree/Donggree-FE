/** [홈 > 만족도 조사] 로그인당 안내 모달과 브라우저 기준 다시 보지 않음 */
import { useEffect, useRef } from 'react';

import Button from '@/components/common/button';
import { SATISFACTION_SURVEY_URL } from '@/constants/links';
import { useModalStore } from '@/stores/modalStore';
import { dismissSurveyPermanently } from '@/utils/surveyPrompt';

export default function SurveyModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeModal = useModalStore((state) => state.closeModal);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    // 네이티브 모달로 배경 접근·포커스 이탈을 막고 Escape 닫기를 지원한다.
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  const participate = () => {
    if (!SATISFACTION_SURVEY_URL) return;
    window.open(SATISFACTION_SURVEY_URL, '_blank', 'noopener,noreferrer');
    closeModal();
  };

  const neverShowAgain = () => {
    dismissSurveyPermanently();
    closeModal();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="survey-title"
      aria-describedby="survey-description"
      onCancel={closeModal}
      className="m-auto w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border-0 bg-white p-6 lg:p-8 text-coolgray-90 shadow-xl animate-fade-in motion-reduce:animate-none backdrop:bg-overlay backdrop:animate-fade-in motion-reduce:backdrop:animate-none"
    >
      <div className="flex flex-col gap-6 text-center">
        <div className="flex flex-col gap-3">
          <h2 id="survey-title" className="text-heading-5 lg:text-heading-4">
            동그리, 도움이 되었나요?
          </h2>
          <p id="survey-description" className="text-body-s lg:text-body-m text-coolgray-60">
            더 나은 졸업 리포트를 만들 수 있도록
            <br />
            여러분의 의견을 들려주세요.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex w-full gap-3">
            <Button type="button" variant="outlined" className="flex-1" onClick={closeModal} autoFocus>
              나중에
            </Button>
            <Button type="button" className="flex-1" onClick={participate} disabled={!SATISFACTION_SURVEY_URL}>
              설문 참여하기
            </Button>
          </div>
          <button
            type="button"
            onClick={neverShowAgain}
            className="px-2 py-2 text-body-xs text-coolgray-60 underline underline-offset-4 hover:text-coolgray-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary-60"
          >
            다시 보지 않음
          </button>
        </div>
      </div>
    </dialog>
  );
}
