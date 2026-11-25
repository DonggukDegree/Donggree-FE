/**
 * [동아리] 목록 필터·정렬 줄
 * 소속 분류·활동 분야·모집 상태를 각각 다중 선택 드롭다운으로 고른다. 필터끼리는 교집합.
 * 정렬은 필터와 따로 동작하며 이름순(기본)·마감 임박순 두 가지.
 * 모바일은 2×2 격자, PC는 한 줄(정렬은 오른쪽 끝). 아무것도 고르지 않으면 트리거에 필터 이름이 보인다.
 */
import MultiSelectDropdown from '@/components/common/inputs/multiSelectDropdown';
import SelectChevron from '@/components/common/inputs/selectChevron';
import { CLUB_AFFILIATIONS, CLUB_FIELDS, CLUB_RECRUITMENT_STATUSES, CLUB_SORTS } from '@/constants/club';
import { SELECT_RESET_CLASS } from '@/constants/inputStyles';
import type { TClubFilters, TClubSort } from '@/types/club/TClub';

interface IClubFilterBarProps {
  filters: TClubFilters;
  sort: TClubSort;
  onToggle: <K extends keyof TClubFilters>(key: K, value: TClubFilters[K][number]) => void;
  onSortChange: (sort: TClubSort) => void;
}

const CELL_CLASS = 'min-w-0 lg:w-48';

export default function ClubFilterBar({ filters, sort, onToggle, onSortChange }: IClubFilterBarProps) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-3">
      <div className={CELL_CLASS}>
        <MultiSelectDropdown
          options={CLUB_AFFILIATIONS}
          selectedValues={filters.affiliations}
          onToggle={(value) => onToggle('affiliations', value)}
          allLabel="소속 분류"
        />
      </div>
      <div className={CELL_CLASS}>
        <MultiSelectDropdown
          options={CLUB_FIELDS}
          selectedValues={filters.fields}
          onToggle={(value) => onToggle('fields', value)}
          allLabel="활동 분야"
        />
      </div>
      <div className={CELL_CLASS}>
        <MultiSelectDropdown
          options={CLUB_RECRUITMENT_STATUSES}
          selectedValues={filters.recruitmentStatuses}
          onToggle={(value) => onToggle('recruitmentStatuses', value)}
          allLabel="모집 상태"
        />
      </div>
      <div className="relative min-w-0 lg:ml-auto lg:w-36">
        <select
          aria-label="정렬"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as TClubSort)}
          className={`w-full ${SELECT_RESET_CLASS} cursor-pointer rounded-lg border border-coolgray-20 bg-white py-2 pl-3 text-body-s text-coolgray-90 outline-none focus:border-primary-60`}
        >
          {CLUB_SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </div>
  );
}
