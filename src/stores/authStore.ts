import { create } from 'zustand';

interface IAuthState {
  accessToken: string | null;
}

interface IAuthActions {
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<IAuthState & IAuthActions>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null }),
}));
