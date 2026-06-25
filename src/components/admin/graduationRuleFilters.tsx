import MultiSelectDropdown from '@/components/admin/multiSelectDropdown';
import type { TAdminRuleType } from '@/types/admin/TGetRuleTypes';
import { COURSE_LABEL, COURSE_TYPES, type TCourseType } from '@/types/course';

interface IGraduationRuleFiltersProps {
  ruleTypes: TAdminRuleType[];
  selectedRuleTypeIds: number[];
  selectedCourseTypes: TCourseType[];
  onRuleTypeToggle: (ruleTypeId: number) => void;
  onCourseTypeToggle: (courseType: TCourseType) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function GraduationRuleFilters({
  ruleTypes,
  selectedRuleTypeIds,
  selectedCourseTypes,
  onRuleTypeToggle,
  onCourseTypeToggle,
  onApply,
  onReset,
}: IGraduationRuleFiltersProps) {
  const ruleTypeOptions = ruleTypes.map((ruleType) => ({
    value: ruleType.id,
    label: `${ruleType.typeName}${ruleType.description ? ` · ${ruleType.description}` : ''}`,
  }));
  const courseTypeOptions = COURSE_TYPES.map((courseType) => ({ value: courseType, label: COURSE_LABEL[courseType] }));

  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-heading-5 text-coolgray-90">졸업 규칙 필터</h2>
        <p className="mt-1 text-body-s text-coolgray-60">
          규칙 종류와 이수구분을 다중 선택해 조회합니다. 미선택 시 전체를 조회합니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">규칙 종류</span>
          <MultiSelectDropdown
            options={ruleTypeOptions}
            selectedValues={selectedRuleTypeIds}
            onToggle={onRuleTypeToggle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">이수구분</span>
          <MultiSelectDropdown
            options={courseTypeOptions}
            selectedValues={selectedCourseTypes}
            onToggle={onCourseTypeToggle}
          />
        </div>
      </div>

      <div className="mt-auto flex justify-end gap-2">
        <button
          type="button"
          className="rounded-full px-5 py-2 text-button-s text-coolgray-60 cursor-pointer"
          onClick={onReset}
        >
          초기화
        </button>
        <button
          type="button"
          className="rounded-full bg-primary-60 px-5 py-2 text-button-s text-white hover:opacity-90 cursor-pointer"
          onClick={onApply}
        >
          필터 적용
        </button>
      </div>
    </section>
  );
}
