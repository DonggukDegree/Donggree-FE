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
  it('동글맵 이벤트는 카테고리 코드만 보내고 장소명·PLACE 오류 코드 외 값은 버림', () => {
    location.pathname = '/map';
    analytics.trackEvent('place_select', { place_category: 'CAFE', place_name: '동국반점' });
    analytics.trackEvent('place_category_select', { place_category: 'UNKNOWN' });
    analytics.trackEvent('error_shown', { error_source: 'donggle_map', code: 'PLACE404_1', status: 404 });
    const sent = events();
    expect(sent.find((event) => event[1] === 'place_select')?.[2]).toMatchObject({ place_category: 'CAFE' });
    expect(sent.find((event) => event[1] === 'place_select')?.[2]).not.toHaveProperty('place_name');
    expect(sent.find((event) => event[1] === 'place_category_select')?.[2]).not.toHaveProperty('place_category');
    analytics.trackEvent('place_duplicate_shown', { duplicate_type: 'exact' });
    analytics.trackEvent('student_verification_select', { verification_method: 'school_email', email: 'x' });
    expect(events().find((event) => event[1] === 'place_duplicate_shown')?.[2]).toMatchObject({
      duplicate_type: 'exact',
    });
    expect(events().find((event) => event[1] === 'student_verification_select')?.[2]).toEqual(
      expect.objectContaining({ verification_method: 'school_email' }),
    );
    expect(events().find((event) => event[1] === 'student_verification_select')?.[2]).not.toHaveProperty('email');
    analytics.trackEvent('place_report_submit', {
      place_category: 'CAFE',
      report_reason: 'OTHER',
      description: '사장님 연락처 010',
    });
    analytics.trackEvent('place_report_start', { report_reason: 'UNKNOWN' });
    expect(events().find((event) => event[1] === 'place_report_submit')?.[2]).toMatchObject({
      place_category: 'CAFE',
      report_reason: 'OTHER',
    });
    expect(events().find((event) => event[1] === 'place_report_submit')?.[2]).not.toHaveProperty('description');
    expect(events().find((event) => event[1] === 'place_report_start')?.[2]).not.toHaveProperty('report_reason');
    analytics.trackEvent('place_review_submit', {
      place_category: 'CAFE',
      review_rating: 4,
      content: '맛있어요 맛있어요',
    });
    analytics.trackEvent('place_review_report_submit', { report_reason: 'ABUSE' });
    analytics.trackEvent('place_review_edit', { review_rating: 9 });
    expect(events().find((event) => event[1] === 'place_review_submit')?.[2]).toMatchObject({ review_rating: 4 });
    expect(events().find((event) => event[1] === 'place_review_submit')?.[2]).not.toHaveProperty('content');
    expect(events().find((event) => event[1] === 'place_review_report_submit')?.[2]).toMatchObject({
      report_reason: 'ABUSE',
    });
    expect(events().find((event) => event[1] === 'place_review_edit')?.[2]).not.toHaveProperty('review_rating');
    analytics.trackEvent('place_category_select', { place_category: 'HIDDEN_GEM' });
    analytics.trackEvent('place_sub_filter_select', { place_filter: 'SOLO_DINING' });
    expect(
      events()
        .filter((event) => event[1] === 'place_category_select')
        .at(-1)?.[2],
    ).toMatchObject({
      place_category: 'HIDDEN_GEM',
    });
    expect(events().find((event) => event[1] === 'place_sub_filter_select')?.[2]).toMatchObject({
      place_filter: 'SOLO_DINING',
    });
    expect(sent.find((event) => event[1] === 'error_shown')?.[2]).toMatchObject({
      error_source: 'donggle_map',
      code: 'PLACE404_1',
    });
  });

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

  it('동아리 이벤트는 ID·고정 코드만 보내고 동아리 오류 코드를 그대로 보존', () => {
    location.pathname = '/clubs';
    analytics.trackEvent('club_filter_select', {
      club_filter_group: 'field',
      club_filter_value: 'ACADEMIC',
      club_filter_on: true,
    });
    analytics.trackEvent('club_sort_select', { club_sort: 'UNKNOWN' });
    analytics.trackEvent('club_apply_link_click', {
      club_id: 3,
      club_link_area: 'recruitment',
      url: 'https://open.kakao.com/x',
      label: '오픈채팅',
    });
    analytics.trackEvent('club_edit_complete', { club_id: -1, club_applied: 'direct' });
    analytics.trackEvent('student_verification_shown', { verification_context: 'club' });
    analytics.trackEvent('error_shown', { error_source: 'club', code: 'CLUB409_4', status: 409 });
    const payload = (name: string) => events().find((event) => event[1] === name)?.[2];
    expect(payload('club_filter_select')).toMatchObject({
      club_filter_group: 'field',
      club_filter_value: 'ACADEMIC',
      club_filter_on: true,
    });
    expect(payload('club_sort_select')).not.toHaveProperty('club_sort');
    expect(payload('club_apply_link_click')).toMatchObject({ club_id: 3, club_link_area: 'recruitment' });
    expect(payload('club_apply_link_click')).not.toHaveProperty('url');
    expect(payload('club_apply_link_click')).not.toHaveProperty('label');
    expect(payload('club_edit_complete')).toMatchObject({ club_applied: 'direct' });
    expect(payload('club_edit_complete')).not.toHaveProperty('club_id');
    expect(payload('student_verification_shown')).toMatchObject({ verification_context: 'club' });
    expect(payload('error_shown')).toMatchObject({ error_source: 'club', code: 'CLUB409_4', status: 409 });
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
