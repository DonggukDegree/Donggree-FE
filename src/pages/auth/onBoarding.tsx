/**
 * [온보딩] 페이지 (/onboarding)
 * 학번·이름을 받는 온보딩 모달을 띄우기 위한 빈 화면.
 * 온보딩을 마치지 않은 회원은 ProtectedRoute가 이 경로로 강제 이동시키며, 모달은 닫을 수 없다.
 */
import { useEffect } from 'react';

import { useModalStore } from '@/stores/modalStore';

export default function OnBoarding() {
  const { openOnboarding } = useModalStore();

  useEffect(() => {
    openOnboarding();
  }, [openOnboarding]);

  return <div className="flex-1 bg-white" />;
}
