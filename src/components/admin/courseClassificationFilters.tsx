import MultiSelectDropdown from '@/components/admin/multiSelectDropdown';
import type { TAdminAreaType } from '@/types/admin/TGetAdminAreaTypes';
import { COURSE_LABEL, COURSE_TYPES, type TCourseType } from '@/types/course';

interface ICourseClassificationFiltersProps {
  areaTypes: TAdminAreaType[];
  selectedAreaTypeIds: number[];
  selectedCourseTypes: TCourseType[];
  yearInput: string;
  // 다중 선택이므로 선택/해제할 값 하나를 토글하도록 알린다.
  onAreaTypeToggle: (areaTypeId: number) => void;
  onCourseTypeToggle: (courseType: TCourseType) => void;
  onYearInputChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function CourseClassificationFilters({
  areaTypes,
  selectedAreaTypeIds,
  selectedCourseTypes,
  yearInput,
  onAreaTypeToggle,
  onCourseTypeToggle,
  onYearInputChange,
  onApply,
  onReset,
}: ICourseClassificationFiltersProps) {
  // 이수구분/이수 영역 다중 선택 드롭다운에 넘길 옵션 목록 (값 + 표시명)
  const courseTypeOptions = COURSE_TYPES.map((courseType) => ({ value: courseType, label: COURSE_LABEL[courseType] }));
  const areaTypeOptions = areaTypes.map((areaType) => ({ value: areaType.id, label: areaType.areaName }));

  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-heading-5 text-coolgray-90">과목 분류 필터</h2>
        <p className="mt-1 text-body-s text-coolgray-60">
          조회 조건을 선택한 뒤 필터를 적용합니다. (다중 선택 가능, 미선택 시 전체)
        </p>
      </div>

      {/* 이수구분 · 이수 영역: 다중 선택 드롭다운을 한 줄에 나란히 배치해 여백을 줄인다. */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">이수구분</span>
          <MultiSelectDropdown
            options={courseTypeOptions}
            selectedValues={selectedCourseTypes}
            onToggle={onCourseTypeToggle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">이수 영역</span>
          <MultiSelectDropdown
            options={areaTypeOptions}
            selectedValues={selectedAreaTypeIds}
            onToggle={onAreaTypeToggle}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-body-s font-semibold text-coolgray-90">입학년도</span>
        <input
          value={yearInput}
          onChange={(event) => onYearInputChange(event.target.value)}
          placeholder="예: 2023,2024"
          className="rounded-lg border border-coolgray-20 bg-white px-3 py-2 text-body-s text-coolgray-90 outline-none placeholder:text-coolgray-60 focus:border-primary-60"
        />
      </div>

      <div className="mt-auto flex justify-end gap-2">
        <button type="button" className="rounded-full px-5 py-2 text-button-s text-coolgray-60" onClick={onReset}>
          초기화
        </button>
        <button
          type="button"
          className="rounded-full bg-primary-60 px-5 py-2 text-button-s text-white hover:opacity-90"
          onClick={onApply}
        >
          필터 적용
        </button>
      </div>
    </section>
  );
}
