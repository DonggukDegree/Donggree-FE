import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Points from '@/pages/myPage/points';

const state = vi.hoisted(() => ({
  summary: { isPending: false, isError: false, error: null, data: { totalPoints: 1100 } } as Record<string, unknown>,
  histories: {} as Record<string, unknown>,
}));

vi.mock('@/hooks/point/usePointSummary', () => ({ default: () => state.summary }));
vi.mock('@/hooks/point/usePointHistories', () => ({ default: () => state.histories }));
vi.mock('@/hooks/useInView', () => ({ default: () => [vi.fn(), true] }));
vi.mock('@/pages/exception/notFound', () => ({ default: () => <p>오류 화면</p> }));
vi.mock('@/components/common/feedback/loading', () => ({ default: () => <p>로딩</p> }));

describe('포인트 내역 페이지', () => {
  beforeEach(() => {
    state.summary = { isPending: false, isError: false, error: null, data: { totalPoints: 1100 } };
    state.histories = {
      isPending: false,
      isError: false,
      error: null,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      histories: [
        { historyId: 2, reason: 'PLACE_REGISTER', amount: 500, revoked: false, createdAt: '2026-11-16T10:00:00' },
      ],
    };
  });

  it('제목 옆 ? 툴팁, 현재 총 포인트, 적립 내역과 더보기', () => {
    const html = renderToStaticMarkup(<Points />);
    expect(html).toMatch(/포인트 내역<\/h1>.*aria-label="포인트 적립 기준"/);
    expect(html).toMatch(/현재 포인트.*1,100P/);
    expect(html).toContain('동글맵 새 장소 등록');
    expect(html).toContain('+500P');
    expect(html).toContain('더보기');
  });

  it('마지막 페이지면 더보기 없음, 조회 실패면 오류 화면', () => {
    state.histories = { ...state.histories, hasNextPage: false };
    expect(renderToStaticMarkup(<Points />)).not.toContain('더보기');
    state.summary = { isPending: false, isError: true, error: new Error('x'), data: undefined };
    expect(renderToStaticMarkup(<Points />)).toContain('오류 화면');
  });
});
