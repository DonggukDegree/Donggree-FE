/** [관리자 > 신고 관리 > 회원] 회원 상세의 받은 신고·정지 이력·해제 버튼 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import MemberPanel from '@/components/admin/report/memberPanel';
import type { TAdminMember } from '@/types/admin/TAdminReport';

const member: TAdminMember = {
  memberId: 7,
  nickname: '아코',
  name: '김아코',
  studentId: '2026000001',
  collegeName: 'AI융합대학',
  departmentName: '컴퓨터공학전공',
  suspendedUntil: '2999-12-13T10:00:00',
};

vi.mock('@/hooks/admin/queries/useAdminReports', () => ({
  useAdminMember: () => ({
    data: {
      member,
      role: 'STUDENT',
      joinedAt: '2026-03-02T09:00:00',
      receivedReviewReportCount: 4,
      placeReportSuspensionCount: 1,
      receivedReportCount: 5,
      suspensions: [
        {
          id: 3,
          days: 30,
          source: 'REPORT',
          reportType: 'REVIEW',
          reportId: 2,
          note: '욕설',
          startsAt: '2026-11-13T10:00:00',
          endsAt: '2999-12-13T10:00:00',
          createdBy: 1,
          liftedAt: null,
          liftedBy: null,
        },
      ],
    },
    isPending: false,
  }),
}));
vi.mock('@/hooks/admin/mutations/useAdminReportActions', () => ({
  useAdminMemberSuspension: () => ({ isPending: false, mutate: vi.fn() }),
  useAdminLiftSuspension: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe('신고 관리 회원 탭', () => {
  it('고른 회원이 없으면 아래 목록에서 고르라고 안내', () => {
    const html = renderToStaticMarkup(<MemberPanel selectedId={null} />);
    expect(html).toContain('아래 회원 목록에서 회원을 골라주세요.');
  });

  it('상세에 받은 신고 내역과 정지 이력, 정지 중이면 다시 정지·해제를 보여줌', () => {
    const html = renderToStaticMarkup(<MemberPanel selectedId={7} />);
    expect(html).toContain('리뷰 신고');
    expect(html).toContain('장소 신고 정지');
    expect(html).toContain('30일 · 신고 처리 (리뷰 신고 #2)');
    expect(html).toContain('욕설');
    expect(html).toContain('다시 정지');
    expect(html).not.toMatch(/disabled=""[^>]*>정지 해제/);
  });
});
