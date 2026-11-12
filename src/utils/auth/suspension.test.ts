/** [인증] 정지 회원 안내 문구·로그인 콜백 쿼리·오류 응답 해석 검사 */
import { describe, expect, it } from 'vitest';

import { formatSuspensionMessage, getSuspensionFromError, parseSuspensionParams } from '@/utils/auth/suspension';

describe('정지 회원 안내', () => {
  it('신고 정지는 "신고로", 관리자 정지는 "운영 정책에 따라" 기간·이용 가능 시각·고객지원 안내', () => {
    expect(formatSuspensionMessage({ suspendedUntil: '2026-12-13T10:05:00', days: 30, byReport: true })).toBe(
      '신고로 30일 동안 동그리를 이용할 수 없어요. 2026.12.13 10:05부터 다시 이용할 수 있어요. 문의사항이 있다면 고객지원으로 문의해주세요.',
    );
    expect(formatSuspensionMessage({ suspendedUntil: '2026-12-13T10:05:00', days: 3, byReport: false })).toMatch(
      /^운영 정책에 따라 3일 동안/,
    );
  });

  it('로그인 콜백 쿼리에 정지 내용이 있으면 읽고 없으면 null', () => {
    expect(
      parseSuspensionParams(
        new URLSearchParams('suspendedUntil=2026-12-13T10:00&suspensionDays=14&suspensionByReport=true'),
      ),
    ).toEqual({ suspendedUntil: '2026-12-13T10:00', days: 14, byReport: true });
    expect(parseSuspensionParams(new URLSearchParams('accessToken=abc'))).toBeNull();
  });

  it('403 AUTH403_2 응답만 정지로 보고 다른 오류는 null', () => {
    expect(
      getSuspensionFromError({
        code: 'AUTH403_2',
        result: { suspendedUntil: '2026-12-13T10:00:00', days: 7, byReport: false },
      }),
    ).toEqual({ suspendedUntil: '2026-12-13T10:00:00', days: 7, byReport: false });
    expect(getSuspensionFromError({ code: 'AUTH403_1', result: null })).toBeNull();
    expect(getSuspensionFromError({ code: 'AUTH403_2', result: null })).toBeNull();
    expect(getSuspensionFromError(undefined)).toBeNull();
  });
});
