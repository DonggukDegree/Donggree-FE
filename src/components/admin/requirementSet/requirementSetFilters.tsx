/**
 * [관리자 > 졸업 요건 관리 > 졸업 세트 관리] 기존 세트 조회 필터
 * 세트 폼 안에 한 줄로 들어가는 좁은 필터. 단과대·학과·적용년도로 불러올 세트 목록을 좁힌다.
 */
import { ADMIN_COMPACT_INPUT_CLASS } from '@/constants/inputStyles';
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
  // 조건을 다 고른 뒤 '검색'을 눌렀을 때만 세트 목록을 다시 조회한다.
  onSearch: () => void;
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
  onSearch,
}: IRequirementSetFiltersProps) {
  // 단과대·학과·적용년도·검색을 '기존 세트 수정' 박스 안에 한 줄로 작게 배치한다.
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
              {department.collegeName} / {department.departmentName}
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
        className="mb-1 cursor-pointer rounded-full bg-primary-60 px-5 py-1.5 text-button-s text-white hover:opacity-90"
        onClick={onSearch}
      >
        검색
      </button>
    </div>
  );
}
