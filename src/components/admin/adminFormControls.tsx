import type { ReactNode } from 'react';

// 관리자 폼/필터에서 공용으로 쓰는 입력 필드 스타일. (input·select·textarea 공통)
export const ADMIN_INPUT_CLASS =
  'w-full rounded-lg border border-coolgray-20 bg-white px-3 py-2 text-body-s text-coolgray-90 outline-none placeholder:text-coolgray-60 focus:border-primary-60 disabled:bg-coolgray-10 disabled:text-coolgray-60';

// 한 줄에 라벨+컨트롤을 좁게 배치하는 컴팩트 입력 스타일. (너비 w-* 는 사용처에서 덧붙인다)
export const ADMIN_COMPACT_INPUT_CLASS =
  'rounded-lg border border-coolgray-20 bg-white px-2 py-1.5 text-body-s text-coolgray-90 outline-none placeholder:text-coolgray-60 focus:border-primary-60 disabled:bg-coolgray-10 disabled:text-coolgray-60';

// 네이티브 화살표를 숨긴 select(appearance-none) 위에 커스텀 꺽쇠를 칸 안쪽으로 들여 그린다.
export function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coolgray-60"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 관리자 폼 필드의 라벨 텍스트.
export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-body-s font-semibold text-coolgray-90">{children}</span>;
}

interface ITextInputProps {
  value: string;
  placeholder?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

// 관리자 폼 공용 텍스트 입력. value/onChange만 받는 단순 제어 컴포넌트.
export function TextInput({ value, placeholder, disabled, onChange }: ITextInputProps) {
  return (
    <input
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={ADMIN_INPUT_CLASS}
    />
  );
}
