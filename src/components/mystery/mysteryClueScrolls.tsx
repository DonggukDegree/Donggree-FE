/** [정각원의 비밀] 작은 봉인 두루마리 열 개와 아래에서 가로로 풀리는 오래된 단서 종이. */
import { useEffect, useRef, useState } from 'react';

import MysteryScrollToken from '@/components/mystery/mysteryScrollToken';
import type { TMysteryAttempt } from '@/types/mystery/TMystery';

export default function MysteryClueScrolls({
  attempts,
  maxAttempts,
}: {
  attempts: TMysteryAttempt[];
  maxAttempts: number;
}) {
  const count = attempts.length;
  const [selection, setSelection] = useState({ count, number: attempts.at(-1)?.number });
  const selectedNumber = selection.count === count ? selection.number : attempts.at(-1)?.number;
  const selected = attempts.find((attempt) => attempt.number === selectedNumber);
  const paper = useRef<HTMLElement>(null);
  const previousCount = useRef(count);
  useEffect(() => {
    if (count > previousCount.current)
      paper.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
    previousCount.current = count;
  }, [count]);
  return (
    <>
      <ol className="mystery-scroll-tokens" aria-label="열 번의 추리 두루마리">
        {Array.from({ length: maxAttempts }, (_, index) => {
          const attempt = attempts.find((item) => item.number === index + 1);
          return (
            <li key={index}>
              <button
                type="button"
                className={`mystery-scroll-token ${attempt ? 'is-revealed' : 'is-sealed'}`}
                disabled={!attempt}
                aria-label={`${index + 1}번째 두루마리, ${attempt ? '펼쳐보기' : '봉인됨'}`}
                aria-pressed={!!attempt && attempt.number === selectedNumber}
                aria-controls={attempt ? 'mystery-unfurled-clue' : undefined}
                onClick={() => setSelection({ count, number: attempt?.number })}
              >
                <MysteryScrollToken opened={!!attempt} />
                <span className="mystery-scroll-token-number" aria-hidden="true">
                  {index + 1}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div aria-live="polite" aria-atomic="true">
        {selected && (
          <article
            ref={paper}
            key={selected.number}
            id="mystery-unfurled-clue"
            className="mystery-unfurled-scroll"
            aria-labelledby="mystery-paper-title"
          >
            <div className="mystery-scroll-paper">
              <h3 id="mystery-paper-title">
                <span className="mystery-paper-seal">{selected.clueText ? '단서' : '종결'}</span>
                {selected.number}번째 두루마리
              </h3>
              <p>
                {selected.clueText ??
                  (selected.correct
                    ? '어둠의 아코의 비밀을 밝혀냈어요. 오늘의 사건이 해결됐어요!'
                    : '열 번의 의심이 모두 끝났어요. 결과창에서 오늘의 비밀을 확인하세요.')}
              </p>
              <span className="mystery-paper-sign" aria-hidden="true">
                정각원
                <br />
                秘密
              </span>
            </div>
            <span className="mystery-paper-roller mystery-paper-roller--left" aria-hidden="true" />
            <span className="mystery-paper-roller mystery-paper-roller--right" aria-hidden="true" />
          </article>
        )}
      </div>
    </>
  );
}
