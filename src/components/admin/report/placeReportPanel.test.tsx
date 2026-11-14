/** [관리자 > 신고 관리 > 장소 신고] 목록의 신고자 행, 상세의 수정 이력·수정자·되돌리기·처리 버튼 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import PlaceReportPanel, { PlaceReportDetail } from '@/components/admin/report/placeReportPanel';
import type { TAdminMember, TAdminPlaceReport } from '@/types/admin/TAdminReport';

const reporter: TAdminMember = {
  memberId: 9,
  nickname: '신고자',
  name: '이신고',
  studentId: '2025000009',
  collegeName: '경영대학',
  departmentName: '경영학과',
  suspendedUntil: null,
};
const editor: TAdminMember = { ...reporter, memberId: 7, nickname: '김아코', name: '김아코', studentId: '2026000001' };
const item: TAdminPlaceReport = {
  reportId: 1,
  reason: 'INAPPROPRIATE',
  description: '광고 문구로 바뀌었어요',
  status: 'PENDING',
  createdAt: '2026-11-13T10:00:00',
  processedAt: null,
  reporter,
  placeId: 10,
  placeName: '동국반점',
  category: 'RESTAURANT',
  placeStatus: 'VISIBLE',
  pendingCount: 2,
};

vi.mock('@/hooks/admin/queries/useAdminReports', () => ({
  useAdminPlaceReports: () => ({ data: { items: [item], totalCount: 1, page: 0, size: 20 }, isPending: false }),
  useAdminPlaceReport: () => ({
    data: {
      report: item,
      place: {
        id: 10,
        name: '동국반점',
        category: 'RESTAURANT',
        subCategory: 'CHINESE',
        status: 'VISIBLE',
        businessHours: '광고 문구',
        description: null,
        menus: [],
        tags: [],
        createdAt: '2026-11-01T10:00:00',
        infoUpdatedAt: '2026-11-12T10:00:00',
      },
      registrant: null,
      editHistories: [
        {
          historyId: 5,
          editor,
          editedAt: '2026-11-12T10:00:00',
          before: { businessHours: '평일 11:00-21:00', description: null, menus: [], tags: [] },
          after: { businessHours: '광고 문구', description: null, menus: [], tags: [] },
        },
      ],
      placeReports: [item],
    },
    isPending: false,
  }),
}));
vi.mock('@/hooks/admin/mutations/useAdminReportActions', () => {
  const mutation = () => ({ isPending: false, mutate: vi.fn() });
  return {
    useAdminReportAction: mutation,
    useAdminPlaceVisibility: mutation,
    useAdminRevertEdit: mutation,
    useAdminReportSuspension: mutation,
  };
});

describe('신고 관리 장소 신고 탭', () => {
  it('목록에 장소·사유·대기 수와 신고자 이름·학번·학과를 보여줌', () => {
    const html = renderToStaticMarkup(<PlaceReportPanel onSelectMember={vi.fn()} />);
    expect(html).toContain('동국반점');
    expect(html).toContain('부적절한 내용이 있어요');
    expect(html).toContain('대기 2건');
    expect(html).toContain('이신고(신고자) · 2025000009 · 경영대학 경영학과');
  });
});

describe('장소 신고 상세', () => {
  it('수정 이력에 수정자·바뀐 값과 되돌리기·수정자 정지, 탈퇴 등록자는 탈퇴한 회원', () => {
    const html = renderToStaticMarkup(<PlaceReportDetail reportId={1} onSelectMember={vi.fn()} />);
    expect(html).toContain('김아코 · 2026000001 · 경영대학 경영학과');
    expect(html).toContain('영업시간: 평일 11:00-21:00 → 광고 문구');
    expect(html).toContain('이 수정 되돌리기');
    expect(html).toContain('수정자 정지');
    expect(html).toContain('탈퇴한 회원');
    expect(html).not.toContain('등록자 정지');
    expect(html).toContain('장소 숨김');
    expect(html).toContain('처리 완료');
    expect(html).toContain('이 장소의 신고 1건');
  });
});
