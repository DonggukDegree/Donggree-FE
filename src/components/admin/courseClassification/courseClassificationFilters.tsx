/**
 * [관리자 > 과목 관리] 과목 분류 필터 바
 * 페이지 하단 '과목 분류 목록' 바로 위에 가로로 길게 놓인다.
 * 이수구분·이수 영역(다중 선택)과 입학년도로 조회 조건을 만들고,
 * '필터 적용'을 눌렀을 때만 useCourseClassificationEditor가 목록을 다시 조회한다.
 */
import AdminFilterBar, { FilterField } from '@/components/admin/common/adminFilterBar';
import MultiSelectDropdown from '@/components/admin/common/multiSelectDropdown';
import TextField from '@/components/common/textField';
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
  // 다중 선택 드롭다운에 넘길 옵션 목록 (값 + 표시명)
  const courseTypeOptions = COURSE_TYPES.map((courseType) => ({ value: courseType, label: COURSE_LABEL[courseType] }));
  const areaTypeOptions = areaTypes.map((areaType) => ({ value: areaType.id, label: areaType.areaName }));

  return (
    <AdminFilterBar
      title="과목 분류 필터"
      description="조회 조건을 선택한 뒤 필터를 적용합니다. (다중 선택 가능, 미선택 시 전체)"
      onApply={onApply}
      onReset={onReset}
    >
      <FilterField label="이수 구분" className="min-w-48 flex-1">
        <MultiSelectDropdown
          options={courseTypeOptions}
          selectedValues={selectedCourseTypes}
          onToggle={onCourseTypeToggle}
        />
      </FilterField>

      <FilterField label="이수 영역" className="min-w-56 flex-1">
        <MultiSelectDropdown
          options={areaTypeOptions}
          selectedValues={selectedAreaTypeIds}
          onToggle={onAreaTypeToggle}
        />
      </FilterField>

      <FilterField label="입학년도" className="min-w-40 flex-1">
        <TextField
          variant="admin"
          value={yearInput}
          inputMode="numeric"
          placeholder="예: 2023"
          onChange={(event) => onYearInputChange(event.target.value)}
        />
      </FilterField>
    </AdminFilterBar>
  );
}
