/** [정각원의 비밀] 재접속해도 같은 결과를 보여주는 전역 결과 모달. */
import '@/pages/mystery/mystery.css';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import LotusBadge from '@/components/mystery/lotusBadge';
import MysteryCountdown from '@/components/mystery/mysteryCountdown';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import useMysteryToday from '@/hooks/mystery/useMysteryToday';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import { trackEvent } from '@/utils/analytics/analytics';
import { getMemberIdFromAccessToken } from '@/utils/auth/authRole';
import { MYSTERY_TIER_LABELS, mysteryAnswerSentence, mysteryShareText } from '@/utils/mystery/mystery';
import { acknowledgePointReward } from '@/utils/point/pointReward';

export default function MysteryResultModal() {
  const date = useModalStore((s) => s.mysteryDate);
  const close = useModalStore((s) => s.closeMysteryResult);
  const { data, memberId } = useMysteryToday();
  const client = useQueryClient();
  const panel = useRef<HTMLDivElement>(null);
  const game = data?.gameDate === date ? data : null;
  const rewardDate = game?.status === 'WON' ? game.gameDate : null;
  useEffect(() => {
    if (!rewardDate) return;
    // 날짜별 서버 확인으로 재접속·모달 재열기·StrictMode에서도 적립 안내를 한 번만 표시한다.
    void acknowledgePointReward({ reason: 'MYSTERY_SOLVED', targetId: Number(rewardDate.replaceAll('-', '')) }).then(
      (amount) => {
        if (getMemberIdFromAccessToken(useAuthStore.getState().accessToken) !== memberId || amount !== 10) return;
        void client.invalidateQueries({ queryKey: QUERY_KEYS.GET_POINT_SUMMARY });
        void client.invalidateQueries({ queryKey: QUERY_KEYS.GET_POINT_HISTORIES });
        toast.success('정답을 맞춰 10P가 적립됐어요!', { id: `mystery-reward:${memberId}:${rewardDate}` });
      },
    );
  }, [client, memberId, rewardDate]);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const focusable = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]');
        const first = focusable?.[0];
        const last = focusable?.[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKey);
      previous?.focus();
    };
  }, [close]);
  useEffect(() => {
    if (data && !game) close();
  }, [close, data, game]);
  if (!game) return null;
  const won = game.status === 'WON';
  const finished = won || game.status === 'LOST';
  const stats = game.statistics;
  const copy = async (kind: 'link' | 'result') => {
    if (kind === 'result' && !finished) return;
    const url = new URL('/mystery', window.location.origin).href;
    const text = kind === 'link' ? url : mysteryShareText(game, url);
    if (!text) {
      toast.error('오늘의 결과를 확인하지 못했어요. 새로고침 후 다시 시도해주세요.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(kind === 'link' ? '게임 링크를 복사했어요.' : '오늘의 결과를 복사했어요.');
      trackEvent(kind === 'link' ? 'mystery_link_copied' : 'mystery_shared');
    } catch {
      toast.error('복사하지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  };
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-overlay p-4" onClick={close}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mystery-result-title"
        tabIndex={-1}
        className="mystery-result font-pretendard text-body-s"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="mystery-result-close text-heading-4 mystery-result-muted"
          aria-label="결과창 닫기"
          onClick={close}
        >
          ×
        </button>
        <div className="mystery-result-content">
          <h2 id="mystery-result-title" className="mystery-title">
            정각원의 비밀
          </h2>
          <MysteryCountdown resetAt={game.nextResetAt} />
          {finished && (
            <p className="mystery-result-status text-heading-5 mystery-gold-text">
              {won ? '연등을 되찾았어요!' : '연등을 잃어버렸어요...'}
            </p>
          )}
          <LotusBadge tier={stats.tier} />
          <p className="mystery-tier text-body-m mystery-result-muted">{MYSTERY_TIER_LABELS[stats.tier]}</p>
          <p className="mystery-streak text-heading-5">
            <span className="mystery-gold-text">{stats.currentStreak}</span>일 연속 도전!
          </p>
          <div className="mystery-result-stats">
            <div>
              <strong className="text-heading-4">
                <span className="mystery-gold-text">{Math.round(stats.successRate)}</span>
                <small className="text-body-xs mystery-result-muted">%</small>
              </strong>
              <span className="text-body-xs mystery-result-muted">성공률</span>
            </div>
            <div>
              <strong className="text-heading-4">
                <span className="mystery-gold-text">
                  {stats.completedGames === 0 || stats.averageAttempts === null
                    ? '0'
                    : stats.averageAttempts.toFixed(1)}
                </span>
                <small className="text-body-xs mystery-result-muted">회</small>
              </strong>
              <span className="text-body-xs mystery-result-muted">평균 시도</span>
            </div>
            <div>
              <strong className="text-heading-4">
                <span className="mystery-gold-text">{stats.currentStreak}</span>
                <small className="text-body-xs mystery-result-muted">일</small>
              </strong>
              <span className="text-body-xs mystery-result-muted">현재 스트릭</span>
            </div>
          </div>
          {finished && game.answer && (
            <div className="mystery-submit-button mystery-answer">
              <span aria-hidden="true">✧</span>
              <div className="mystery-answer-content">
                <span className="text-heading-6">정답</span>
                <p className="text-body-s">{mysteryAnswerSentence(game.answer)}</p>
              </div>
              <span aria-hidden="true">✧</span>
            </div>
          )}
          <div className="mystery-result-actions" role="group" aria-label="공유 내용 복사">
            <span className="mystery-copy-action">
              <button
                type="button"
                className="mystery-copy-button"
                aria-label="게임 링크 복사"
                aria-describedby="mystery-link-copy-tooltip"
                onClick={() => void copy('link')}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path
                    d="m10 13 4-4M8.8 15.2l-1.1 1.1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m.6 1.4 1.1-1.1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0"
                    transform="translate(1 0)"
                  />
                </svg>
              </button>
              <span id="mystery-link-copy-tooltip" role="tooltip" className="mystery-copy-tooltip">
                게임 링크 복사
              </span>
            </span>
            <span
              className="mystery-copy-action"
              tabIndex={finished ? undefined : 0}
              role={finished ? undefined : 'group'}
              aria-label={finished ? undefined : '내 추리 공유하기, 오늘 게임을 끝내면 사용할 수 있어요'}
              aria-describedby={finished ? undefined : 'mystery-result-copy-tooltip'}
            >
              <button
                type="button"
                className="mystery-copy-button"
                disabled={!finished}
                aria-label="내 추리 공유하기"
                aria-describedby="mystery-result-copy-tooltip"
                onClick={() => void copy('result')}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="8" y="7" width="12" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3m4-6h4m-4 4h4" />
                </svg>
              </button>
              <span id="mystery-result-copy-tooltip" role="tooltip" className="mystery-copy-tooltip">
                내 추리 공유하기
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
