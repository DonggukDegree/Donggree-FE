/**
 * [동글맵] 지도 위 플로팅 카테고리 칩
 * 윗줄: ✨ 숨은 맛집(맨 앞, 별도 모드) · 전체 · 카테고리(하나만 선택, 핀과 같은 이모지).
 * 아랫줄: 카테고리를 고르면 그 카테고리의 세부 칩, 숨은 맛집을 고르면 태그 칩을 띄우며 둘 다 여러 개 고를 수 있다.
 * 목록은 이미 받아 둔 장소를 브라우저에서 바로 거른다.
 */
import {
  HIDDEN_GEM,
  PLACE_CATEGORIES,
  PLACE_SUB_CATEGORIES_BY_CATEGORY,
  PLACE_SUB_CATEGORY_LABELS,
  PLACE_TAGS,
} from '@/constants/place';
import type { TPlaceCategory, TPlaceSubCategory, TPlaceTag } from '@/types/place/TPlace';
import type { TPlaceFilter } from '@/utils/place/place';

interface IPlaceCategoryChipsProps {
  filter: TPlaceFilter;
  onSelectCategory: (category: TPlaceCategory | null) => void;
  onToggleHiddenGem: () => void;
  onToggleSubCategory: (subCategory: TPlaceSubCategory) => void;
  onToggleTag: (tag: TPlaceTag) => void;
}

const TOP_CHIP_CLASS =
  'shrink-0 cursor-pointer rounded-full border px-4 py-2 text-button-m shadow-sm transition-colors duration-200';
const SUB_CHIP_CLASS =
  'shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-body-s shadow-sm transition-colors duration-200';
const ROW_CLASS = 'flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none]';

export default function PlaceCategoryChips({
  filter,
  onSelectCategory,
  onToggleHiddenGem,
  onToggleSubCategory,
  onToggleTag,
}: IPlaceCategoryChipsProps) {
  const isHiddenGem = filter.mode === 'hiddenGem';
  const selectedCategory = filter.mode === 'category' ? filter.category : undefined;

  return (
    <div className="flex flex-col gap-1">
      <div className={ROW_CLASS}>
        <button
          type="button"
          aria-pressed={isHiddenGem}
          onClick={onToggleHiddenGem}
          className={`${TOP_CHIP_CLASS} ${
            isHiddenGem
              ? 'border-[#1f2a5c] bg-[#1f2a5c] text-white'
              : 'border-primary-60 bg-primary-30 text-primary-90 hover:bg-white'
          }`}
        >
          <span aria-hidden="true" className="mr-1">
            {HIDDEN_GEM.emoji}
          </span>
          {HIDDEN_GEM.label}
        </button>
        <TopChip label="전체" isSelected={selectedCategory === null} onClick={() => onSelectCategory(null)} />
        {PLACE_CATEGORIES.map(({ value, label, emoji }) => (
          <TopChip
            key={value}
            label={label}
            emoji={emoji}
            isSelected={selectedCategory === value}
            onClick={() => onSelectCategory(value)}
          />
        ))}
      </div>

      {filter.mode === 'category' && filter.category !== null && (
        <div className={ROW_CLASS} role="group" aria-label="세부 카테고리">
          {PLACE_SUB_CATEGORIES_BY_CATEGORY[filter.category].map((subCategory) => (
            <SubChip
              key={subCategory}
              label={PLACE_SUB_CATEGORY_LABELS[subCategory]}
              isSelected={filter.subCategories.includes(subCategory)}
              onClick={() => onToggleSubCategory(subCategory)}
            />
          ))}
        </div>
      )}
      {filter.mode === 'hiddenGem' && (
        <div className={ROW_CLASS} role="group" aria-label="숨은 맛집 종류">
          {PLACE_TAGS.map(({ value, label }) => (
            <SubChip
              key={value}
              label={label}
              isSelected={filter.tags.includes(value)}
              onClick={() => onToggleTag(value)}
              tone="hiddenGem"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TopChip({
  label,
  emoji,
  isSelected,
  onClick,
}: {
  label: string;
  emoji?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`${TOP_CHIP_CLASS} ${
        isSelected
          ? 'border-primary-60 bg-primary-60 text-white'
          : 'border-coolgray-30 bg-white text-coolgray-90 hover:border-primary-60 hover:text-primary-60'
      }`}
    >
      {emoji && (
        <span aria-hidden="true" className="mr-1">
          {emoji}
        </span>
      )}
      {label}
    </button>
  );
}

function SubChip({
  label,
  isSelected,
  onClick,
  tone = 'category',
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  tone?: 'category' | 'hiddenGem';
}) {
  const selectedClass =
    tone === 'hiddenGem'
      ? 'border-[#1f2a5c] bg-[#1f2a5c] text-white'
      : 'border-primary-60 bg-primary-30 text-primary-90';
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`${SUB_CHIP_CLASS} ${
        isSelected ? selectedClass : 'border-coolgray-30 bg-white text-coolgray-90 hover:border-primary-60'
      }`}
    >
      {label}
    </button>
  );
}
