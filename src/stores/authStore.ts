import { create } from 'zustand';

// "이 브라우저에서 로그인한 적이 있는지"를 나타내는 세션 힌트 키.
// refreshToken은 HttpOnly 쿠키라 JS가 존재 여부를 알 수 없으므로,
// 로그인/토큰 발급 시 이 플래그를 남겨 두고 "쿠키가 있을 법한 사용자"인지 추정하는 데 쓴다.
// (토큰 값 자체는 저장하지 않는다. 단순 불리언 힌트)
export const SESSION_HINT_KEY = 'hasSession';

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
    localStorage.setItem(SESSION_HINT_KEY, '1');
    set({ accessToken: token });
  },
  // 인증을 비우면(로그아웃/refresh 실패) 세션 힌트도 제거한다.
  clearAuth: () => {
    localStorage.removeItem(SESSION_HINT_KEY);
    set({ accessToken: null });
  },
}));
