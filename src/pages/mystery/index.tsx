/** [정각원의 비밀] 세 덱에서 조합을 고르고 두루마리 단서를 수집하는 일일 추리 게임. */
import './mystery.css';

import Loading from '@/components/common/feedback/loading';
import MysteryClueScrolls from '@/components/mystery/mysteryClueScrolls';
import MysteryDeck from '@/components/mystery/mysteryDeck';
import MysteryGauge from '@/components/mystery/mysteryGauge';
import useMysteryGame from '@/hooks/mystery/useMysteryGame';
import ServerError from '@/pages/exception/serverError';
import { useModalStore } from '@/stores/modalStore';
import type { TMysteryGuess } from '@/types/mystery/TMystery';
import { mysteryAnswerSentence, mysteryLabel, mysteryObjectParticle } from '@/utils/mystery/mystery';

const categories: {
  key: 'departments' | 'buildings' | 'methods';
  field: keyof TMysteryGuess;
  kind: 'department' | 'building' | 'method';
  name: string;
}[] = [
  { key: 'departments', field: 'departmentId', kind: 'department', name: '학과' },
  { key: 'buildings', field: 'buildingId', kind: 'building', name: '장소' },
  { key: 'methods', field: 'methodId', kind: 'method', name: '수단' },
];
export default function MysteryPage() {
  const game = useMysteryGame();
  const showHelp = useModalStore((state) => state.openMysteryHelp);
  const data = game.data;
  if (!data && game.isPending) return <Loading />;
  if (!data) return <ServerError error={game.error} source="mystery" onRetry={() => void game.refetch()} />;
  const complete = Object.values(game.guess).every(Boolean);
  const label = (key: 'departments' | 'buildings' | 'methods', id: string) => mysteryLabel(data.options[key], id);
  const method = label('methods', game.guess.methodId);
  return (
    <main className="mystery-page font-pretendard text-body-s text-coolgray-90">
      <div className="mystery-page-inner">
        <header className="mystery-heading">
          <div className="mystery-heading-actions">
            <button
              type="button"
              className="mystery-statistics-button mystery-help-button"
              aria-label="게임 방법"
              aria-haspopup="dialog"
              onClick={showHelp}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M8.5 8a3.5 3.5 0 1 1 6 2.5C13 11.5 12 12 12 14" strokeLinecap="round" />
                <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
              </svg>
            </button>
            <button
              type="button"
              className="mystery-statistics-button"
              aria-label="게임 통계"
              onClick={game.showResult}
            >
              <span className="mystery-gold-text">게임 통계</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 19V12m7 7V5m7 14V9M3 21h18" strokeLinecap="round" />
                <path d="m19 2 .9 2.1L22 5l-2.1.9L19 8l-.9-2.1L16 5l2.1-.9Z" />
              </svg>
            </button>
          </div>
          <div className="mystery-title-wrap">
            <span className="mystery-title-spark mystery-title-spark--left" aria-hidden="true">
              ✦
            </span>
            <h1 className="mystery-title">정각원의 비밀</h1>
            <span className="mystery-title-spark mystery-title-spark--right" aria-hidden="true">
              ✧
            </span>
          </div>
          <div className="mystery-title-ornament" aria-hidden="true">
            <span />✦<span />
          </div>
        </header>
        <MysteryGauge attempts={data.attempts.length} status={data.status} />
        <section className="mystery-investigation" aria-labelledby="mystery-guess-heading">
          <h2 id="mystery-guess-heading" className="mystery-guess-instruction">
            추리를 제출하면 관련된 단서 하나를 풀 수 있어요.
          </h2>
          <div className="mystery-deck-grid">
            {categories.map((c) => (
              <MysteryDeck
                key={c.key}
                kind={c.kind}
                label={c.name}
                options={data.options[c.key]}
                selectedId={game.guess[c.field]}
                disabled={game.finished || game.isSubmitting}
                onSelect={(id) => game.select(c.field, id)}
              />
            ))}
          </div>
          <div className="mystery-submit-area">
            <p className="mystery-hypothesis" aria-live="polite" aria-atomic="true">
              오늘의 어둠의 아코는{' '}
              <strong className={!game.guess.departmentId ? 'is-empty' : ''}>
                {label('departments', game.guess.departmentId) || '이 학과'}
              </strong>{' '}
              소속으로,
              <br className="mystery-sentence-break" />{' '}
              <strong className={!game.guess.buildingId ? 'is-empty' : ''}>
                {label('buildings', game.guess.buildingId) || '이 장소'}
              </strong>
              에서 <strong className={!method ? 'is-empty' : ''}>{method || '이 수단'}</strong>
              {mysteryObjectParticle(method || '이 수단')} 이용해
              <br className="mystery-sentence-break" /> 연등을 가져갔을 거예요.
            </p>
            <button
              type="button"
              className="mystery-submit-button"
              disabled={!game.finished && (!complete || game.duplicate || game.isSubmitting || game.isFetching)}
              onClick={game.finished ? game.showResult : game.submit}
            >
              <span aria-hidden="true">✧</span>
              {game.finished
                ? '오늘의 결과 보기'
                : game.isSubmitting
                  ? '비밀을 밝히는 중…'
                  : game.duplicate
                    ? '이미 제출한 조합이에요'
                    : '추리 제출'}
              <span aria-hidden="true">✧</span>
            </button>
          </div>
          {game.isError && (
            <p role="alert" className="mystery-inline-error text-body-s text-alert">
              최신 기록을 확인하지 못했어요. <button onClick={() => void game.refetch()}>다시 확인</button>
            </p>
          )}
        </section>
        <section className="mystery-notebook" aria-labelledby="mystery-clues-heading">
          <div className="mystery-section-title">
            <h2 id="mystery-clues-heading" className="text-heading-6">
              수집한 단서
            </h2>
          </div>
          <MysteryClueScrolls key={data.gameDate} attempts={data.attempts} maxAttempts={data.maxAttempts} />
        </section>
        {data.attempts.length > 0 && (
          <section className="mystery-history" aria-labelledby="mystery-history-heading">
            <h2 id="mystery-history-heading" className="text-heading-6">
              추리 기록
            </h2>
            <ol>
              {data.attempts.map((a) => (
                <li key={a.number}>
                  <span className="mystery-attempt-number text-body-xs">{a.number}번째 의심</span>
                  <p className="text-body-s">
                    {mysteryAnswerSentence({
                      department: label('departments', a.guess.departmentId),
                      building: label('buildings', a.guess.buildingId),
                      method: label('methods', a.guess.methodId),
                    }).replace('가져갔어요.', '가져갔을 거예요.')}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}
