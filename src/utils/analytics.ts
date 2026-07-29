/**
 * [공통 > 분석] GA4(Google Analytics 4) 연동 유틸
 * gtag.js를 코드로 주입하고(index.html에 스니펫을 박지 않는다), 페이지뷰·커스텀 이벤트 전송을 한곳에 모은다.
 * VITE_GA_ID가 없으면 모든 함수가 조용히 no-op이 되어(가드) 로컬/미설정 환경에서도 안전하다.
 */

// 측정 ID(G-XXXXXXXXXX). .env의 VITE_GA_ID로 주입한다.
const GA_ID = import.meta.env.VITE_GA_ID;

// GA 사용 가능 조건: 측정 ID가 있고 브라우저 환경일 때만. (SSR은 없지만 방어적으로 window 체크)
const isGAEnabled = (): boolean => Boolean(GA_ID) && typeof window !== 'undefined';

/**
 * gtag.js 스크립트를 1회 주입하고 dataLayer/gtag를 초기화한다.
 * 앱 진입점(main.tsx)에서 한 번만 호출한다. 최초 페이지뷰는 라우트 추적(usePageTracking)이 담당하므로
 * 여기서는 자동 page_view 전송을 끄고(send_page_view:false) 중복 집계를 막는다.
 */
export const initGA = (): void => {
  if (!isGAEnabled()) return;

  // gtag.js 로더 스크립트 주입 (async)
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // 표준 gtag 부트스트랩. dataLayer에 인자를 그대로 push하는 얇은 래퍼다.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // send_page_view:false — 페이지뷰는 SPA 라우트 변경마다 trackPageView로 직접 보낸다.
  window.gtag('config', GA_ID, { send_page_view: false });
};

/**
 * 페이지뷰 전송. SPA는 물리적 새로고침이 없어 라우트 변경 시 수동으로 보내야 한다.
 * @param path 현재 경로(location.pathname + search)
 */
export const trackPageView = (path: string): void => {
  if (!isGAEnabled() || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
};

/**
 * 커스텀 이벤트 전송. 사용자 핵심 액션(로그인·온보딩·업로드·졸업 판정 등)을 집계한다.
 * @param name  이벤트 이름(snake_case 권장)
 * @param params 이벤트 파라미터(선택)
 */
export const trackEvent = (name: string, params?: Record<string, unknown>): void => {
  if (!isGAEnabled() || !window.gtag) return;
  window.gtag('event', name, params);
};

/**
 * 사용자 속성 설정. 이후 전송되는 모든 이벤트에 세그먼트 꼬리표로 붙어 학과·단과대별 분석을 가능하게 한다.
 * 개인 식별 정보(이름·학번·이메일)는 GA4 약관 위반이므로 절대 넣지 않는다. 집단 값(학과·단과대)만 허용한다.
 * @param properties 사용자 속성(집단 값). undefined 값은 gtag가 무시한다.
 */
export const setUserProperties = (properties: Record<string, string | undefined>): void => {
  if (!isGAEnabled() || !window.gtag) return;
  window.gtag('set', 'user_properties', properties);
};
