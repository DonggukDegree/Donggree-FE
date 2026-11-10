/** [동글맵] 지도 레벨 범위와 확대·축소·학교 이동·장소 추가 버튼 표시 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ mapProps: {} as Record<string, unknown> }));

vi.mock('react-kakao-maps-sdk', () => ({
  useKakaoLoader: () => [false, undefined],
  Map: (props: Record<string, unknown>) => {
    state.mapProps = props;
    return <div data-testid="kakao-map" />;
  },
  MarkerClusterer: () => null,
  CustomOverlayMap: () => null,
}));
vi.mock('@/hooks/place/usePlaces', () => ({
  default: () => ({ data: [], isError: false, error: null, refetch: vi.fn() }),
}));
vi.mock('@/hooks/user/useUserInfo', () => ({
  default: () => ({ data: { identityVerified: false, schoolEmailVerified: false } }),
}));

const render = async () => {
  const { default: DonggleMap } = await import('@/pages/map');
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/map']}>
      <DonggleMap />
    </MemoryRouter>,
  );
};

describe('동글맵 지도', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_KAKAO_MAP_KEY', 'test-key');
    state.mapProps = {};
  });

  it('레벨 3에서 시작하고 SDK minLevel(카카오 최대 축소)로 레벨 6까지만 축소 허용', async () => {
    await render();
    expect(state.mapProps.level).toBe(3);
    expect(state.mapProps.minLevel).toBe(6);
    // SDK의 maxLevel은 카카오 최소 레벨(최대 확대)이라 지정하면 확대가 막힌다.
    expect(state.mapProps).not.toHaveProperty('maxLevel');
  });

  it('확대·축소·학교 이동 버튼을 표시', async () => {
    const html = await render();
    expect(html).toContain('aria-label="지도 확대"');
    expect(html).toContain('aria-label="지도 축소"');
    expect(html).toContain('aria-label="학교로 이동"');
    expect(html).toContain('aria-label="장소 추가"');
    expect(html).toContain('아직 등록된 장소가 없어요.');
    // 쌓이는 순서: 확대·축소 → 학교 이동 → 장소 추가(맨 아래)
    expect(html.indexOf('지도 축소')).toBeLessThan(html.indexOf('학교로 이동'));
    expect(html.indexOf('학교로 이동')).toBeLessThan(html.indexOf('장소 추가'));
  });

  it('지도 키가 없으면 SDK를 부르지 않고 안내만 표시', async () => {
    vi.stubEnv('VITE_KAKAO_MAP_KEY', '');
    const html = await render();
    expect(html).toContain('지도를 불러오지 못했어요.');
    expect(html).not.toContain('kakao-map');
  });
});
