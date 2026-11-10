/** [학교 이메일 인증] 주소 입력·숫자 코드·타이머 경계 검사 */
import { describe, expect, it } from 'vitest';

import {
  formatRemainingTime,
  remainingSeconds,
  SCHOOL_EMAIL_DOMAIN,
  validateSchoolEmailCode,
  validateSchoolEmailLocalPart,
} from '@/utils/user/schoolEmailVerification';

describe('학교 이메일 인증 입력', () => {
  it('학교 도메인 고정', () => {
    expect(SCHOOL_EMAIL_DOMAIN).toBe('@dgu.ac.kr');
  });

  it.each(['', 'student@gmail.com', ' student', 'student..id', 'student+alias', 'a'.repeat(31)])(
    '아이디에 전체 주소와 잘못된 입력 차단: %s',
    (value) => {
      expect(validateSchoolEmailLocalPart(value)).not.toBe('');
    },
  );

  it('유효한 아이디와 앞자리가 0인 코드를 보존', () => {
    expect(validateSchoolEmailLocalPart('Student.123')).toBe('');
    expect(validateSchoolEmailLocalPart('a'.repeat(30))).toBe('');
    expect(validateSchoolEmailCode('012345')).toBe('');
  });

  it.each(['', '12345', '1234567', '12345a'])('숫자 6자리가 아닌 코드 차단: %s', (value) => {
    expect(validateSchoolEmailCode(value)).not.toBe('');
  });

  it('대기시간은 만료 전까지 양수이고 만료 후 음수가 되지 않음', () => {
    expect(remainingSeconds(10_000, 9999)).toBe(1);
    expect(remainingSeconds(10_000, 10_000)).toBe(0);
    expect(remainingSeconds(10_000, 11_000)).toBe(0);
    expect(formatRemainingTime(300)).toBe('5:00');
    expect(formatRemainingTime(9)).toBe('0:09');
  });
});
