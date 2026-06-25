import type { TCommonResponse } from '@/types/common';

export type TAdminCollege = {
  id: number;
  collegeName: string;
};

export type TAdminDepartment = {
  id: number;
  collegeId: number;
  collegeName: string;
  departmentName: string;
};

export type TGetCollegesResponse = TCommonResponse<TAdminCollege[]>;
export type TGetDepartmentsResponse = TCommonResponse<TAdminDepartment[]>;
