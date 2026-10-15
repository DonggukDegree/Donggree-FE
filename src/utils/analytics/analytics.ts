/** [공통 > 분석] 환경·권한·URL·개인정보를 검사하는 유일한 GA 발송 경로 */
import { ERROR_SOURCES, EVENT_NAMES, PAGE_NAMES, type TAnalyticsEvent } from '@/constants/analytics';
import { COURSE_TYPES, type TCourseType } from '@/types/course';

const GA_ID = import.meta.env.VITE_GA_ID;
type TProperties = { department: string | null; college_name: string | null; admission_year: string | null };
type TPendingEvent = { name: TAnalyticsEvent; params: Record<string, unknown> };
const emptyProperties = (): TProperties => ({ department: null, college_name: null, admission_year: null });
let properties = emptyProperties();
let userId: number | null = null;
let identity: 'pending' | 'allowed' | 'excluded' = 'pending';
let consent = true; // 현재 동의 UI는 없다. 향후 철회 연동 시 false로 전환한다.
let initialized = false;
let guarded = false;
let callbackSanitized = false;
let pending: TPendingEvent[] = [];
let visitKey = '';
let visitId = '';
let identityGeneration = 0;
let once = new Set<string>();

const enabledEnvironment = () =>
  Boolean(GA_ID) &&
  import.meta.env.PROD &&
  import.meta.env.MODE === 'production' &&
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  ['donggree.site', 'www.donggree.site'].includes(window.location.hostname);
export const isExcludedPath = (path: string) => path === '/admin' || path.startsWith('/admin/');
const safeLocation = () => {
  const { pathname, search, hash } = window.location;
  return (
    Boolean(PAGE_NAMES[pathname]) &&
    !isExcludedPath(pathname) &&
    (pathname !== '/login/callback' || (callbackSanitized && !search && !hash))
  );
};
const canSend = () => enabledEnvironment() && consent && identity === 'allowed' && safeLocation();
const disable = (value: boolean) => {
  if (GA_ID && typeof window !== 'undefined') window[`ga-disable-${GA_ID}`] = value;
};
const command = (...args: unknown[]) => {
  try {
    window.gtag?.(...args);
  } catch {
    /* 분석 차단은 서비스 이용을 중단시키지 않는다. */
  }
};
export const createAttemptId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
};
const pageParams = (path = window.location.pathname) => ({
  page_path: path,
  page_location: `${window.location.origin}${path}`,
  page_title: `${PAGE_NAMES[path] ?? '페이지를 찾을 수 없음'} | 동그리`,
  page_name_ko: PAGE_NAMES[path] ?? '페이지를 찾을 수 없음',
});

