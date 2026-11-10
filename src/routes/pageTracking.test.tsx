/** [라우팅 회귀] 인증·성적표 가드의 대기·리다이렉트에서 조회 미발생 검증 */
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProtectedRoute from '@/routes/protectedRoute';
import ReportGate from '@/routes/reportGate';
import TrackedPage from '@/routes/trackedPage';

const state = vi.hoisted(() => ({
  user: {
    data: { studentId: '2026000001' } as { studentId: string | null } | null,
    isPending: false,
    isError: false,
    error: null as unknown,
    isFetching: false,
  },
  reports: { isPending: false, isError: false, error: null as unknown, isFetching: false },
  track: vi.fn(),
}));
vi.mock('@/hooks/user/useUserInfo', () => ({ default: () => state.user }));
vi.mock('@/hooks/report/useUserReports', () => ({ default: () => state.reports }));
// 서버 렌더링에서는 layout effect가 실행되지 않으므로, 경계가 렌더되었는지만 관측한다.
vi.mock('@/hooks/usePageTracking', () => ({ default: () => state.track() }));

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={['/graduation']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<ReportGate />}>
            <Route
              path="graduation"
              element={
                <TrackedPage>
                  <p>리포트 화면</p>
                </TrackedPage>
              }
            />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('가드 이후 페이지 계측', () => {
  beforeEach(() => {
    state.track.mockClear();
    state.user = {
      data: { studentId: '2026000001' },
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
    };
    state.reports = { isPending: false, isError: false, error: null, isFetching: false };
  });
  it('인증 확인 중에는 조회하지 않음', () => {
    state.user.isPending = true;
    render();
    expect(state.track).not.toHaveBeenCalled();
  });
  it('미인증·온보딩 이동 중에는 조회하지 않음', () => {
    state.user.isError = true;
    state.user.error = { isAxiosError: true, response: { status: 401 } };
    render();
    state.user.isError = false;
    state.user.data = { studentId: null };
    render();
    expect(state.track).not.toHaveBeenCalled();
  });
  it('성적표 조회 중·업로드 이동 중에는 조회하지 않음', () => {
    state.reports.isPending = true;
    render();
    state.reports.isPending = false;
    state.reports.isError = true;
    state.reports.error = { isAxiosError: true, response: { status: 404 } };
    render();
    expect(state.track).not.toHaveBeenCalled();
  });
  it('인증·온보딩·성적표 가드 통과 후 화면만 조회함', () => {
    expect(render()).toContain('리포트 화면');
    expect(state.track).toHaveBeenCalledOnce();
  });
});
