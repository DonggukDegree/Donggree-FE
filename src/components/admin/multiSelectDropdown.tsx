import { useEffect, useRef, useState } from 'react';

// 다중 선택 드롭다운에서 사용할 옵션 한 개. value는 실제 값, label은 표시 문자열이다.
interface IMultiSelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface IMultiSelectDropdownProps<T extends string | number> {
  // 옵션 목록 (값 + 표시명)
  options: IMultiSelectOption<T>[];
  // 현재 선택된 값들
  selectedValues: T[];
  // 항목을 누를 때마다 해당 값의 선택/해제를 토글하도록 알린다.
  onToggle: (value: T) => void;
  // 아무것도 선택하지 않았을 때 트리거에 보여줄 문구 (기본 '전체')
  allLabel?: string;
  disabled?: boolean;
}

// 필터용 커스텀 다중 선택 드롭다운.
// - 트리거를 클릭하면 펼쳐지고, 트리거를 다시 누르거나 바깥을 클릭해야 닫힌다.
// - 항목을 선택해도 닫히지 않으며, 선택된 항목은 primary-30 음영 + 체크 표시로 강조한다.
// - 아무것도 선택하지 않은 상태는 '전체'를 의미한다.
export default function MultiSelectDropdown<T extends string | number>({
  options,
  selectedValues,
  onToggle,
  allLabel = '전체',
  disabled = false,
}: IMultiSelectDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 메뉴가 열려 있을 때 바깥 영역을 클릭하면 닫는다. (항목 선택으로는 닫히지 않음)
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // 선택된 항목들의 표시명을 모아 트리거 요약 문구를 만든다. 선택이 없으면 '전체'.
  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);
  const hasSelection = selectedLabels.length > 0;
  const summary = hasSelection ? selectedLabels.join(', ') : allLabel;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-coolgray-20 bg-white py-2 pl-3 pr-3 text-body-s outline-none focus:border-primary-60 disabled:cursor-not-allowed disabled:bg-coolgray-10"
      >
        <span className={`truncate ${hasSelection ? 'text-coolgray-90' : 'text-coolgray-60'}`}>{summary}</span>
        {/* 커스텀 꺽쇠. 칸 안쪽(pr-3)에 들여 두고, 열리면 위로 회전한다. */}
        <svg
          className={`h-4 w-4 shrink-0 text-coolgray-60 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-coolgray-20 bg-white py-1 shadow-lg">
          {options.length === 0 ? (
            <li className="px-3 py-2 text-body-s text-coolgray-60">옵션이 없습니다.</li>
          ) : (
            options.map((option) => {
              const checked = selectedValues.includes(option.value);
              return (
                <li key={String(option.value)}>
                  <button
                    type="button"
                    onClick={() => onToggle(option.value)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-body-s ${
                      checked ? 'bg-primary-30 text-primary-90' : 'text-coolgray-90 hover:bg-coolgray-10/60'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {/* 선택된 항목에는 체크 표시를 보여준다. */}
                    {checked && (
                      <svg
                        className="h-4 w-4 shrink-0 text-primary-90"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
