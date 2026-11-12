/** [관리자 > 신고 관리] 회원 행·수정 전후 요약·정지 일수 검증 검사 */
import { describe, expect, it } from 'vitest';

import type { TAdminMember } from '@/types/admin/TAdminReport';
import { describeInfoChanges, formatAdminMember, isSuspendedNow, parseSuspensionDays } from '@/utils/admin/report';

const member: TAdminMember = {
  memberId: 7,
  nickname: '아코',
  name: '김아코',
  studentId: '2026000001',
  collegeName: 'AI융합대학',
  departmentName: '컴퓨터공학전공',
  suspendedUntil: null,
};

describe('신고 관리 표시', () => {
  it('회원 행은 이름(닉네임)·학번·단과대 학과, 학과가 없으면 안내, 탈퇴는 탈퇴한 회원', () => {
    expect(formatAdminMember(member)).toBe('김아코(아코) · 2026000001 · AI융합대학 컴퓨터공학전공');
    expect(formatAdminMember({ ...member, nickname: '김아코', collegeName: null, departmentName: null })).toBe(
      '김아코 · 2026000001 · 학과 정보 없음',
    );
    expect(formatAdminMember(null)).toBe('탈퇴한 회원');
  });

  it('정지 종료 시각이 지나지 않았을 때만 정지 중', () => {
    const now = new Date('2026-11-13T10:00:00');
    expect(isSuspendedNow({ ...member, suspendedUntil: '2026-11-14T10:00:00' }, now)).toBe(true);
    expect(isSuspendedNow({ ...member, suspendedUntil: '2026-11-12T10:00:00' }, now)).toBe(false);
    expect(isSuspendedNow(member, now)).toBe(false);
  });

  it('수정 전후는 바뀐 항목만 요약', () => {
    expect(
      describeInfoChanges(
        { businessHours: '평일 11:00-21:00', description: null, menus: [{ name: '짜장면', price: 7000 }], tags: [] },
        { businessHours: '광고 문구', description: null, menus: [{ name: '짜장면', price: 7000 }], tags: ['GENUINE'] },
      ),
    ).toEqual(['영업시간: 평일 11:00-21:00 → 광고 문구', '숨은 맛집: 없음 → 진짜 맛집']);
  });

  it('정지 일수는 1 이상의 정수만, 상한 없음', () => {
    expect(parseSuspensionDays('30')).toBe(30);
    expect(parseSuspensionDays('3650')).toBe(3650);
    expect(parseSuspensionDays('0')).toBeNull();
    expect(parseSuspensionDays('')).toBeNull();
    expect(parseSuspensionDays('1.5')).toBeNull();
  });
});
