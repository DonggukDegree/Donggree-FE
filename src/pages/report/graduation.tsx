/** [졸업 판정] 저장된 내 성적표 조회와 진입 오류 처리 */
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import Warning from '@/assets/icons/warning.svg?react';
import Loading from '@/components/common/loading';
import GraduationReport from '@/components/report/graduationReport';
import { ERROR_CODE } from '@/constants/errorCodes';
import { UNSUPPORTED_CURRICULUM_MODAL } from '@/constants/report/reportModals';
import useReportSummary from '@/hooks/report/useReportSummary';
import NotFound from '@/pages/exception/notFound';
import { useModalStore } from '@/stores/modalStore';
import { trackEvent } from '@/utils/analytics';
import { getErrorCode } from '@/utils/error';

export default function Graduation() {
  const navigate = useNavigate();
  const openAlert = useModalStore((state) => state.openAlert);
  const { data, isPending, isError, error } = useReportSummary();
  const errorCode = isError ? getErrorCode(error) : undefined;
  // 적용 가능한 졸업 요건이 없으면(404 GRADUATION404_2) 미지원 안내 후 홈으로 보낸다.
  // 업로드 단계의 학과 미등록(TRANSCRIPT400_3)과 학생 입장에서는 같은 상황이라 문구를 공유한다.
  const isUnsupportedDept = errorCode === ERROR_CODE.NO_REQUIREMENT;
  useEffect(() => {
    if (!isUnsupportedDept) return;
    // 적용 가능한 졸업 요건이 없어 리포트를 못 보는 이탈 지점을 집계한다.
    trackEvent('error_shown', { source: 'graduation', code: ERROR_CODE.NO_REQUIREMENT });
    openAlert({
      icon: Warning,
      title: UNSUPPORTED_CURRICULUM_MODAL.title,
      subtitle: UNSUPPORTED_CURRICULUM_MODAL.subtitle,
      description: UNSUPPORTED_CURRICULUM_MODAL.description,
      buttonText: '닫기',
      buttonVariant: 'primary',
      onConfirm: () => navigate('/'),
    });
  }, [isUnsupportedDept, openAlert, navigate]);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    // 리포트 없음(404_1)은 업로드로 유도(게이트 우회 등 방어).
    if (errorCode === ERROR_CODE.NO_GRADUATION_REPORT) {
      return <Navigate to="/upload" replace />;
    }
    // 미지원 학과(404_2)는 위 모달을 띄우는 동안 로딩을 보여준다.
    if (isUnsupportedDept) {
      return <Loading />;
    }
    // 그 외 예기치 못한 오류는 NotFound.
    return <NotFound />;
  }

  return <GraduationReport data={data} />;
}
