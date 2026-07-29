/**
 * [관리자 공용] 폼 조각 모음
 * 관리자 화면(과목 관리 · 졸업 요건 관리)의 폼·필터가 함께 쓰는 라벨과 텍스트 입력.
 * 입력칸 생김새는 공용 TextField(variant="admin")에 위임하고, 여기서는 관리자 폼이 쓰기 편한
 * 인터페이스(이벤트 대신 값만 주고받는 형태)만 얹는다.
 * select·textarea처럼 TextField로 감쌀 수 없는 입력은 constants/inputStyles의 클래스를 직접 쓴다.
 */
import type { ReactNode } from 'react';

import TextField from '@/components/common/textField';

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

// 관리자 폼 공용 텍스트 입력.
export function TextInput({ value, placeholder, disabled, onChange }: ITextInputProps) {
  return (
    <TextField
      variant="admin"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
