/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// 아래 세 인터페이스는 TS 전역 타입 보강용이라 이름을 바꿀 수 없어(ImportMetaEnv/ImportMeta/Window),
// I 접두사 네이밍 규칙만 파일 단위로 예외 처리한다.
/* eslint-disable @typescript-eslint/naming-convention */

// 앱에서 사용하는 환경변수 타입. (VITE_ 접두사만 클라이언트로 노출된다)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // GA4 측정 ID(G-XXXXXXXXXX). 없으면 analytics가 no-op으로 동작한다.
  readonly VITE_GA_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// gtag.js가 전역(window)에 심는 값들. analytics.ts에서만 접근한다.
interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
}
