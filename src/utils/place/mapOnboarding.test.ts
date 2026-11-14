/** [동글맵] 첫 방문 튜토리얼 노출 기록 검사 */
import { describe, expect, it, vi } from 'vitest';

describe('mapOnboarding', () => {
  it('시작하기 전에는 보지 않은 상태이고, 기록 후에는 본 상태로 남는다', async () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });
    vi.resetModules();
    const { hasSeenMapOnboarding, markMapOnboardingSeen } = await import('@/utils/place/mapOnboarding');

    expect(hasSeenMapOnboarding()).toBe(false);
    markMapOnboardingSeen();
    expect(hasSeenMapOnboarding()).toBe(true);
    expect(store.get('donggree.map.onboardingSeen')).toBe('1');
    vi.unstubAllGlobals();
  });

  it('저장소를 쓸 수 없어도 같은 페이지에서는 다시 띄우지 않는다', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    });
    vi.resetModules();
    const { hasSeenMapOnboarding, markMapOnboardingSeen } = await import('@/utils/place/mapOnboarding');

    expect(hasSeenMapOnboarding()).toBe(false);
    markMapOnboardingSeen();
    expect(hasSeenMapOnboarding()).toBe(true);
    vi.unstubAllGlobals();
  });
});
