import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import MyPage from '@/pages/myPage/index';

const state = vi.hoisted(() => ({ summary: { data: { totalPoints: 12500 } } as { data?: { totalPoints: number } } }));

vi.mock('@/hooks/point/usePointSummary', () => ({ default: () => state.summary }));
vi.mock('@/hooks/auth/useLogout', () => ({ default: () => ({ mutate: vi.fn(), isPending: false }) }));
vi.mock('@/hooks/useInView', () => ({ default: () => [vi.fn(), true] }));

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <MyPage />
    </MemoryRouter>,
  );

describe('마이페이지', () => {
  it('내 포인트 카드가 총 포인트를 보여주고 적립 내역으로 이동', () => {
    expect(render()).toMatch(/<a [^>]*href="\/my-page\/points"[^>]*>.*내 포인트.*12,500P/);
  });

  it('포인트를 아직 못 받았으면 숫자 대신 -', () => {
    state.summary = {};
    expect(render()).toMatch(/내 포인트.*>-</);
  });
});
