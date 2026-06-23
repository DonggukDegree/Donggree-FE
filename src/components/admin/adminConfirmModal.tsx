import Button from '@/components/common/button';
import { useModalStore } from '@/stores/modalStore';

export default function AdminConfirmModal() {
  const { confirmContent, closeModal, type } = useModalStore();

  if (type !== 'confirm' || !confirmContent) return null;

  const {
    title,
    action,
    description,
    details,
    confirmText = '확인',
    cancelText = '취소',
    confirmVariant = 'primary',
    onConfirm,
  } = confirmContent;

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay px-6">
      <div className="flex w-full max-w-xl flex-col gap-8 rounded-2xl bg-white p-10 text-coolgray-90 shadow-xl">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <h2 className="text-heading-4">{title}</h2>
            <p className="text-heading-6 text-coolgray-90">{action}</p>
          </div>
          {description && <p className="text-body-m text-coolgray-60">{description}</p>}
        </div>

        {details && <div className="rounded-xl border border-primary-60/30 bg-primary-30 p-5">{details}</div>}

        <div className="flex justify-end gap-3">
          <Button variant="outlined" className="w-32" onClick={closeModal}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} className="w-32" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