/** 초기 준비만 수행한다. 권한 확인 전에는 외부 스크립트도 로드하지 않는다. */
export const initGA = () => {
  disable(true);
  if (guarded || typeof window === 'undefined') return;
  guarded = true;
  // 실제 주소 변경 전에 차단한다. 허용은 전역 동기화 이후에만 한다.
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = window.history[method].bind(window.history);
    window.history[method] = (...args: Parameters<History[typeof method]>) => {
      disable(true);
      return original(args[0], args[1], args[2]);
    };
  }
  window.addEventListener('popstate', () => disable(true), { capture: true });
};
function safeReferrer() {
  try {
    const url = new URL(document.referrer);
    return url.origin === window.location.origin && PAGE_NAMES[url.pathname]
      ? `${url.origin}${url.pathname}`
      : url.origin;
  } catch {
    return '';
  }
}
const configure = () => {
  command('set', 'user_properties', properties);
  command('config', GA_ID, {
    send_page_view: false,
    user_id: userId === null ? null : String(userId),
    ...pageParams(),
    page_referrer: safeReferrer(),
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
};
const activate = () => {
  if (!canSend()) {
    disable(true);
    return false;
  }
  disable(false);
  if (!initialized) {
    initialized = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // Google 태그의 표준 arguments 형식을 유지한다.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    command('js', new Date());
    configure();
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      script.referrerPolicy = 'origin';
      document.head.appendChild(script);
    } catch {
      disable(true);
      return false;
    }
  } else configure();
  const waiting = pending;
  pending = [];
  waiting.forEach(({ name, params }) => command('event', name, params));
  return true;
};
/** 계정이 달라지는 순간 호출한다. 이전 계정의 미발송 기록과 속성은 폐기한다. */
export const resetAnalyticsIdentity = (dropPending = true) => {
  disable(true);
  identityGeneration += 1;
  identity = 'pending';
  properties = emptyProperties();
  userId = null;
  if (dropPending) {
    pending = [];
    once = new Set();
  }
  if (initialized) {
    command('set', 'user_properties', properties);
    command('config', GA_ID, { user_id: null, send_page_view: false });
  }
};
const cohortName = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 100 && !/[@<>\r\n]|https?:|\d{6,}/.test(value)
    ? value.trim()
    : null;
export const syncAnalyticsIdentity = (
  state: 'pending' | 'allowed' | 'excluded',
  memberId: number | null,
  values: Partial<TProperties> = {},
) => {
  identity = state;
  userId = state === 'allowed' ? memberId : null;
  properties = {
    department: cohortName(values.department),
    college_name: cohortName(values.college_name),
    admission_year:
      values.admission_year && /^(19|20)\d{2}$/.test(values.admission_year) ? values.admission_year : null,
  };
  if (state === 'excluded') pending = [];
  activate();
};
export const setAnalyticsConsent = (allowed: boolean) => {
  consent = allowed;
  if (!allowed) {
    pending = [];
    disable(true);
  } else activate();
};
export const markCallbackSanitized = () => {
  callbackSanitized = true;
};
const sanitizeParams = (params: Record<string, unknown>) => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (
      ['credit_gap', 'achievement_rate', 'course_count'].includes(key) &&
      typeof value === 'number' &&
      Number.isFinite(value)
    )
      result[key] = value;
    if (['credit_gap_ok', 'graduated'].includes(key) && typeof value === 'boolean') result[key] = value;
    if (key === 'method' && value === 'kakao') result[key] = value;
    if (key === 'attempt_id' && typeof value === 'string' && /^[a-z0-9-]{12,64}$/i.test(value)) result[key] = value;
    if (key === 'source' && ERROR_SOURCES.includes(value as (typeof ERROR_SOURCES)[number])) result[key] = value;
    if (
      key === 'code' &&
      typeof value === 'string' &&
      /^(?:COMMON|USER|TRANSCRIPT|GRADUATION)\d{3}_\d{1,2}$|^(?:NETWORK_ERROR|UNKNOWN_ERROR|INVALID_PDF|LOGIN_FAILED|MISSING_TOKEN|USER_CHECK_FAILED|RENDER_ERROR|NOT_FOUND|VALIDATION_ERROR)$/.test(
        value,
      )
    )
      result[key] = value;
    if (
      key === 'status' &&
      typeof value === 'number' &&
      (value === 0 || (Number.isInteger(value) && value >= 100 && value <= 599))
    )
      result[key] = value;
    if (key === 'course_type' && typeof value === 'string' && COURSE_TYPES.includes(value as TCourseType))
      result[key] = value;
  }
  return result;
};
export const trackEvent = (name: TAnalyticsEvent, params: Record<string, unknown> = {}) => {
  if (!enabledEnvironment() || !consent || identity === 'excluded' || !safeLocation() || !EVENT_NAMES[name]) return;
  const payload = {
    ...sanitizeParams(params),
    ...pageParams(),
    page_referrer: safeReferrer(),
    event_label_ko: EVENT_NAMES[name],
    page_visit_id: visitId,
  };
  if (identity === 'pending') {
    if (pending.length < 100) pending.push({ name, params: payload });
    return;
  }
  if (activate()) command('event', name, payload);
};
export const trackOncePerVisit = (name: TAnalyticsEvent, params: Record<string, unknown> = {}, discriminator = '') => {
  const key = `${name}:${discriminator}`;
  if (once.has(key)) return;
  once.add(key);
  trackEvent(name, params);
};
/** 뒤로가기도 새 방문으로 세고 StrictMode·동일 전환의 반복 알림만 합친다. */
export const trackPageView = (path: string, key: string) => {
  const pathname = path.split(/[?#]/)[0] || '/';
  document.title = `${PAGE_NAMES[pathname] ?? '페이지를 찾을 수 없음'} | 동그리`;
  activate();
  if (!safeLocation()) return;
  if (visitKey === `${key}:${pathname}`) return;
  visitKey = `${key}:${pathname}`;
  visitId = createAttemptId();
  once = new Set();
  trackEvent('page_view');
};
export const getAnalyticsIdentityGeneration = () => identityGeneration;
