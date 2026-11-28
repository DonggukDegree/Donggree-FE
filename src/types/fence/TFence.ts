import type { TCommonResponse } from '@/types/common';

// 제공하는 판 크기. 난이도 없이 크기로만 나눈다.
export type TFenceSize = 5 | 7 | 10;

// 변 하나의 상태. 0 비움, 1 울타리, 2 X. 서버와 같은 숫자로 한 줄 문자열을 주고받는다.
export type TFenceEdgeState = 0 | 1 | 2;

// POST /api/games/fence/puzzles. 정답은 token 안에 암호화돼 있어 화면은 숫자만 안다.
export type TFencePuzzle = {
  size: TFenceSize;
  clues: (number | null)[]; // 행 우선 size×size, 빈칸 null
  token: string;
  maxHints: number;
};

export type TFenceHintKind = 'WRONG' | 'FENCE' | 'CROSS';

// POST /api/games/fence/hints. 판당 maxHints번.
export type TFenceHint = {
  edge: number;
  kind: TFenceHintKind;
  hintsUsed: number;
  hintsRemaining: number;
};

export type TFenceRecord = { size: TFenceSize; bestSeconds: number | null };

// GET /api/games/fence/statistics. 로그인 회원만.
export type TFenceStatistics = {
  currentStreak: number;
  totalSolved: number;
  records: TFenceRecord[];
  solvedToday: boolean;
};

// POST /api/games/fence/completions. 풀이 시간은 서버가 판을 내준 시각부터 잰다.
export type TFenceCompletion = {
  size: TFenceSize;
  elapsedSeconds: number;
  hintsUsed: number;
  newRecord: boolean;
  solvedDate: string; // 한국 날짜 yyyy-MM-dd, 적립 확인 targetId(yyyyMMdd)로 쓴다
  statistics: TFenceStatistics;
};

export type TFenceStateRequest = { token: string; state: string };

export type TPostFencePuzzleResponse = TCommonResponse<TFencePuzzle>;
export type TPostFenceHintResponse = TCommonResponse<TFenceHint>;
export type TPostFenceCompletionResponse = TCommonResponse<TFenceCompletion>;
export type TGetFenceStatisticsResponse = TCommonResponse<TFenceStatistics>;
