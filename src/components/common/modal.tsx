/**
 * [공용] 알림(alert) 모달
 * 아이콘 + 제목 + 설명 + 버튼 하나로 된 안내 모달. 업로드 실패 안내, 탈퇴 확인 등에 쓴다.
 * 내용은 modalStore.openAlert로 넣고, 렌더 여부는 ModalProvider가 정한다.
 */
import Button from '@/components/common/button';
import { useModalStore } from '@/stores/modalStore';

export default function Modal() {
  const { alertContent, closeModal, type } = useModalStore();

  if (type !== 'alert' || !alertContent) return null;

  const { icon: Icon, title, subtitle, description, buttonText, buttonVariant, onConfirm } = alertContent;

  const handleConfirm = () => {
    onConfirm?.();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-overlay p-4 lg:p-0">
      {/*
        모바일에서는 뷰포트 폭을 따르되 셸과 같은 640px 상한을 둬 iPad에서도 너무 넓어지지 않게 한다.
        내용이 길면 화면 밖으로 밀리지 않도록 모달 안에서만 세로 스크롤한다.
      */}
      <div className="w-full max-w-160 max-h-[90dvh] overflow-y-auto lg:w-200 lg:max-w-none rounded-2xl bg-white p-6 lg:p-12 flex flex-col items-center justify-center gap-6 lg:gap-10">
        <Icon className="w-10 h-10 lg:w-[124px] lg:h-[124px] shrink-0" />
        <div className="flex flex-col items-center gap-3 lg:gap-4 text-coolgray-90 text-center">
          <h2 className="text-heading-4 lg:text-heading-2">{title}</h2>
          <h4 className="text-heading-6 lg:text-heading-4">{subtitle}</h4>
          <p className="text-body-s lg:text-body-l whitespace-pre-line">{description}</p>
        </div>
        <Button variant={buttonVariant} className="w-40 max-w-full shrink-0" onClick={handleConfirm}>
          {buttonText ?? '닫기'}
        </Button>
      </div>
    </div>
  );
}
