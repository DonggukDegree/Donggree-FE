/**
 * [동글맵] 학생 인증 안내 모달
 * 미인증 회원이 장소 등록 등 쓰기 버튼을 누르거나 서버가 PLACE403_1을 돌려주면 띄운다.
 * 학교 이메일·성적표 두 인증 경로를 대등하게 한 줄에 두고, 닫기는 그 아래에 둔다.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/common/inputs/button';
import { useModalStore } from '@/stores/modalStore';
import { trackEvent } from '@/utils/analytics/analytics';

export default function StudentVerificationModal() {
  const navigate = useNavigate();
  const closeModal = useModalStore((state) => state.closeModal);

  useEffect(() => {
    trackEvent('student_verification_shown');
  }, []);

  const goTo = (method: 'school_email' | 'transcript') => {
    trackEvent('student_verification_select', { verification_method: method });
    closeModal();
    if (method === 'school_email') navigate('/my-page/school-email-verification', { state: { returnTo: '/map' } });
    else navigate('/upload');
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-overlay p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-verification-title"
        className="flex w-full max-w-120 flex-col items-center gap-6 rounded-2xl bg-white p-6 lg:p-10"
      >
        <div className="flex flex-col items-center gap-2 text-center text-coolgray-90">
          <h2 id="student-verification-title" className="text-heading-5 lg:text-heading-4">
            학생 인증이 필요해요
          </h2>
          <p className="break-keep text-body-s lg:text-body-m">장소 등록과 리뷰는 인증된 동국대 학생만 할 수 있어요.</p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full gap-2">
            <Button className="flex-1 break-keep" onClick={() => goTo('school_email')}>
              학교 이메일 인증하기
            </Button>
            <Button className="flex-1 break-keep" onClick={() => goTo('transcript')}>
              성적표로 인증하기
            </Button>
          </div>
          <Button variant="outlined" className="w-full" onClick={closeModal}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
