/**
 * [공용] 버튼
 * 서비스 전역에서 쓰는 기본 버튼. variant로 색을 정하고, 'disabled'는 색과 비활성 상태를 함께 바꾼다.
 */
type TButtonVariant = 'primary' | 'alert' | 'disabled' | 'outlined';

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
}

const variantStyles: Record<TButtonVariant, string> = {
  primary: 'bg-primary-60 text-white hover:cursor-pointer hover:opacity-90',
  alert: 'bg-alert text-white hover:cursor-pointer hover:opacity-90',
  disabled: 'bg-coolgray-30 text-white cursor-not-allowed',
  outlined: 'bg-white border border-primary-60 text-primary-60 hover:cursor-pointer hover:opacity-90',
};

export default function Button({ children, variant = 'primary', className = '', disabled, ...props }: IButtonProps) {
  // 모바일 축소는 lg:가 아니라 max-lg:로 준다.
  // 공용 버튼이라 호출부가 px-15 같은 여백을 덧붙이는데, 기본 클래스에 lg: 변형을 두면
  // 변형이 호출부의 기본 유틸보다 뒤에 배치되어 PC에서 호출부 값을 덮어써 버린다.
  // max-lg:만 쓰면 lg 이상에서는 p-4만 남아 호출부 override가 예전 그대로 동작한다.
  const baseStyles = 'p-4 max-lg:px-3 max-lg:py-3.5 rounded-sm text-button-s flex items-center justify-center';
  return (
    <button
      {...props}
      disabled={disabled || variant === 'disabled'}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
