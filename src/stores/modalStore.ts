import type { ComponentType, SVGProps } from 'react';
import { create } from 'zustand';

type TModalType = 'alert' | 'feedback';

interface IAlertContent {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  description: string;
  buttonText?: string;
  onConfirm?: () => void;
}

interface IModalState {
  type: TModalType | null;
  alertContent: IAlertContent | null;
}

interface IModalActions {
  openAlert: (content: IAlertContent) => void;
  openFeedback: () => void;
  closeModal: () => void;
}

const initialState: IModalState = {
  type: null,
  alertContent: null,
};

export const useModalStore = create<IModalState & IModalActions>((set) => ({
  ...initialState,
  openAlert: (content) => set({ type: 'alert', alertContent: content }),
  openFeedback: () => set({ type: 'feedback', alertContent: null }),
  closeModal: () => set(initialState),
}));
