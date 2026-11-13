/**
 * [관리자 > 졸업 요건 관리] 졸업 규칙 필터 바
 * 페이지 하단 '졸업 규칙 목록' 바로 위에 가로로 길게 놓이며, 두 탭(규칙 관리 / 세트 관리)이 함께 쓴다.
 * 규칙 종류·이수구분·적용 세트를 고르고 '필터 적용'을 눌렀을 때만 목록을 다시 조회한다.
 *
 * 적용 세트: 저장된 졸업 세트를 고르면 그 세트에 연결된 규칙만 남는다.
 * 다른 필터와는 AND로 걸린다. (예: 이수 구분 '공통교양' + 특정 세트 → 그 세트의 공통교양 규칙만)
 * 단과대: 세트가 많아 고르기 어려우므로 적용 세트 선택지만 그 단과대 학과의 세트로 좁힌다. 규칙 조회 조건은 아니다.
 */
import AdminFilterBar, { FilterField } from '@/components/admin/common/adminFilterBar';
import MultiSelectDropdown from '@/components/admin/common/multiSelectDropdown';
import SelectChevron from '@/components/common/inputs/selectChevron';
import { ADMIN_INPUT_CLASS, SELECT_RESET_CLASS } from '@/constants/inputStyles';
import { REQUIREMENT_TRACK_LABEL } from '@/constants/requirementTrack';
import type { TAdminRuleType } from '@/types/admin/graduationRule/TGetRuleTypes';
import type { TAdminCollege, TAdminDepartment } from '@/types/admin/TGetAcademicOrganizations';
import type { TAdminRequirementSetSummary } from '@/types/admin/TRequirementSets';
import { COURSE_LABEL, COURSE_TYPES, type TCourseType } from '@/types/course';
import { getDepartmentLabel } from '@/utils/admin/academicOrganization';

interface IGraduationRuleFiltersProps {
  ruleTypes: TAdminRuleType[];
  // 단과대 선택으로 이미 좁혀진 적용 세트 선택지
  requirementSets: TAdminRequirementSetSummary[];
  colleges: TAdminCollege[];
  departments: TAdminDepartment[];
  selectedRuleTypeIds: number[];
  selectedCourseTypes: TCourseType[];
  selectedCollegeId: string;
  selectedSetId: string;
  onRuleTypeToggle: (ruleTypeId: number) => void;
  onCourseTypeToggle: (courseType: TCourseType) => void;
  onCollegeChange: (value: string) => void;
  onSetChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function GraduationRuleFilters({
  ruleTypes,
  requirementSets,
  colleges,
  departments = [],
  selectedRuleTypeIds,
  selectedCourseTypes,
  selectedCollegeId,
  selectedSetId,
  onRuleTypeToggle,
  onCourseTypeToggle,
  onCollegeChange,
  onSetChange,
  onApply,
  onReset,
}: IGraduationRuleFiltersProps) {
  // 규칙 종류는 typeName만으로는 뜻이 잘 안 보여 설명을 함께 붙여 준다.
  const ruleTypeOptions = ruleTypes.map((ruleType) => ({
    value: ruleType.id,
    label: `${ruleType.typeName}${ruleType.description ? ` · ${ruleType.description}` : ''}`,
  }));
  const courseTypeOptions = COURSE_TYPES.map((courseType) => ({ value: courseType, label: COURSE_LABEL[courseType] }));

  return (
    <AdminFilterBar
      title="졸업 규칙 필터"
      description="미선택 시 전체를 조회합니다. 적용 세트를 고르면 해당 세트에 연결된 규칙만 남습니다. 단과대는 적용 세트 선택지만 좁힙니다."
      onApply={onApply}
      onReset={onReset}
    >
      <FilterField label="규칙 종류" className="min-w-56 flex-1">
        <MultiSelectDropdown
          options={ruleTypeOptions}
          selectedValues={selectedRuleTypeIds}
          onToggle={onRuleTypeToggle}
        />
      </FilterField>

      <FilterField label="이수 구분" className="min-w-48 flex-1">
        <MultiSelectDropdown
          options={courseTypeOptions}
          selectedValues={selectedCourseTypes}
          onToggle={onCourseTypeToggle}
        />
      </FilterField>

      <FilterField label="단과대" className="min-w-44 flex-1">
        <div className="relative">
          <select
            value={selectedCollegeId}
            onChange={(event) => onCollegeChange(event.target.value)}
            className={`${ADMIN_INPUT_CLASS} ${SELECT_RESET_CLASS}`}
          >
            <option value="">전체 단과대</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.collegeName}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </FilterField>

      <FilterField label="적용 세트" className="min-w-64 flex-1">
        <div className="relative">
          <select
            value={selectedSetId}
            onChange={(event) => onSetChange(event.target.value)}
            className={`${ADMIN_INPUT_CLASS} ${SELECT_RESET_CLASS}`}
          >
            <option value="">전체 세트</option>
            {requirementSets.map((set) => (
              <option key={set.id} value={set.id}>
                {getDepartmentLabel(set.departmentId, set.departmentName, departments)} · {set.yearStart}-{set.yearEnd}{' '}
                · {REQUIREMENT_TRACK_LABEL[set.track]} · v{set.version} · {set.active ? '활성' : '비활성'}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </FilterField>
    </AdminFilterBar>
  );
}
