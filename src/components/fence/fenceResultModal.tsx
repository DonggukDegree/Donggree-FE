/**
 * [울타리치기] 완성 결과·통계 모달
 * 방금 완성한 판이 있으면 시간·최고 기록을 보여주고, 없으면 통계만 보여준다.
 * 회원은 스트릭·완료 수·크기별 최고 기록을, 비회원은 기록 대신 로그인 유도를 보여준다.
 */
import '@/pages/fence/fence.css';

import { useNavigate } from 'react-router-dom';

import useFenceDialog from '@/hooks/fence/useFenceDialog';
import useFenceMember from '@/hooks/fence/useFenceMember';
import useFenceStatistics from '@/hooks/fence/useFenceStatistics';
import { useModalStore } from '@/stores/modalStore';
import { trackEvent } from '@/utils/analytics/analytics';
import { FENCE_SIZES, formatFenceTime } from '@/utils/fence/fenceGrid';

export default function FenceResultModal() {
  const result = useModalStore((s) => s.fenceResult);
  const close = useModalStore((s) => s.closeModal);
  const navigate = useNavigate();
  const dialog = useFenceDialog();
  const { memberId, isMember } = useFenceMember();
  const { data: stats } = useFenceStatistics(memberId);

  const login = () => {
    trackEvent('fence_login_click');
    close();
    navigate('/login');
  };
  const newGame = () => {
    const start = result?.onNewGame;
    close();
    start?.();
  };
  const best = (size: number) => stats?.records.find((r) => r.size === size)?.bestSeconds ?? null;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="fence-result-title"
      className="fence-dialog fence-result font-pretendard text-body-s backdrop:bg-overlay"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="fence-dialog-content">
        <button type="button" className="fence-dialog-close fence-result-close" aria-label="닫기" onClick={close}>
          ×
        </button>
        {result ? (
          <div className="fence-result-hero">
            <span className="fence-result-check" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="m6 12.5 4 4 8-9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
              </svg>
            </span>
            <h2 id="fence-result-title" className="text-heading-4">
              울타리 완성!
            </h2>
            <p className="fence-result-time">
              <span className="text-body-s text-coolgray-60">
                {result.size}×{result.size}
              </span>
              <strong>{formatFenceTime(result.elapsedSeconds)}</strong>
            </p>
            {result.newRecord && <span className="fence-pill">최고 기록 달성</span>}
            {result.hintsUsed > 0 && (
              <p className="text-body-xs text-coolgray-60">
                힌트 {result.hintsUsed}회 사용 · 힌트 없이 풀면 최고 기록에 남아요
              </p>
            )}
            {isMember && result.confirmed === null && (
              <p className="text-body-xs text-coolgray-60" role="status">
                기록을 저장하는 중…
              </p>
            )}
          </div>
        ) : (
          <h2 id="fence-result-title" className="fence-result-title text-heading-5">
            내 기록
          </h2>
        )}

        {isMember ? (
          <section className="fence-stats" aria-label="울타리치기 통계">
            <div className="fence-stats-main">
              <div>
                <strong>{stats?.currentStreak ?? '-'}</strong>
                <span>연속 일수</span>
              </div>
              <div>
                <strong>{stats?.totalSolved ?? '-'}</strong>
                <span>완성한 판</span>
              </div>
            </div>
            <ul className="fence-stats-records">
              {FENCE_SIZES.map((size) => (
                <li key={size} className={result?.size === size ? 'is-current' : ''}>
                  <span>
                    {size}×{size} 최고 기록
                  </span>
                  <strong>{best(size) === null ? '–' : formatFenceTime(best(size) ?? 0)}</strong>
                </li>
              ))}
            </ul>
            {stats && (
              <p className="text-body-xs text-coolgray-60">
                {stats.solvedToday ? '오늘의 10P 적립 완료' : '오늘 첫 완성 시 10P 적립'}
              </p>
            )}
          </section>
        ) : (
          <section className="fence-login" aria-label="로그인 안내">
            <p className="text-body-s text-coolgray-60">
              로그인하면 스트릭과 크기별 최고 기록이 쌓이고,
              <br />
              하루 첫 완성마다 10P가 적립돼요.
            </p>
            <button type="button" className="fence-button fence-button--primary" onClick={login}>
              로그인하고 기록 쌓기
            </button>
          </section>
        )}

        {result?.onNewGame && (
          <button
            type="button"
            className={`fence-button ${isMember ? 'fence-button--primary' : 'fence-button--soft'}`}
            onClick={newGame}
          >
            새 판 시작
          </button>
        )}
      </div>
    </dialog>
  );
}
