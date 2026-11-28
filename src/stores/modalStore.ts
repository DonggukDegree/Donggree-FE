/**
 * [전역 상태] 모달 스토어
 * 화면 어디서든 모달을 열 수 있도록 '무엇을 열지'만 담아 둔다.
 * 실제 렌더는 레이아웃의 ModalProvider가 type을 보고 결정한다.
 *  - alert: 안내 / onboarding: 온보딩 / confirm: 관리자 저장 확인 / survey: 만족도 조사
 *  - studentVerification: 동글맵 쓰기 전 학생 인증 안내(학교 이메일·성적표 두 경로)
 *  - mapOnboarding: 동글맵 첫 방문 튜토리얼
 *  - fenceResult: 울타리치기 완성 결과·통계(결과 없이 열면 통계만) / fenceHelp: 울타리치기 게임 방법
 */
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { create } from 'zustand';

import type { TErrorSource, TTranscriptNoticeParams } from '@/constants/analytics';
import type { TFenceSize } from '@/types/fence/TFence';
import { createAttemptId } from '@/utils/analytics/analytics';

type TModalType =
  | 'alert'
  | 'onboarding'
  | 'confirm'
  | 'survey'
  | 'studentVerification'
  | 'mapOnboarding'
  | 'mysteryHelp'
  | 'mysteryResult'
  | 'fenceHelp'
  | 'fenceResult';

interface IAlertContent {
  analyticsDisplayId?: string;
  analyticsError?: { error_source: TErrorSource; code: string; status: number };
  analyticsNotice?: TTranscriptNoticeParams;
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

// 방금 완성한 판의 표시값. 회원 통계는 서버 쿼리 캐시에서 읽고 여기에는 복사하지 않는다.
export interface IFenceResultContent {
  size: TFenceSize;
  elapsedSeconds: number;
  hintsUsed: number;
  newRecord: boolean;
  confirmed: boolean | null; // 회원 기록 저장 여부. null이면 서버 확인 중, 비회원은 false
  onNewGame?: () => void;
}

interface IModalState {
  type: TModalType | null;
  mysteryDate: string | null;
  fenceResult: IFenceResultContent | null;
  alertContent: IAlertContent | null;
  confirmContent: IConfirmContent | null;
}

interface IModalActions {
  openAlert: (content: IAlertContent) => void;
  openOnboarding: () => void;
  openConfirm: (content: IConfirmContent) => void;
  openSurvey: () => void;
  openStudentVerification: () => void;
  openMapOnboarding: () => void;
  closeModal: () => void;
  openMysteryHelp: () => void;
  openMysteryResult: (date: string) => void;
  closeMysteryResult: () => void;
  openFenceHelp: () => void;
  openFenceResult: (content: IFenceResultContent | null) => void;
  updateFenceResult: (patch: Partial<IFenceResultContent>) => void;
  closeFenceResult: () => void;
}

const initialState: IModalState = {
  type: null,
  mysteryDate: null,
  fenceResult: null,
  alertContent: null,
  confirmContent: null,
};

export const useModalStore = create<IModalState & IModalActions>((set) => ({
  ...initialState,
  openAlert: (content) =>
    set({ type: 'alert', alertContent: { ...content, analyticsDisplayId: createAttemptId() }, confirmContent: null }),
  openOnboarding: () => set({ type: 'onboarding', alertContent: null, confirmContent: null }),
  openConfirm: (content) => set({ type: 'confirm', alertContent: null, confirmContent: content }),
  // 자동 설문은 이미 열린 필수 안내·확인 모달을 덮어쓰지 않는다.
  openSurvey: () => set((state) => (state.type === null ? { ...initialState, type: 'survey' } : state)),
  openStudentVerification: () => set({ ...initialState, type: 'studentVerification' }),
  // 튜토리얼은 이미 열린 다른 모달을 덮어쓰지 않는다.
  openMapOnboarding: () => set((state) => (state.type === null ? { ...initialState, type: 'mapOnboarding' } : state)),
  openMysteryResult: (date) => set({ ...initialState, type: 'mysteryResult', mysteryDate: date }),
  openMysteryHelp: () => set({ ...initialState, type: 'mysteryHelp' }),
  closeMysteryResult: () => set((state) => (state.type === 'mysteryResult' ? initialState : state)),
  openFenceHelp: () => set({ ...initialState, type: 'fenceHelp' }),
  openFenceResult: (content) => set({ ...initialState, type: 'fenceResult', fenceResult: content }),
  // 결과 창이 열린 뒤 도착한 서버 확인(시간·최고 기록)만 덮어쓴다.
  updateFenceResult: (patch) =>
    set((state) =>
      state.type === 'fenceResult' && state.fenceResult ? { fenceResult: { ...state.fenceResult, ...patch } } : state,
    ),
  closeFenceResult: () =>
    set((state) => (state.type === 'fenceResult' || state.type === 'fenceHelp' ? initialState : state)),
  closeModal: () => set(initialState),
}));
