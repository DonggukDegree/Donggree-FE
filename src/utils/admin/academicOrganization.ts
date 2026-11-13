import type { TAdminDepartment } from '@/types/admin/TGetAcademicOrganizations';

/** 선택한 단과대 밖의 동명 학과를 연결하지 않는다. 단과대 미지정 시에도 유일한 경우만 자동 선택한다. */
export const findDepartmentForForm = (departments: TAdminDepartment[], departmentName: string, collegeName: string) => {
  const candidates = departments.filter(
    (department) =>
      department.departmentName === departmentName.trim() &&
      (!collegeName.trim() || department.collegeName === collegeName.trim()),
  );
  return candidates.length === 1 ? candidates[0] : undefined;
};

/** 기존 API의 학과 ID로 단과대를 표시하며, 이름만으로 동명 학과를 추측하지 않는다. */
export const getDepartmentLabel = (departmentId: number, departmentName: string, departments: TAdminDepartment[]) => {
  const department = departments.find((item) => item.id === departmentId);
  return department ? `${department.collegeName} / ${department.departmentName}` : departmentName;
};

/**
 * 단과대를 고르면 그 단과대 학과에 연결된 세트만 남긴다. 미선택(null)이면 전체를 그대로 돌려준다.
 * 학과 목록에서 찾지 못한 세트는 단과대를 알 수 없으므로 단과대 선택 시 제외한다.
 */
export const filterSetsByCollege = <T extends { departmentId: number }>(
  sets: T[],
  departments: TAdminDepartment[],
  collegeId: number | null,
) => {
  if (collegeId === null) return sets;
  const departmentIds = new Set(
    departments.filter((department) => department.collegeId === collegeId).map((department) => department.id),
  );
  return sets.filter((set) => departmentIds.has(set.departmentId));
};
