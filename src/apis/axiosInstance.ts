import axios from 'axios';

import { useAuthStore } from '@/stores/authStore';

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

    if (!refreshPromise) {
      originalRequest._retry = true;
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
