import Modal from '@/components/common/modal';
import FeedbackModal from '@/components/feedbackModal';
import { useModalStore } from '@/stores/modalStore';

export default function ModalProvider() {
  const { type } = useModalStore();

  if (type === 'alert') return <Modal />;
  if (type === 'feedback') return <FeedbackModal />;
  return null;
}
