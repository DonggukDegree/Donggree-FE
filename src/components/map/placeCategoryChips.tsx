/**
 * [동글맵] 지도 위 플로팅 카테고리 칩
 * 단일 선택이며 null은 '전체'. 목록은 이미 받아 둔 장소를 브라우저에서 바로 거른다.
 */
import { PLACE_CATEGORIES } from '@/constants/place';
import type { TPlaceCategory } from '@/types/place/TPlace';

interface IPlaceCategoryChipsProps {
  selected: TPlaceCategory | null;
  onSelect: (category: TPlaceCategory | null) => void;
}

const CHIPS: readonly { value: TPlaceCategory | null; label: string }[] = [
  { value: null, label: '전체' },
  ...PLACE_CATEGORIES.map(({ value, label }) => ({ value, label })),
];

export default function PlaceCategoryChips({ selected, onSelect }: IPlaceCategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none]">
      {CHIPS.map(({ value, label }) => {
        const isSelected = selected === value;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(value)}
            className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-button-m shadow-sm transition-colors duration-200 ${
              isSelected
                ? 'border-primary-60 bg-primary-60 text-white'
                : 'border-coolgray-30 bg-white text-coolgray-90 hover:border-primary-60 hover:text-primary-60'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
