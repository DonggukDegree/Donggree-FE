/**
 * [FAQ] 태그 필터 칩
 * 목록 위에 놓이는 큰 칩 줄. 누른 칩의 태그로 목록을 걸러낸다.
 * '전체'는 태그 미지정(null)이며, 서버에 tag 파라미터를 붙이지 않는 것과 같다.
 */
import { FAQ_TAG_FILTERS } from '@/constants/faq';
import type { TFaqTag } from '@/types/support/TFaq';

interface IFaqTagChipsProps {
  selected: TFaqTag | null;
  onSelect: (tag: TFaqTag | null) => void;
}

export default function FaqTagChips({ selected, onSelect }: IFaqTagChipsProps) {
  return (
    // 제목이 가운데 정렬이라 칩 줄도 가운데로 맞춘다.
    <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3">
      {FAQ_TAG_FILTERS.map(({ value, label }) => {
        const isSelected = selected === value;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(value)}
            className={`rounded-full px-5 py-2 lg:px-7 lg:py-2.5 text-button-m lg:text-button-l transition-colors duration-200 cursor-pointer border ${
              isSelected
                ? 'bg-primary-60 text-white border-primary-60'
                : 'bg-white text-coolgray-60 border-coolgray-30 hover:border-primary-60 hover:text-primary-60'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
