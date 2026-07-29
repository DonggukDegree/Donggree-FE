/**
 * [공용] 텍스트 입력 필드
 * 서비스 전역에서 쓰는 한 줄 입력. 아래 에러 문구 자리를 함께 관리한다.
 * - variant 'default': 학생 화면용(프로필·학업 정보 등). 기본 너비 w-80.
 * - variant 'admin'  : 관리자 폼·필터용. 부모 폭을 채우는 작은 글씨 입력.
 * 관리자 화면의 select·textarea는 태그가 달라 이 컴포넌트를 쓸 수 없으므로,
 * 생김새를 맞추기 위해 constants/inputStyles의 클래스 문자열을 함께 공유한다.
 */
import { ADMIN_INPUT_BASE_CLASS, INPUT_CLASS } from '@/constants/inputStyles';

type TTextFieldVariant = 'default' | 'admin';

interface ITextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  variant?: TTextFieldVariant;
}

// variant별 [바깥 래퍼 너비, 입력칸 스타일, 에러가 없을 때의 테두리]
const VARIANT_STYLES: Record<TTextFieldVariant, { wrapper: string; input: string; border: string }> = {
  default: { wrapper: 'w-80', input: INPUT_CLASS, border: 'border-coolgray-30' },
  admin: { wrapper: 'w-full', input: ADMIN_INPUT_BASE_CLASS, border: 'border-coolgray-20' },
};

export default function TextField({ className = '', error, variant = 'default', ...props }: ITextFieldProps) {
  const { wrapper, input, border } = VARIANT_STYLES[variant];

  return (
    <div className={`${wrapper} ${className}`}>
      {/* 검증 에러가 있으면 테두리를 경고색으로 바꿔 어느 칸이 문제인지 즉시 보이게 한다. */}
      <input {...props} className={`${input} ${error ? 'border-alert' : border}`} />
      {error && <p className="mt-1 text-body-xs text-alert">{error}</p>}
    </div>
  );
}
