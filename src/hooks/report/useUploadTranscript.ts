/** [성적표 업로드] 제출 시도별 시작·저장 결과와 사용자 오류 안내 */
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { putTranscript } from '@/apis/report/report';
import Warning from '@/assets/icons/warning.svg?react';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { CREDIT_GAP_MODAL, TRANSCRIPT_ERROR_MODAL } from '@/constants/report/reportModals';
import { useCoreMutation } from '@/hooks/customQuery';
import { useModalStore } from '@/stores/modalStore';
import { createAttemptId, getAnalyticsIdentityGeneration, trackEvent } from '@/utils/analytics';
import { analyticsError, trackErrorShown } from '@/utils/analyticsError';
import { getErrorCode, getErrorMessage, getErrorStatus } from '@/utils/error';

type TSubmission = { file: File; attemptId: string; generation: number };
export default function useUploadTranscript() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const openAlert = useModalStore((state) => state.openAlert);
  const submitting = useRef(false);
  const mutation = useCoreMutation(({ file }: TSubmission) => putTranscript(file), {
    retry: false,
    onSuccess: (data, { attemptId, generation }) => {
      // PDF 저장 성공은 졸업 리포트 표시 성공과 별개의 행동이다.
      const { creditGap } = data.result;
      if (generation !== getAnalyticsIdentityGeneration()) return;
      trackEvent('pdf_upload', { attempt_id: attemptId, credit_gap: creditGap, credit_gap_ok: creditGap === 0 });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_REPORTS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTS_ROOT });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_INFO });
      if (creditGap === 0) {
        navigate('/graduation');
        return;
      }
      const modal = creditGap > 0 ? CREDIT_GAP_MODAL.positive(creditGap) : CREDIT_GAP_MODAL.negative(creditGap);
      openAlert({
        icon: Warning,
        title: modal.title,
        subtitle: modal.subtitle,
        description: modal.description,
        buttonText: '리포트 보기',
        buttonVariant: 'primary',
        onConfirm: () => navigate('/graduation'),
      });
    },
    onError: (error, { attemptId, generation }) => {
      if (generation !== getAnalyticsIdentityGeneration()) return;
      trackEvent('pdf_upload_failure', { attempt_id: attemptId, ...analyticsError('transcript_upload', error) });
      const status = getErrorStatus(error);
      const code = getErrorCode(error);
      if (status === 404 || status === 500) {
        navigate('/404', { replace: true, state: { analyticsError: analyticsError('transcript_upload', error) } });
        return;
      }
      const modal = code ? TRANSCRIPT_ERROR_MODAL[code] : undefined;
      if (modal) {
        openAlert({
          icon: Warning,
          title: modal.title,
          subtitle: modal.subtitle,
          description: modal.description,
          buttonText: '닫기',
          buttonVariant: 'primary',
          analyticsError: analyticsError('transcript_upload', error),
        });
        return;
      }
      toast.error(getErrorMessage(error) ?? '업로드 중 오류가 발생했습니다.');
      trackErrorShown('transcript_upload', error);
    },
    onSettled: () => {
      submitting.current = false;
    },
  });
  const mutate = (file: File) => {
    // React가 비활성 버튼을 다시 그리기 전의 이중 클릭도 차단한다.
    if (submitting.current) return;
    if (file.type !== 'application/pdf' || file.size === 0) {
      toast.error('내용이 있는 PDF 파일을 선택해주세요.');
      trackEvent('error_shown', { source: 'transcript_upload', code: 'INVALID_PDF', status: 0 });
      return;
    }
    submitting.current = true;
    const attemptId = createAttemptId();
    trackEvent('pdf_upload_start', { attempt_id: attemptId });
    mutation.mutate({ file, attemptId, generation: getAnalyticsIdentityGeneration() });
  };
  return { mutate, isPending: mutation.isPending };
}
