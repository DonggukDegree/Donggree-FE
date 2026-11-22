/** [정각원의 비밀] 포인터·터치·키보드로 들어 올려 선택하는 여섯 장의 카드 덱. */
import { type CSSProperties, useState } from 'react';

import type { TMysteryOption } from '@/types/mystery/TMystery';

type TDeckKind = 'department' | 'building' | 'method';
interface IMysteryDeckProps {
  kind: TDeckKind;
  label: string;
  options: TMysteryOption[];
  selectedId: string;
  disabled: boolean;
  onSelect: (id: string) => void;
}
/** 겹친 카드 위에서도 가장 가까운 카드의 중심을 기준으로 들어 올려 좁은 모서리를 누를 필요를 줄인다. */
const nearestCardId = (fan: HTMLDivElement, clientX: number) => {
  let nearest = '';
  let distance = Infinity;
  for (const card of fan.querySelectorAll<HTMLButtonElement>('.mystery-card')) {
    const bounds = card.getBoundingClientRect();
    const nextDistance = Math.abs(clientX - (bounds.left + bounds.width / 2));
    if (nextDistance < distance) {
      nearest = card.dataset.optionId ?? '';
      distance = nextDistance;
    }
  }
  return nearest;
};
export default function MysteryDeck({ kind, label, options, selectedId, disabled, onSelect }: IMysteryDeckProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  return (
    <fieldset
      className={`mystery-deck mystery-deck--${kind}`}
      disabled={disabled}
      onPointerLeave={() => setPreviewId(null)}
    >
      <legend className="sr-only">{label}</legend>
      <div
        className="mystery-deck-fan"
        aria-label={`${label} 카드 6장`}
        onPointerMove={(event) => {
          if (!disabled && event.pointerType !== 'touch')
            setPreviewId(nearestCardId(event.currentTarget, event.clientX));
        }}
        onClickCapture={(event) => {
          // 키보드는 각 버튼의 기본 클릭을 사용하고, 포인터는 겹침과 관계없이 가까운 카드를 선택한다.
          if (
            disabled ||
            event.detail === 0 ||
            !(event.target instanceof Element) ||
            !event.target.closest('.mystery-card')
          )
            return;
          event.stopPropagation();
          const id = nearestCardId(event.currentTarget, event.clientX);
          Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('.mystery-card'))
            .find((card) => card.dataset.optionId === id)
            ?.focus({ preventScroll: true });
          setPreviewId(id);
          onSelect(id === selectedId ? '' : id);
        }}
      >
        {options.map((option, index) => (
          <button
            type="button"
            key={option.id}
            data-option-id={option.id}
            className={`mystery-card ${previewId === option.id ? 'is-preview' : ''}`}
            aria-label={`${label}: ${option.label}`}
            aria-pressed={option.id === selectedId}
            style={{ '--card-index': index, '--card-distance': Math.abs(index - 2.5) } as CSSProperties}
            onFocus={() => setPreviewId(option.id)}
            onBlur={() => setPreviewId(null)}
            onClick={() => {
              setPreviewId(option.id);
              onSelect(option.id === selectedId ? '' : option.id);
            }}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? options.length - 1
                    : (index + (event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
            }}
          >
            <span className="mystery-card-corner" aria-hidden="true">
              ✧
            </span>
            <span className="mystery-card-check" aria-hidden="true">
              {option.id === selectedId ? '✓' : ''}
            </span>
            <svg className="mystery-card-emblem" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="27" />
              <circle cx="32" cy="32" r="23" />
              {kind === 'department' ? (
                <>
                  <path d="M20 45 41 18 46 20 43 29 20 45Zm7-7 12-10M24 45h20" />
                  <path d="m17 19 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
                </>
              ) : kind === 'building' ? (
                <>
                  <path d="m15 28 17-10 17 10H15Zm4 15h26M23 29v14m9-14v14m9-14v14M17 47h30" />
                  <path d="m32 8 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" />
                </>
              ) : (
                <>
                  <path d="m22 44 21-23 4 4-21 23Z" />
                  <path d="m26 13 3 7 7 3-7 3-3 7-3-7-7-3 7-3Zm21 23 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" />
                </>
              )}
            </svg>
            <span className="mystery-card-label text-body-s">{option.label}</span>
            <span className="mystery-card-bottom" aria-hidden="true">
              ✦
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
