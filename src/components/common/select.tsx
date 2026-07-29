/**
 * [공용] 드롭다운 선택 입력
 * 학업 정보 관리 화면의 이수구분·성적 선택처럼 고정 목록에서 하나를 고를 때 쓴다.
 * 값이 비어 있으면 placeholder 옵션이 보이고, 네이티브 화살표는 숨긴 뒤 공용 꺽쇠를 겹쳐 그린다.
 */
import SelectChevron from '@/components/common/selectChevron';
import { SELECT_RESET_CLASS } from '@/constants/inputStyles';

interface ISelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly string[];
  placeholder?: string;
}

export default function Select({ options, placeholder = '선택', className = '', value, ...props }: ISelectProps) {
  // 현재 값이 고정 옵션에 없으면(기존 데이터의 비표준 값 등) 데이터 유실을 막기 위해 옵션에 포함한다.
  const mergedOptions = typeof value === 'string' && value && !options.includes(value) ? [value, ...options] : options;

  return (
    <div className="relative w-full">
      <select
        {...props}
        value={value ?? ''}
        className={`w-full ${SELECT_RESET_CLASS} rounded-lg border border-coolgray-30 bg-white py-3 pl-2 text-body-m text-coolgray-90 outline-none disabled:cursor-not-allowed disabled:bg-coolgray-10 disabled:text-coolgray-60 ${className}`}
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
      <SelectChevron />
    </div>
  );
}
