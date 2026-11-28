/**
 * [공용] 전역 모달 스위치
 * 레이아웃에 한 번만 놓여, modalStore의 type에 따라 알림/온보딩/관리자 확인/설문/학생 인증 안내/동글맵 튜토리얼 모달 중 하나를 렌더한다.
 * 화면들은 모달 컴포넌트를 직접 그리지 않고 store에 열어 달라고만 요청한다.
 */
import { useEffect } from 'react';

import AdminConfirmModal from '@/components/admin/common/adminConfirmModal';
import Modal from '@/components/common/overlays/modal';
import FenceHelpModal from '@/components/fence/fenceHelpModal';
import FenceResultModal from '@/components/fence/fenceResultModal';
import MapOnboardingModal from '@/components/map/mapOnboardingModal';
import StudentVerificationModal from '@/components/map/studentVerificationModal';
import MysteryHelpModal from '@/components/mystery/mysteryHelpModal';
import MysteryResultModal from '@/components/mystery/mysteryResultModal';
import OnBoardingModal from '@/components/onboarding/onBoardingModal';
import SurveyModal from '@/components/survey/surveyModal';
import { useModalStore } from '@/stores/modalStore';
import { trackOncePerVisit } from '@/utils/analytics/analytics';

export default function ModalProvider() {
  const { type, alertContent } = useModalStore();
  useEffect(() => {
    if (type === 'alert' && alertContent?.analyticsError) {
      const error = alertContent.analyticsError;
      trackOncePerVisit('error_shown', error, alertContent.analyticsDisplayId);
    }
    if (type === 'alert' && alertContent?.analyticsNotice) {
      trackOncePerVisit('transcript_notice_shown', alertContent.analyticsNotice, alertContent.analyticsDisplayId);
    }
  }, [type, alertContent]);

  if (type === 'alert') return <Modal />;
  if (type === 'onboarding') return <OnBoardingModal />;
  if (type === 'confirm') return <AdminConfirmModal />;
  if (type === 'survey') return <SurveyModal />;
  if (type === 'studentVerification') return <StudentVerificationModal />;
  if (type === 'mysteryResult') return <MysteryResultModal />;
  if (type === 'mysteryHelp') return <MysteryHelpModal />;
  if (type === 'fenceResult') return <FenceResultModal />;
  if (type === 'fenceHelp') return <FenceHelpModal />;
  if (type === 'mapOnboarding') return <MapOnboardingModal />;
  return null;
}
