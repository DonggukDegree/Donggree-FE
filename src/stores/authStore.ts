import { create } from 'zustand';

// "이 브라우저에서 로그인한 적이 있는지"를 나타내는 세션 힌트 키.
// refreshToken은 HttpOnly 쿠키라 JS가 존재 여부를 알 수 없으므로,
// 로그인/토큰 발급 시 이 플래그를 남겨 두고 "쿠키가 있을 법한 사용자"인지 추정하는 데 쓴다.
// (토큰 값 자체는 저장하지 않는다. 단순 불리언 힌트)
const SESSION_HINT_KEY = 'hasSession';

// localStorage 접근은 일부 환경(사파리 비공개 모드, 스토리지 차단/용량 초과 등)에서 예외를 던질 수 있다.
// 세션 힌트는 보조 수단일 뿐이라, 접근 실패가 인증 상태나 인터셉터 흐름을 끊지 않도록 모두 안전하게 감싼다.
const setSessionHint = () => {
  try {
    localStorage.setItem(SESSION_HINT_KEY, '1');
  } catch {
    // 쓰기 실패는 무시한다.
  }
};

const clearSessionHint = () => {
  try {
    localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // 삭제 실패는 무시한다.
  }
};

// 세션 힌트(로그인 이력) 존재 여부를 안전하게 읽는다.
// 스토리지 접근 자체가 막힌 경우엔 refresh 기회를 막지 않도록 true로 간주한다. (fail-open)
export const hasSessionHint = (): boolean => {
  try {
    return !!localStorage.getItem(SESSION_HINT_KEY);
  } catch {
    return true;
  }
};

interface IAuthState {
  accessToken: string | null;
}

interface IAuthActions {
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<IAuthState & IAuthActions>((set) => ({
  accessToken: null,
  // 토큰을 받으면(로그인/재발급) 세션 힌트를 남긴다.
  setAccessToken: (token) => {
    setSessionHint();
    set({ accessToken: token });
  },
  // 인증을 비우면(로그아웃/refresh 실패) 세션 힌트도 제거한다.
  clearAuth: () => {
    clearSessionHint();
    set({ accessToken: null });
  },
}));
