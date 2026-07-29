/**
 * [공용] axios 인스턴스
 * 모든 API 호출이 지나가는 단일 통로.
 *  - withCredentials: refreshToken(HttpOnly 쿠키)을 자동으로 실어 보낸다
 *  - 요청 인터셉터: 메모리에 있는 accessToken을 Authorization 헤더에 붙인다
 *  - 응답 인터셉터: 401이면 refresh를 '한 번만' 수행하고, 나머지 요청은 그 결과를 기다렸다가 재시도한다
 */
import axios from 'axios';

import { hasSessionHint, useAuthStore } from '@/stores/authStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 한 번도 로그인한 적 없는(세션 힌트 없는) 사용자는 refreshToken 쿠키도 없으므로,
    // refresh를 시도해봐야 400(쿠키 없음)으로 실패할 뿐이다. 불필요한 왕복을 막기 위해 바로 거절한다.
    // (미인증 상태에서 보호 경로 진입 시 발생하던 refresh 호출 1회를 제거)
    if (!hasSessionHint()) {
      return Promise.reject(error);
    }

    // 재시도 요청임을 먼저 표시한다. (동시에 401난 여러 요청이 각자 refresh를 다시 트리거하지 않도록,
    // refreshPromise 생성 여부와 무관하게 모든 요청에 _retry를 찍는다)
    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = axios
        .post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {}, { withCredentials: true })
        .then(({ data }) => {
          const newToken: string = data.result.accessToken;
          useAuthStore.getState().setAccessToken(newToken);
          return newToken;
        })
        .catch(() => {
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          throw error;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise.then(
      (token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      },
      () => Promise.reject(error),
    );
  },
);

export default axiosInstance;
