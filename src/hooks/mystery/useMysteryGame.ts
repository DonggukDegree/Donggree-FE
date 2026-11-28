/** [정각원의 비밀] 서버 진행·날짜 교체·제출 멱등성·결과 모달 제어. 비회원은 진행 토큰으로 같은 사건을 이어서 푼다. */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { submitMysteryGuess, submitMysteryGuestGuess } from '@/apis/mystery/mystery';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import useMysteryToday from '@/hooks/mystery/useMysteryToday';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import type { TMysteryGuess, TMysterySubmission } from '@/types/mystery/TMystery';
import { trackEvent, trackOncePerVisit } from '@/utils/analytics/analytics';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { getMemberIdFromAccessToken } from '@/utils/auth/authRole';
import { getErrorStatus } from '@/utils/error';
import { sameMysteryGuess } from '@/utils/mystery/mystery';
import { readGuestProgress, saveGuestProgress } from '@/utils/mystery/mysteryGuestProgress';

const emptyGuess: TMysteryGuess = { departmentId: '', buildingId: '', methodId: '' };
export default function useMysteryGame() {
  const client = useQueryClient();
  const query = useMysteryToday();
  const data = query.data;
  const [selection, setSelection] = useState({ date: '', guess: emptyGuess });
  const guess = selection.date === data?.gameDate ? selection.guess : emptyGuess;
  const pendingRequest = useRef<TMysterySubmission | null>(null);
  const submitting = useRef(false);
  const openedResult = useRef('');
  const openResult = useModalStore((s) => s.openMysteryResult);
  const finished = data?.status === 'WON' || data?.status === 'LOST';
  const duplicate = data?.attempts.some((a) => sameMysteryGuess(a.guess, guess)) ?? false;
  // 비회원은 서버가 진행을 저장하지 않으므로 직전 진행 토큰을 함께 보내고 새 토큰을 보관한다.
  const submitGuess = async (submission: TMysterySubmission) => {
    if (!query.isGuest) return submitMysteryGuess(submission);
    const guest = await submitMysteryGuestGuess({
      gameDate: submission.gameDate,
      departmentId: submission.departmentId,
      buildingId: submission.buildingId,
      methodId: submission.methodId,
      progressToken: readGuestProgress(),
    });
    saveGuestProgress(guest.progressToken);
    return guest.today;
  };
  const mutation = useCoreMutation(submitGuess, {
    retry: false,
    onMutate: async () => {
      await client.cancelQueries({ queryKey: QUERY_KEYS.MYSTERY_ROOT });
    },
    onSuccess: (result) => {
      if (getMemberIdFromAccessToken(useAuthStore.getState().accessToken) !== query.memberId) return;
      pendingRequest.current = null;
      client.setQueryData(query.queryKey, result);
      void client.invalidateQueries({ queryKey: QUERY_KEYS.MYSTERY_ROOT });
      const last = result.attempts.at(-1);
      trackEvent('mystery_guess_submitted', { mystery_round: last?.number });
      if (last?.clueText)
        trackEvent('mystery_clue_revealed', { mystery_round: last.number, mystery_category: last.clueCategory });
      if (result.status === 'WON' || result.status === 'LOST')
        trackOncePerVisit(
          'mystery_completed',
          { mystery_round: result.attempts.length, mystery_won: result.status === 'WON' },
          result.gameDate,
        );
    },
    onError: (error) => {
      const status = getErrorStatus(error);
      // 응답이 유실된 재시도에는 같은 요청 번호를 써서 횟수가 두 번 차감되지 않게 한다.
      if (status && status >= 400 && status < 500) pendingRequest.current = null;
      toast.error(
        error.response?.data?.message ?? '추리 결과를 확인하지 못했어요. 다시 제출하면 이어서 확인할 수 있어요.',
      );
      trackErrorShown('mystery', error);
      void client.invalidateQueries({ queryKey: QUERY_KEYS.MYSTERY_ROOT });
    },
    onSettled: () => {
      submitting.current = false;
    },
  });
  useEffect(() => {
    trackOncePerVisit('mystery_viewed');
  }, []);
  useEffect(() => {
    if (!data) return;
    if (finished && openedResult.current !== `${query.memberId}:${data.gameDate}` && !query.isFetching) {
      openedResult.current = `${query.memberId}:${data.gameDate}`;
      openResult(data.gameDate);
    }
    const timer = window.setTimeout(
      () => {
        useModalStore.getState().closeMysteryResult();
        void client.invalidateQueries({ queryKey: QUERY_KEYS.MYSTERY_ROOT });
      },
      Math.max(1000, new Date(data.nextResetAt).getTime() - Date.now() + 250),
    );
    return () => window.clearTimeout(timer);
  }, [client, data, finished, openResult, query.isFetching, query.memberId]);
  useEffect(() => () => useModalStore.getState().closeMysteryResult(), []);
  const select = (field: keyof TMysteryGuess, id: string) => {
    if (!data || finished || mutation.isPending) return;
    setSelection({ date: data.gameDate, guess: { ...guess, [field]: id } });
  };
  const submit = () => {
    if (!data || finished || duplicate || submitting.current || !Object.values(guess).every(Boolean)) return;
    submitting.current = true;
    if (
      !pendingRequest.current ||
      pendingRequest.current.gameDate !== data.gameDate ||
      !sameMysteryGuess(pendingRequest.current, guess)
    ) {
      pendingRequest.current = { ...guess, gameDate: data.gameDate, requestId: crypto.randomUUID() };
    }
    mutation.mutate(pendingRequest.current);
  };
  const showResult = () => data && openResult(data.gameDate);
  return { ...query, guess, select, submit, duplicate, finished, isSubmitting: mutation.isPending, showResult };
}
