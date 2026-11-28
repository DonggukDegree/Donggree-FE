/**
 * [울타리치기] 페이지 (/slitherlink)
 * 점을 이어 하나의 울타리 고리를 만드는 슬리더링크 퍼즐. 판은 크기(5·7·10)만 고르고 매번 새로 만든다.
 * 비회원도 끝까지 플레이할 수 있고, 로그인 회원만 스트릭·기록·하루 1회 10P가 쌓인다.
 */
import './fence.css';

import FenceBoard from '@/components/fence/fenceBoard';
import FenceLoading from '@/components/fence/fenceLoading';
import FenceStopwatch from '@/components/fence/fenceStopwatch';
import useFenceGame from '@/hooks/fence/useFenceGame';
import { useModalStore } from '@/stores/modalStore';
import { FENCE_SIZES } from '@/utils/fence/fenceGrid';

export default function FencePage() {
  const fence = useFenceGame();
  const showHelp = useModalStore((s) => s.openFenceHelp);
  const { game, analysis } = fence;
  const solved = !!game?.solvedAt;
  const sizeIndex = FENCE_SIZES.indexOf(fence.size);

  return (
    <main className="fence-page font-pretendard text-coolgray-90">
      <header className="fence-heading">
        <div>
          <h1 className="fence-title">울타리치기</h1>
          <p className="fence-subtitle">점을 이어 하나의 울타리를 완성하는 슬리더링크 퍼즐</p>
        </div>
        <div className="fence-heading-actions">
          <button type="button" className="fence-icon-button" aria-label="게임 방법" onClick={showHelp}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2.9-1.2 1.8" strokeLinecap="round" />
              <circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none" />
            </svg>
          </button>
          <button type="button" className="fence-icon-button" aria-label="내 기록" onClick={fence.showStatistics}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M5 20v-6m7 6V5m7 15v-9M3 20h18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="fence-sizes" role="radiogroup" aria-label="판 크기">
        <span
          className="fence-sizes-thumb"
          style={{ transform: `translateX(${sizeIndex * 100}%)` }}
          aria-hidden="true"
        />
        {FENCE_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={fence.size === size}
            className={fence.size === size ? 'is-selected' : ''}
            disabled={fence.isIssuing}
            onClick={() => fence.start(size)}
          >
            {size}×{size}
          </button>
        ))}
      </div>

      <div className="fence-toolbar">
        {game ? <FenceStopwatch startedAt={game.startedAt} stoppedAt={game.solvedAt} /> : <span />}
        <div className="fence-toolbar-actions">
          <button
            type="button"
            className="fence-tool"
            onClick={fence.undo}
            disabled={!game || solved || game.history.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M9 14 4 9l5-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" strokeLinecap="round" />
            </svg>
            되돌리기
          </button>
          <button
            type="button"
            className="fence-tool"
            onClick={fence.requestHint}
            disabled={!game || solved || fence.isHinting || fence.hintsRemaining <= 0}
            aria-label={`힌트, ${fence.hintsRemaining}번 남음`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path
                d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            힌트
            <span className="fence-tool-count">{fence.hintsRemaining}</span>
          </button>
          <button
            type="button"
            className="fence-tool"
            onClick={() => fence.start(fence.size)}
            disabled={fence.isIssuing}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            새 판
          </button>
        </div>
      </div>

      <div className={`fence-stage size-${game?.puzzle.size ?? fence.size}`}>
        {game && analysis && (
          <FenceBoard
            size={game.puzzle.size}
            clues={game.puzzle.clues}
            state={game.state}
            analysis={analysis}
            hintMark={fence.hintMark}
            solved={solved}
            disabled={solved || fence.isIssuing}
            onBegin={fence.beginStroke}
            onContinue={fence.continueStroke}
            onEnd={fence.endStroke}
          />
        )}
        {fence.isIssuing && <FenceLoading />}
        {fence.issueFailed && !fence.isIssuing && (
          <div className="fence-loading" role="alert">
            <p className="text-body-s text-coolgray-60">판을 만들지 못했어요.</p>
            <button type="button" className="fence-button fence-button--soft" onClick={fence.retry}>
              다시 시도
            </button>
          </div>
        )}
      </div>

      <p className="fence-message text-body-s" aria-live="polite">
        {solved ? '짠! 울타리를 완성했어요.' : (fence.hintMessage ?? '')}
      </p>

      {!fence.isChecking && !fence.isMember && (
        <p className="fence-guest-note text-body-xs text-coolgray-60">
          지금은 기록 없이 플레이 중이에요. 로그인하면 스트릭과 기록이 쌓이고 하루 첫 완성에 10P를 받아요.
        </p>
      )}
    </main>
  );
}
