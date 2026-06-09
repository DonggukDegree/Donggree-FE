interface ISelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly string[];
  placeholder?: string;
}

// 드롭다운 선택 입력. 값이 비어 있으면 placeholder 옵션이 보인다.
// 네이티브 화살표를 숨기고(appearance-none) 커스텀 화살표를 칸 안쪽으로 들여 배치한다.
export default function Select({ options, placeholder = '선택', className = '', value, ...props }: ISelectProps) {
  // 현재 값이 고정 옵션에 없으면(기존 데이터의 비표준 값 등) 데이터 유실을 막기 위해 옵션에 포함한다.
  const mergedOptions = typeof value === 'string' && value && !options.includes(value) ? [value, ...options] : options;

  return (
    <div className="relative w-full">
      <select
        {...props}
        value={value ?? ''}
        className={`w-full appearance-none rounded-lg border border-coolgray-30 bg-white py-3 pl-2 pr-7 text-body-m text-coolgray-90 outline-none disabled:cursor-not-allowed disabled:bg-coolgray-10 disabled:text-coolgray-60 ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {mergedOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-coolgray-60"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
