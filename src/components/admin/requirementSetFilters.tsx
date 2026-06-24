import { ADMIN_INPUT_CLASS } from '@/components/admin/adminFormControls';
import type { TAdminCollege, TAdminDepartment } from '@/types/admin/TGetAcademicOrganizations';

interface IRequirementSetFiltersProps {
  colleges: TAdminCollege[];
  departments: TAdminDepartment[];
  selectedCollegeId: string;
  selectedDepartmentId: string;
  yearInput: string;
  isLoadingDepartments: boolean;
  onCollegeChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

const INPUT_CLASS = ADMIN_INPUT_CLASS;

export default function RequirementSetFilters({
  colleges,
  departments,
  selectedCollegeId,
  selectedDepartmentId,
  yearInput,
  isLoadingDepartments,
  onCollegeChange,
  onDepartmentChange,
  onYearChange,
  onApply,
  onReset,
}: IRequirementSetFiltersProps) {
  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-heading-5 text-coolgray-90">졸업 세트 필터</h2>
        <p className="mt-1 text-body-s text-coolgray-60">단과대, 학과, 적용 연도로 기존 졸업 요건 세트를 조회합니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">단과대</span>
          <select
            value={selectedCollegeId}
            onChange={(event) => onCollegeChange(event.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">전체 단과대</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.collegeName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">학과</span>
          <select
            value={selectedDepartmentId}
            disabled={isLoadingDepartments}
            onChange={(event) => onDepartmentChange(event.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">{isLoadingDepartments ? '학과 불러오는 중' : '전체 학과'}</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.departmentName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">적용 연도</span>
          <input
            value={yearInput}
            inputMode="numeric"
            placeholder="예: 2023"
            onChange={(event) => onYearChange(event.target.value)}
            className={INPUT_CLASS}
          />
        </label>
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
