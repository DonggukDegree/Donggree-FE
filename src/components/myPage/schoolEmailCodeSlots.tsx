/** [학교 이메일 인증] Code Slots의 슬롯 인터랙션을 참고한 숫자 6자리 입력 */
import './schoolEmailCodeSlots.css';

import { useEffect, useRef, useState } from 'react';

interface ISchoolEmailCodeSlotsProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error: string;
}

export default function SchoolEmailCodeSlots({ value, onChange, disabled, error }: ISchoolEmailCodeSlotsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState(0);
  const activeIndex = Math.min(cursor, value.length, 5);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const update = (raw: string) => {
    const next = raw.replace(/[^0-9]/g, '').slice(0, 6);
    setCursor(next.length);
    onChange(next);
  };

  return (
    <div
      className={`relative grid h-[var(--code-input-height)] w-[var(--code-slots-width)] max-w-full flex-none grid-cols-6 gap-[var(--code-slot-gap)] ${disabled ? 'opacity-60' : ''}`}
    >
      <input
        ref={inputRef}
        id="school-email-code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="인증 코드 6자리"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'school-email-code-error' : 'school-email-code-help'}
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0 disabled:cursor-not-allowed"
        value={value}
        maxLength={6}
        disabled={disabled}
        onChange={(event) => update(event.target.value)}
        onPaste={(event) => {
          event.preventDefault();
          update(event.clipboardData.getData('text'));
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSelect={(event) => setCursor(event.currentTarget.selectionStart ?? value.length)}
        onPointerDown={(event) => {
          if (disabled) return;
          event.preventDefault();
          const input = event.currentTarget;
          const bounds = input.getBoundingClientRect();
          const index = Math.max(
            0,
            Math.min(Math.floor(((event.clientX - bounds.left) / bounds.width) * 6), value.length, 5),
          );
          input.focus();
          input.setSelectionRange(index, Math.min(index + 1, value.length));
          setCursor(index);
        }}
      />
      {Array.from({ length: 6 }, (_, index) => {
        const digit = value[index];
        const active = focused && !disabled && index === activeIndex;
        return (
          <span
            key={index}
            aria-hidden="true"
            className={`relative grid h-full min-w-0 place-items-center overflow-hidden rounded-lg border text-heading-5 tabular-nums ${
              error
                ? 'border-alert bg-chip-red-bg'
                : active
                  ? 'border-primary-60 bg-primary-30'
                  : 'border-coolgray-20 bg-white'
            }`}
          >
            {digit ? (
              <span
                key={digit}
                className="school-email-code-digit absolute inset-0 grid place-items-center bg-primary-30 text-primary-60"
              >
                {digit}
              </span>
            ) : active ? (
              <span className="h-5 w-px animate-pulse bg-primary-90 motion-reduce:animate-none" />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
