/** [정각원의 비밀] 포인터·터치·키보드로 들어 올려 선택하는 여섯 장의 카드 덱. */
import { type CSSProperties, useRef, useState } from 'react';

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
type TCardCenter = { id: string; x: number };
type TTouchGesture = {
  identifier: number;
  startX: number;
  startY: number;
  startId: string;
  previousPreviewId: string | null;
  centers: TCardCenter[];
  dragged: boolean;
};
const TOUCH_MOVE_THRESHOLD = 8;
const cardCenters = (fan: HTMLDivElement): TCardCenter[] =>
  Array.from(fan.querySelectorAll<HTMLButtonElement>('.mystery-card'), (card) => {
    const bounds = card.getBoundingClientRect();
    return { id: card.dataset.optionId ?? '', x: bounds.left + bounds.width / 2 };
  });

/** 터치 중에는 시작 시의 중심을 고정해 카드가 올라오는 애니메이션 때문에 미리보기가 흔들리지 않게 한다. */
const nearestCardId = (fan: HTMLDivElement, clientX: number, centers = cardCenters(fan)) => {
  let nearest = '';
  let distance = Infinity;
  for (const center of centers) {
    const nextDistance = Math.abs(clientX - center.x);
    if (nextDistance < distance) {
      nearest = center.id;
      distance = nextDistance;
    }
  }
  return nearest;
};
export default function MysteryDeck({ kind, label, options, selectedId, disabled, onSelect }: IMysteryDeckProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const touchGesture = useRef<TTouchGesture | null>(null);
  const touchInput = useRef(false);
  const cancelTouch = () => {
    const gesture = touchGesture.current;
    touchGesture.current = null;
    if (gesture) setPreviewId(gesture.previousPreviewId);
  };
  return (
    <fieldset
      className={`mystery-deck mystery-deck--${kind}`}
      disabled={disabled}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') setPreviewId(null);
      }}
    >
      <legend className="sr-only">{label}</legend>
      <div
        className="mystery-deck-fan"
        aria-label={`${label} 카드 6장`}
        onPointerDown={(event) => {
          if (event.pointerType !== 'touch') touchInput.current = false;
        }}
        onTouchStart={(event) => {
          if (disabled) return;
          touchInput.current = true;
          if (event.touches.length !== 1) {
            cancelTouch();
            return;
          }
          const touch = event.touches[0];
          if (!touch) return;
          const centers = cardCenters(event.currentTarget);
          const target =
            event.target instanceof Element ? event.target.closest<HTMLButtonElement>('.mystery-card') : null;
          const id =
            target?.dataset.optionId === previewId
              ? previewId
              : nearestCardId(event.currentTarget, touch.clientX, centers);
          if (!id) return;
          touchGesture.current = {
            identifier: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY,
            startId: id,
            previousPreviewId: previewId,
            centers,
            dragged: false,
          };
          setPreviewId(id);
        }}
        onTouchMove={(event) => {
          const gesture = touchGesture.current;
          if (disabled || !gesture) return;
          const touch = Array.from(event.touches).find((item) => item.identifier === gesture.identifier);
          if (!touch) return;
          const dx = Math.abs(touch.clientX - gesture.startX);
          const dy = Math.abs(touch.clientY - gesture.startY);
          if (dy > TOUCH_MOVE_THRESHOLD && dy > dx) {
            cancelTouch();
            return;
          }
          if (!gesture.dragged && dx <= TOUCH_MOVE_THRESHOLD) return;
          gesture.dragged = true;
          setPreviewId(nearestCardId(event.currentTarget, touch.clientX, gesture.centers));
        }}
        onTouchEnd={(event) => {
          const gesture = touchGesture.current;
          const touch =
            gesture && Array.from(event.changedTouches).find((item) => item.identifier === gesture.identifier);
          if (!gesture || !touch) return;
          touchGesture.current = null;
          if (disabled) return;
          const moved =
            gesture.dragged ||
            Math.abs(touch.clientX - gesture.startX) > TOUCH_MOVE_THRESHOLD ||
            Math.abs(touch.clientY - gesture.startY) > TOUCH_MOVE_THRESHOLD;
          const id = moved ? nearestCardId(event.currentTarget, touch.clientX, gesture.centers) : gesture.startId;
          setPreviewId(id);
          // 탐색을 마친 손 떼기는 미리보기만 유지하고, 이미 올라온 카드를 다시 탭해야 확정한다.
          if (!moved && gesture.previousPreviewId === id) onSelect(id === selectedId ? '' : id);
        }}
        onTouchCancel={cancelTouch}
        onPointerMove={(event) => {
          if (!disabled && event.pointerType !== 'touch')
            setPreviewId(nearestCardId(event.currentTarget, event.clientX));
        }}
        onClickCapture={(event) => {
          // 터치 뒤 합성되는 click이 미리보기를 즉시 선택하거나 두 번 토글하지 않게 한다.
          if (event.detail !== 0 && touchInput.current) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
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
            onFocus={(event) => {
              if (!touchInput.current || event.currentTarget.matches(':focus-visible')) setPreviewId(option.id);
            }}
            onBlur={() => {
              if (!touchInput.current) setPreviewId(null);
            }}
            onClick={() => {
              setPreviewId(option.id);
              onSelect(option.id === selectedId ? '' : option.id);
            }}
            onKeyDown={(event) => {
              touchInput.current = false;
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
