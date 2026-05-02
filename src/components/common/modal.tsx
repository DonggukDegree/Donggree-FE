import Button from '@/components/common/button';
import { useModalStore } from '@/stores/modalStore';

export default function Modal() {
  const { alertContent, closeModal, type } = useModalStore();

  if (type !== 'alert' || !alertContent) return null;

  const { icon: Icon, title, subtitle, description, buttonText, onConfirm } = alertContent;

  const handleConfirm = () => {
    onConfirm?.();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-overlay">
      <div className="w-200 rounded-2xl bg-white p-12 flex flex-col items-center justify-center gap-10">
        <Icon className="w-[124px] h-[124px]" />
        <div className="flex flex-col items-center gap-4 text-coolgray-90 text-center">
          <h2 className="text-heading-2">{title}</h2>
          <h4 className="text-heading-4">{subtitle}</h4>
          <p className="text-body-l whitespace-pre-line">{description}</p>
        </div>
        <Button className="w-40" onClick={handleConfirm}>
          {buttonText ?? '닫기'}
        </Button>
      </div>
    </div>
  );
}
