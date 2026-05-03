import Modal from '@/components/common/modal';
import OnBoardingModal from '@/components/onBoardingModal';
import { useModalStore } from '@/stores/modalStore';

export default function ModalProvider() {
  const { type } = useModalStore();

  if (type === 'alert') return <Modal />;
  if (type === 'onboarding') return <OnBoardingModal />;
  return null;
}
