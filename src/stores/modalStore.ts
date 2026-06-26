import type { ComponentType, ReactNode, SVGProps } from 'react';
import { create } from 'zustand';

type TModalType = 'alert' | 'onboarding' | 'confirm';

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

interface IConfirmContent {
  title: string;
  action: string;
  description?: string;
  details?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'alert';
  onConfirm: () => void;
}

interface IModalState {
  type: TModalType | null;
  alertContent: IAlertContent | null;
  confirmContent: IConfirmContent | null;
}

interface IModalActions {
  openAlert: (content: IAlertContent) => void;
  openOnboarding: () => void;
  openConfirm: (content: IConfirmContent) => void;
  closeModal: () => void;
}

const initialState: IModalState = {
  type: null,
  alertContent: null,
  confirmContent: null,
};

export const useModalStore = create<IModalState & IModalActions>((set) => ({
  ...initialState,
  openAlert: (content) => set({ type: 'alert', alertContent: content, confirmContent: null }),
  openOnboarding: () => set({ type: 'onboarding', alertContent: null, confirmContent: null }),
  openConfirm: (content) => set({ type: 'confirm', alertContent: null, confirmContent: content }),
  closeModal: () => set(initialState),
}));
