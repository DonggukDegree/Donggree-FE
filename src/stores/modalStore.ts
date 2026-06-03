import type { ComponentType, ReactNode, SVGProps } from 'react';
import { create } from 'zustand';

type TModalType = 'alert' | 'onboarding';

interface IAlertContent {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  // 문구 일부에 색상 강조(span 등)를 넣을 수 있도록 문자열뿐 아니라 ReactNode를 허용한다.
  subtitle: ReactNode;
  description: string;
  buttonText?: string;
  buttonVariant?: 'primary' | 'alert' | 'disabled' | 'outlined';
  onConfirm?: () => void;
}

interface IModalState {
  type: TModalType | null;
  alertContent: IAlertContent | null;
}

interface IModalActions {
  openAlert: (content: IAlertContent) => void;
  openOnboarding: () => void;
  closeModal: () => void;
}

const initialState: IModalState = {
  type: null,
  alertContent: null,
};

export const useModalStore = create<IModalState & IModalActions>((set) => ({
  ...initialState,
  openAlert: (content) => set({ type: 'alert', alertContent: content }),
  openOnboarding: () => set({ type: 'onboarding', alertContent: null }),
  closeModal: () => set(initialState),
}));
