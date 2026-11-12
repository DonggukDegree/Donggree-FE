/** [관리자 > 신고 관리 > 회원] 검색 목록의 회원 행·받은 신고, 상세의 정지 이력·해제 버튼 검사 */
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
  useAdminMembers: () => ({
    data: { items: [{ member, receivedReportCount: 5 }], totalCount: 1, page: 0, size: 20 },
    isPending: false,
  }),
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
  it('회원 행에 이름·학번·단과대·학과와 받은 신고 수, 정지 배지를 보여줌', () => {
    const html = renderToStaticMarkup(<MemberPanel selectedId={null} onSelect={vi.fn()} />);
    expect(html).toContain('김아코(아코) · 2026000001 · AI융합대학 컴퓨터공학전공');
    expect(html).toContain('받은 신고 5건');
    expect(html).toContain('정지 ~2999.12.13 10:00');
    expect(html).toContain('왼쪽에서 회원을 골라주세요.');
  });

  it('상세에 받은 신고 내역과 정지 이력, 정지 중이면 다시 정지·해제를 보여줌', () => {
    const html = renderToStaticMarkup(<MemberPanel selectedId={7} onSelect={vi.fn()} />);
    expect(html).toContain('리뷰 신고');
    expect(html).toContain('장소 신고 정지');
    expect(html).toContain('30일 · 신고 처리 (리뷰 신고 #2)');
    expect(html).toContain('욕설');
    expect(html).toContain('다시 정지');
    expect(html).not.toMatch(/disabled=""[^>]*>정지 해제/);
  });
});
