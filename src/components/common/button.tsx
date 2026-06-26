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
  const baseStyles = 'p-4 rounded-sm text-button-s flex items-center justify-center';
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
