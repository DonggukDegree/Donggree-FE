type TButtonType = 'primary' | 'alert' | 'disabled' | 'outlined';

interface IButtonProps {
  children: React.ReactNode;
  type?: TButtonType;
  onClick?: () => void;
  className?: string;
}

const typeStyles: Record<TButtonType, string> = {
  primary: 'bg-primary-60 text-white hover:cursor-pointer hover:opacity-90',
  alert: 'bg-alert text-white hover:cursor-pointer hover:opacity-90',
  disabled: 'bg-coolgray-30 text-white cursor-not-allowed',
  outlined: 'bg-white border border-primary-60 text-primary-60 hover:cursor-pointer hover:opacity-90',
};

export default function Button({ children, type = 'primary', onClick, className = '' }: IButtonProps) {
  const baseStyles = 'p-4 rounded-sm text-button-s flex items-center justify-center';

  return (
    <button
      onClick={onClick}
      disabled={type === 'disabled'}
      className={`${baseStyles} ${typeStyles[type]} ${className}`}
    >
      {children}
    </button>
  );
}
