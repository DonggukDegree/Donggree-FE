import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { putTranscript } from '@/apis/report/report';
import Warning from '@/assets/icons/warning.svg?react';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { CREDIT_GAP_MODAL } from '@/constants/report/creditGapModals';
import { TRANSCRIPT_ERROR_MODAL } from '@/constants/report/transcriptErrorModals';
import { useCoreMutation } from '@/hooks/customQuery';
import { useModalStore } from '@/stores/modalStore';
import type { TResponseError } from '@/types/common';
import type { TPutTranscriptResponse } from '@/types/report/TPutTranscript';

// 성적표 PDF 업로드 훅.
// 성공 시 관련 조회 캐시를 무효화하고 졸업 판정 화면으로 이동한다.
// 실패 시 에러 코드/상태에 따라 NotFound 이동 · alert 모달 · 토스트로 분기한다.
export default function useUploadTranscript() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const openAlert = useModalStore((state) => state.openAlert);

  return useCoreMutation((file: File) => putTranscript(file), {
    onSuccess: (data: TPutTranscriptResponse) => {
      // 성적표가 새로 저장됐으므로 관련 조회 캐시를 먼저 무효화한다. (어느 분기든 공통)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_REPORTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_REPORT_SUMMARY });
      // 업로드한 PDF의 학번/이름이 일치하면 서버가 그 시점에 본인 인증(identityVerified)을 자동 처리하므로,
      // 사용자 정보 캐시도 무효화해 최신 인증 상태가 반영되게 한다.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_INFO });

      // creditGap = 총취득학점 - 과목 학점 합. 0이면 정합성 정상이므로 바로 졸업 판정으로 이동한다.
      const { creditGap } = data.result;
      if (creditGap === 0) {
        navigate('/graduation');
        return;
      }

      // 0이 아니면 리포트는 생성됐지만 학점 정합성이 맞지 않는 상태.
      // 부호에 따라 다른 안내 모달을 띄우고, 확인 시 졸업 판정 화면으로 이동시킨다.
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
    // either/or 정책상 onError를 직접 제공하므로 공용 기본 토스트는 뜨지 않는다. (중복 알림 방지)
    onError: (error: TResponseError) => {
      const status = error.response?.status;
      const code = error.response?.data?.code;

      // 회원 조회 실패(404)·서버 내부 오류(500)는 사용자가 조치할 수 없으므로 NotFound로 보낸다.
      if (status === 404 || status === 500) {
        navigate('/404', { replace: true });
        return;
      }

      // 에러 코드에 해당하는 모달 문구가 있으면 alert 모달로 안내하고 업로드 화면에 머문다.
      const modal = code ? TRANSCRIPT_ERROR_MODAL[code] : undefined;
      if (modal) {
        openAlert({
          icon: Warning,
          title: modal.title,
          subtitle: modal.subtitle,
          description: modal.description,
          buttonText: '닫기',
          buttonVariant: 'primary',
        });
        return;
      }

      // 그 외 예기치 못한 에러는 토스트로 안내한다. (예: 서버까지 전달된 파일 누락 등)
      toast.error(error.response?.data?.message ?? '업로드 중 오류가 발생했습니다.');
    },
  });
}
