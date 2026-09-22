/**
 * [공용] 전역 모달 스위치
 * 레이아웃에 한 번만 놓여, modalStore의 type에 따라 알림/온보딩/관리자 확인/설문 모달 중 하나를 렌더한다.
 * 화면들은 모달 컴포넌트를 직접 그리지 않고 store에 열어 달라고만 요청한다.
 */
import AdminConfirmModal from '@/components/admin/common/adminConfirmModal';
import Modal from '@/components/common/modal';
import OnBoardingModal from '@/components/onboarding/onBoardingModal';
import SurveyModal from '@/components/survey/surveyModal';
import { useModalStore } from '@/stores/modalStore';

export default function ModalProvider() {
  const { type } = useModalStore();

  if (type === 'alert') return <Modal />;
  if (type === 'onboarding') return <OnBoardingModal />;
  if (type === 'confirm') return <AdminConfirmModal />;
  if (type === 'survey') return <SurveyModal />;
  return null;
}
