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
  // 모바일에서는 좌우 여백만 줄이고 위아래는 눌러지지 않게 남겨 둔다.
  // p-* 단축 대신 px/py 개별 속성만 쓴다. (단축과 개별이 섞이면 어느 쪽이 이길지 보장되지 않는다)
  // lg의 px-4 py-4는 기존 p-4와 계산값이 같다.
  const baseStyles = 'px-3 py-3.5 lg:px-4 lg:py-4 rounded-sm text-button-s flex items-center justify-center';
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
