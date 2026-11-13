/** [관리자 > 졸업 요건 관리] 단과대별 적용 세트 선택지 좁히기 검사 */
import { describe, expect, it } from 'vitest';

import type { TAdminDepartment } from '@/types/admin/TGetAcademicOrganizations';
import { filterSetsByCollege } from '@/utils/admin/academicOrganization';

const departments: TAdminDepartment[] = [
  { id: 1, collegeId: 10, collegeName: 'AI융합대학', departmentName: '컴퓨터공학전공' },
  { id: 2, collegeId: 10, collegeName: 'AI융합대학', departmentName: '멀티미디어소프트웨어공학전공' },
  { id: 3, collegeId: 20, collegeName: '법과대학', departmentName: '법학과' },
];

const sets = [
  { id: 101, departmentId: 1 },
  { id: 102, departmentId: 2 },
  { id: 103, departmentId: 3 },
  // 학과 목록에 없는 학과의 세트
  { id: 104, departmentId: 99 },
];

describe('filterSetsByCollege', () => {
  it('단과대를 고르지 않으면 모든 세트를 그대로 둔다', () => {
    expect(filterSetsByCollege(sets, departments, null)).toEqual(sets);
  });

  it('고른 단과대 학과의 세트만 남긴다', () => {
    expect(filterSetsByCollege(sets, departments, 10).map((set) => set.id)).toEqual([101, 102]);
    expect(filterSetsByCollege(sets, departments, 20).map((set) => set.id)).toEqual([103]);
  });

  it('학과를 찾지 못한 세트는 단과대를 고르면 빠진다', () => {
    expect(filterSetsByCollege(sets, departments, 30)).toEqual([]);
    expect(filterSetsByCollege(sets, [], 10)).toEqual([]);
  });
});
