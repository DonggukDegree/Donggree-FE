import { ADMIN_COMPACT_INPUT_CLASS } from '@/components/admin/adminFormControls';
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
  // 졸업 세트 필터: 버전·활성 정책 콜아웃 아래에 단과대·학과·적용년도·필터적용·초기화를 한 줄로 작게 배치한다.
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-body-xs font-semibold text-coolgray-60">단과대</span>
        <select
          value={selectedCollegeId}
          onChange={(event) => onCollegeChange(event.target.value)}
          className={`${ADMIN_COMPACT_INPUT_CLASS} w-50`}
        >
          <option value="">전체 단과대</option>
          {colleges.map((college) => (
            <option key={college.id} value={college.id}>
              {college.collegeName}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-body-xs font-semibold text-coolgray-60">학과</span>
        <select
          value={selectedDepartmentId}
          disabled={isLoadingDepartments}
          onChange={(event) => onDepartmentChange(event.target.value)}
          className={`${ADMIN_COMPACT_INPUT_CLASS} w-50`}
        >
          <option value="">{isLoadingDepartments ? '학과 불러오는 중' : '전체 학과'}</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.departmentName}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-body-xs font-semibold text-coolgray-60">적용년도</span>
        <input
          value={yearInput}
          inputMode="numeric"
          placeholder="예: 2023"
          onChange={(event) => onYearChange(event.target.value)}
          className={`${ADMIN_COMPACT_INPUT_CLASS} w-50`}
        />
      </label>
      {/* 버튼은 라벨 높이만큼 처지지 않도록 mb-1로 입력칸 높이에 맞춰 정렬한다. */}
      <button
        type="button"
        className="rounded-full bg-primary-60 px-4 py-1.5 mb-1 text-button-s text-white hover:opacity-90 cursor-pointer"
        onClick={onApply}
      >
        필터 적용
      </button>
      <button
        type="button"
        className="rounded-full bg-white px-4 py-1.5 mb-1 text-button-s text-coolgray-60 hover:opacity-90 cursor-pointer"
        onClick={onReset}
      >
        초기화
      </button>
    </div>
  );
}
