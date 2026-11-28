/** [정각원의 비밀] 서버 공개 계약. 진행 중 정답·내부 후보 집합은 포함하지 않는다. 비회원은 통계가 없다. */
export type TMysteryOption = { id: string; label: string };
export type TMysteryGuess = { departmentId: string; buildingId: string; methodId: string };
export type TMysteryAttempt = {
  number: number;
  guess: TMysteryGuess;
  correct: boolean;
  clueText: string | null;
  clueCategory: string | null;
};
export type TMysteryTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
export type TMysteryToday = {
  gameDate: string;
  nextResetAt: string;
  title: string;
  subtitle: string;
  maxAttempts: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'WON' | 'LOST';
  options: { departments: TMysteryOption[]; buildings: TMysteryOption[]; methods: TMysteryOption[] };
  attempts: TMysteryAttempt[];
  statistics?: {
    completedGames: number;
    wonGames: number;
    successRate: number;
    averageAttempts: number | null;
    currentStreak: number;
    tier: TMysteryTier;
  };
  answer?: { department: string; building: string; method: string };
};
export type TMysterySubmission = TMysteryGuess & { gameDate: string; requestId: string };
// 비회원 진행은 서버가 저장하지 않고 암호화 토큰으로만 오간다.
export type TMysteryGuest = { today: TMysteryToday; progressToken: string };
export type TMysteryGuestSubmission = TMysteryGuess & { gameDate: string; progressToken: string | null };
