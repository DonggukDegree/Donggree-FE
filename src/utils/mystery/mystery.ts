/** [정각원의 비밀] 종료 후 항목별 정오를 이모지로 공유하고 선택 기록을 표시한다. */
import type { TMysteryGuess, TMysteryOption, TMysteryToday } from '@/types/mystery/TMystery';

export const MYSTERY_TIER_LABELS = { BRONZE: '브론즈', SILVER: '실버', GOLD: '골드', DIAMOND: '다이아' } as const;

export const sameMysteryGuess = (a: TMysteryGuess, b: TMysteryGuess) =>
  a.departmentId === b.departmentId && a.buildingId === b.buildingId && a.methodId === b.methodId;
export const mysteryLabel = (options: TMysteryOption[], id: string) =>
  options.find((item) => item.id === id)?.label ?? '';
/** 정답이 공개된 종료 게임에만 학과·장소·수단 순서의 정오를 계산한다. */
export const mysteryShareText = (game: TMysteryToday, url: string): string | null => {
  if ((game.status !== 'WON' && game.status !== 'LOST') || !game.answer) return null;
  const fields = [
    ['departments', 'departmentId', 'department'],
    ['buildings', 'buildingId', 'building'],
    ['methods', 'methodId', 'method'],
  ] as const;
  const answer = game.answer;
  const answerIds = fields.map(
    ([options, , field]) => game.options[options].find((option) => option.label === answer[field])?.id,
  );
  if (answerIds.some((id) => !id)) return null;
  const rows = game.attempts.map((attempt) => {
    const matches = fields.map(([, field], index) => attempt.guess[field] === answerIds[index]);
    return matches.map((matched) => (matched ? '📰' : '🗞️')).join('');
  });
  return [
    `🏮 정각원의 비밀 - ${game.gameDate.replaceAll('-', '.')}`,
    game.status === 'WON' ? `✅ ${game.attempts.length}번 의심으로 성공` : '❌ 실패',
    `🔥 ${game.statistics.currentStreak}일 연속 도전`,
    ...rows,
    `🔗 게임하러 가기 ${url}`,
  ].join('\n');
};

/** 수단의 마지막 한글 받침에 맞는 목적격 조사를 고른다. */
export const mysteryObjectParticle = (method: string) => {
  const last = method.trim().at(-1) ?? '';
  const code = last.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0 ? '을' : '를';
};
export const mysteryAnswerSentence = (answer: NonNullable<TMysteryToday['answer']>) => {
  const particle = mysteryObjectParticle(answer.method);
  return `어둠의 아코는 ${answer.department} 소속으로, ${answer.building}에서 ${answer.method}${particle} 이용해 연등을 가져갔어요.`;
};

/** 로컬 시간대와 무관하게 서버 교체 시각까지 남은 시간을 계산하며 만료 후 음수를 표시하지 않는다. */
export const mysteryCountdown = (resetAt: string, now: number) => {
  const reset = new Date(resetAt).getTime();
  const seconds = Number.isFinite(reset) ? Math.max(0, Math.ceil((reset - now) / 1000)) : 0;
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
};
