interface ITextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export default function TextField({ className = '', error, ...props }: ITextFieldProps) {
  return (
    <div className={`w-80 ${className}`}>
      <input
        {...props}
        className={`w-full px-4 py-3 rounded-lg bg-white border text-body-m placeholder:text-coolgray-60 outline-none ${
          error ? 'border-alert' : 'border-coolgray-30'
        }`}
      />
      {error && <p className="mt-1 text-body-xs text-alert">{error}</p>}
    </div>
  );
}
