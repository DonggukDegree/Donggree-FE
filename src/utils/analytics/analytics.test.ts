/** [분석 회귀] 개인정보·캠페인 키 차단과 방문별 이벤트 검증 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AnalyticsModule from '@/utils/analytics/analytics';

let analytics: typeof AnalyticsModule;
let location: URL;
let browser: {
  dataLayer: IArguments[];
  location: URL;
  history: { pushState: ReturnType<typeof vi.fn>; replaceState: ReturnType<typeof vi.fn> };
  addEventListener: ReturnType<typeof vi.fn>;
};
const events = () => browser.dataLayer.map((args) => Array.from(args)).filter((args) => args[0] === 'event');

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('VITE_GA_ID', 'G-TEST');
  vi.stubEnv('PROD', true);
  vi.stubEnv('MODE', 'production');
  location = new URL('https://donggree.site/');
  browser = {
    dataLayer: [],
    location,
    history: { pushState: vi.fn(), replaceState: vi.fn() },
    addEventListener: vi.fn(),
  };
  vi.stubGlobal('window', browser);
  vi.stubGlobal('document', {
    title: '동그리',
    referrer: '',
    createElement: () => ({}),
    head: { appendChild: vi.fn() },
  });
  analytics = await import('@/utils/analytics/analytics');
  analytics.initGA();
  analytics.trackPageView('/', 'first');
  analytics.syncAnalyticsIdentity('allowed', null);
});

describe('GA 발송 경계', () => {
  it('오류 위치를 error_source로 보내고 캠페인·개인정보 키는 버림', () => {
    analytics.trackEvent('error_shown', {
      error_source: 'transcript_upload',
      source: 'transcript_upload',
      medium: 'private',
      email: 'private@example.invalid',
      code: 'EMAIL429_1',
      status: 429,
    });
    const payload = events().find((event) => event[1] === 'error_shown')?.[2];
    expect(payload).toMatchObject({ error_source: 'transcript_upload', code: 'EMAIL429_1', status: 429 });
    expect(payload).not.toHaveProperty('source');
    expect(payload).not.toHaveProperty('medium');
    expect(payload).not.toHaveProperty('email');
  });

  it('F 확인 개수와 시작 위치·안내 사유를 보존하고 잘못된 값은 버림', () => {
    analytics.trackEvent('transcript_notice_shown', { grade_review_count: 2, notice_reason: 'both', credit_gap: 3 });
    analytics.trackEvent('start_click', { placement: 'hero' });
    analytics.trackEvent('start_click', { placement: 'private@example.invalid', grade_review_count: -1 });
    expect(events().find((event) => event[1] === 'transcript_notice_shown')?.[2]).toMatchObject({
      grade_review_count: 2,
      notice_reason: 'both',
      credit_gap: 3,
    });
    expect(events().filter((event) => event[1] === 'start_click')[0]?.[2]).toMatchObject({ placement: 'hero' });
    expect(events().at(-1)?.[2]).not.toHaveProperty('placement');
    expect(events().at(-1)?.[2]).not.toHaveProperty('grade_review_count');
  });

  it('동일 방문의 반복은 합치고 뒤로가기로 돌아온 화면은 다시 기록함', () => {
    analytics.trackPageView('/', 'first');
    location.pathname = '/login';
    analytics.trackPageView('/login', 'login');
    location.pathname = '/';
    analytics.trackPageView('/', 'first');
    expect(
      events()
        .filter((event) => event[1] === 'page_view')
        .map((event) => (event[2] as Record<string, unknown>).page_path),
    ).toEqual(['/', '/login', '/']);
    expect(document.title).toBe('홈 | 동그리');
  });

  it('관리자와 동의 철회 후 이벤트를 수집하지 않음', () => {
    const before = events().length;
    analytics.syncAnalyticsIdentity('excluded', null);
    analytics.trackEvent('start_click');
    analytics.setAnalyticsConsent(false);
    analytics.syncAnalyticsIdentity('allowed', null);
    analytics.trackEvent('start_click');
    expect(events()).toHaveLength(before);
  });
});
