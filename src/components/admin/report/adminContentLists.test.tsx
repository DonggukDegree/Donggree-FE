/** [관리자 > 신고 관리] 하단 전체 장소·리뷰·회원 목록의 상태·대기 신고·회원 행·숨김 버튼 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { MemberListSection, PlaceListSection, ReviewListSection } from '@/components/admin/report/adminContentLists';
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
const page = <T,>(items: T[]) => ({ data: { items, totalCount: items.length, page: 0, size: 20 }, isPending: false });

vi.mock('@/hooks/admin/queries/useAdminReports', () => ({
  useAdminPlaceList: () =>
    page([
      {
        placeId: 10,
        name: '동국반점',
        category: 'RESTAURANT',
        subCategory: 'CHINESE',
        status: 'HIDDEN',
        pendingReportCount: 3,
        registrant: null,
        createdAt: '2026-11-01T12:00:00',
      },
      {
        placeId: 11,
        name: '필동커피',
        category: 'CAFE',
        subCategory: 'COFFEE',
        status: 'VISIBLE',
        pendingReportCount: 0,
        registrant: member,
        createdAt: '2026-11-02T12:00:00',
      },
    ]),
  useAdminReviewList: () =>
    page([
      {
        reviewId: 30,
        placeId: 10,
        placeName: '동국반점',
        rating: 1,
        content: '광고 문구가 들어간 리뷰',
        status: 'HIDDEN',
        deleted: false,
        pendingReportCount: 2,
        author: member,
        createdAt: '2026-11-03T12:00:00',
      },
      {
        reviewId: 29,
        placeId: 10,
        placeName: '동국반점',
        rating: 3,
        content: '작성자가 지운 리뷰',
        status: 'VISIBLE',
        deleted: true,
        pendingReportCount: 0,
        author: null,
        createdAt: '2026-11-02T12:00:00',
      },
    ]),
  useAdminMembers: () => page([{ member, receivedReportCount: 5 }]),
}));
vi.mock('@/hooks/admin/mutations/useAdminReportActions', () => ({
  useAdminPlaceVisibility: () => ({ isPending: false, mutate: vi.fn() }),
  useAdminReviewVisibility: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe('신고 관리 하단 목록', () => {
  it('장소 목록은 상태·대기 신고·등록자와 상태에 맞는 숨김/해제 버튼', () => {
    const html = renderToStaticMarkup(<PlaceListSection onSelectMember={vi.fn()} />);
    expect(html).toContain('장소 목록');
    expect(html).toContain('조회 결과 2건');
    expect(html).toContain('🍚 음식점 · 중식');
    expect(html).toContain('3건');
    expect(html).toContain('탈퇴한 회원');
    expect(html).toContain('김아코(아코) · 2026000001 · AI융합대학 컴퓨터공학전공');
    expect(html).toMatch(/>숨김 해제<\/button>[\s\S]*>숨기기<\/button>/);
    expect(html).toContain('aria-label="장소 상태"');
  });

  it('리뷰 목록은 숨긴 리뷰 본문까지 보이고, 작성자가 지운 리뷰는 숨김 버튼이 없음', () => {
    const html = renderToStaticMarkup(<ReviewListSection onSelectMember={vi.fn()} />);
    expect(html).toContain('광고 문구가 들어간 리뷰');
    expect(html).toContain('작성자 삭제');
    expect(html).toContain('>숨김 해제</button>');
    expect(html.match(/>숨기기<\/button>|>숨김 해제<\/button>/g)).toHaveLength(1);
    expect(html).toContain('작성자 삭제</button>');
  });

  it('회원 목록은 회원 행·정지 중 상태·받은 신고 수와 정지 중 필터', () => {
    const html = renderToStaticMarkup(<MemberListSection selectedId={7} onSelect={vi.fn()} />);
    expect(html).toContain('김아코(아코) · 2026000001 · AI융합대학 컴퓨터공학전공');
    expect(html).toContain('정지 중</span>');
    expect(html).toContain('5건');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('aria-label="회원 상태"');
  });
});
