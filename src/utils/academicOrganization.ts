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
