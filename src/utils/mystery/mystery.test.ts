import { describe, expect, it } from 'vitest';

import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import type { TMysteryToday } from '@/types/mystery/TMystery';
import { mysteryAnswerSentence, mysteryCountdown, mysteryShareText, sameMysteryGuess } from '@/utils/mystery/mystery';

const guess = { departmentId: 'D1', buildingId: 'B1', methodId: 'M1' };
const game: TMysteryToday = {
  gameDate: '2026-11-22',
  nextResetAt: '2026-11-22T15:00:00Z',
  title: '정각원의 비밀',
  subtitle: '사라진 연등',
  maxAttempts: 10,
  status: 'WON',
  options: {
    departments: [
      { id: 'D1', label: '비공개 학과 A' },
      { id: 'D2', label: '비공개 학과 B' },
    ],
    buildings: [
      { id: 'B1', label: '비공개 장소 A' },
      { id: 'B2', label: '비공개 장소 B' },
    ],
    methods: [
      { id: 'M1', label: '비공개 수단 A' },
      { id: 'M2', label: '비공개 수단 B' },
    ],
  },
  attempts: [
    { number: 1, guess, correct: false, clueText: '비공개 단서', clueCategory: 'METHOD' },
    {
      number: 2,
      guess: { ...guess, departmentId: 'D2' },
      correct: false,
      clueText: '비공개 단서 2',
      clueCategory: 'BUILDING',
    },
    {
      number: 3,
      guess: { ...guess, departmentId: 'D2', buildingId: 'B2' },
      correct: true,
      clueText: null,
      clueCategory: null,
    },
  ],
  statistics: {
    completedGames: 3,
    wonGames: 2,
    successRate: 200 / 3,
    averageAttempts: 6,
    currentStreak: 9,
    tier: 'SILVER',
  },
  answer: { department: '비공개 학과 B', building: '비공개 장소 B', method: '비공개 수단 A' },
};
describe('게임 공유', () => {
  it('사용자가 확정한 날짜·성공 횟수·스트릭·신문 이모지·링크 형식으로 복사한다', () => {
    const text = mysteryShareText(game, 'https://example.test/mystery');
    expect(text).toBe(
      [
        '🏮 정각원의 비밀 - 2026.11.22',
        '✅ 3번 의심으로 성공',
        '🔥 9일 연속 도전',
        '🗞️🗞️📰',
        '📰🗞️📰',
        '📰📰📰',
        '🔗 게임하러 가기 https://example.test/mystery',
      ].join('\n'),
    );
    expect(text).not.toContain('비공개');
    expect(text).not.toContain('D1');
    expect(text).not.toContain('🟥');
    expect(text).not.toContain('🟩');
  });
  it('실패도 스트릭을 유지하며 열 번의 시도를 한 줄씩 공유한다', () => {
    const attempts = Array.from({ length: 10 }, (_, index) => ({ ...game.attempts[0]!, number: index + 1 }));
    const text = mysteryShareText({ ...game, status: 'LOST', attempts }, 'test');
    expect(text).toContain('\n❌ 실패\n🔥 9일 연속 도전\n');
    expect(text?.split('\n').filter((line) => line.startsWith('🗞️'))).toHaveLength(10);
    expect(text).not.toContain('성공');
  });
  it('장소만 맞은 시도도 신문 이모지의 가운데 칸에만 표시한다', () => {
    const attempts = [{ ...game.attempts[0]!, guess: { departmentId: 'D1', buildingId: 'B2', methodId: 'M2' } }];
    expect(mysteryShareText({ ...game, status: 'LOST', attempts }, 'test')).toContain('🗞️📰🗞️');
  });
  it.each(['NOT_STARTED', 'IN_PROGRESS'] as const)(
    '정답이 잘못 포함되어도 %s 상태에서는 공유를 만들지 않는다',
    (status) => {
      expect(mysteryShareText({ ...game, status }, 'test')).toBeNull();
    },
  );
  it('종료됐어도 정답이 아직 없으면 항목별 정오를 추정하지 않는다', () => {
    expect(mysteryShareText({ ...game, answer: undefined }, 'test')).toBeNull();
  });
  it('정답과 후보를 연결할 수 없는 응답으로 잘못된 이모지 결과를 만들지 않는다', () => {
    expect(mysteryShareText({ ...game, options: { ...game.options, methods: [] } }, 'test')).toBeNull();
  });
  it('중복 판정은 세 항목이 모두 같아야 한다', () => {
    expect(sameMysteryGuess(guess, { ...guess })).toBe(true);
    expect(sameMysteryGuess(guess, { ...guess, methodId: 'M2' })).toBe(false);
  });
});

it('회원별 진행 조회 캐시를 분리한다', () => {
  expect(QUERY_KEYS.MYSTERY_TODAY(1)).not.toEqual(QUERY_KEYS.MYSTERY_TODAY(2));
});

describe('정답 문장', () => {
  it('학과·장소·수단을 한 문장에 넣고 받침 없는 수단에는 를을 쓴다', () => {
    expect(
      mysteryAnswerSentence({ department: '경영학과', building: '명진관', method: '108배로 단련한 코끼리의 코' }),
    ).toBe('어둠의 아코는 경영학과 소속으로, 명진관에서 108배로 단련한 코끼리의 코를 이용해 연등을 가져갔어요.');
  });
  it('받침 있는 수단에는 을을 쓴다', () => {
    expect(
      mysteryAnswerSentence({ department: '사학과', building: '혜화관', method: '과제 마감 직전에 발휘되는 괴력' }),
    ).toContain('괴력을 이용해');
  });
});

describe('다음 문제 카운트다운', () => {
  const reset = '2026-11-23T00:00:00+09:00';
  it('서버의 KST 교체 시각과 현재 절대 시각으로 남은 시간을 계산한다', () => {
    expect(mysteryCountdown(reset, Date.parse('2026-11-22T12:34:56Z'))).toBe('02:25:04');
  });
  it('자정 직전 남은 소수 초는 올림해 마지막 1초를 표시한다', () => {
    expect(mysteryCountdown(reset, Date.parse('2026-11-22T14:59:59.500Z'))).toBe('00:00:01');
  });
  it('자정 이후나 잘못된 시각에는 음수 또는 NaN을 표시하지 않는다', () => {
    expect(mysteryCountdown(reset, Date.parse('2026-11-22T15:00:01Z'))).toBe('00:00:00');
    expect(mysteryCountdown('invalid', Date.now())).toBe('00:00:00');
  });
});
