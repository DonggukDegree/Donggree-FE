/** [마이페이지 > 학교 이메일 인증] 입력 검증과 남은 시간 표시 */
export const SCHOOL_EMAIL_DOMAIN = '@dgu.ac.kr';

export const validateSchoolEmailLocalPart = (value: string) => {
  if (!value) return '학교 이메일 아이디를 입력해주세요.';
  if (value.length < 6 || value.length > 30) return '학교 이메일 아이디는 6~30자로 입력해주세요.';
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.]{4,28}[a-zA-Z0-9]$/.test(value)) {
    return '영문, 숫자, 마침표만 사용할 수 있고, 처음과 끝은 영문 또는 숫자로 입력해주세요.';
  }
  if (value.includes('..')) return '마침표는 연속으로 사용할 수 없어요.';
  return '';
};

export const validateSchoolEmailCode = (value: string) =>
  /^[0-9]{6}$/.test(value) ? '' : '숫자 6자리 인증 코드를 입력해주세요.';

export const remainingSeconds = (deadline: number, now: number) => Math.max(0, Math.ceil((deadline - now) / 1000));

export const formatRemainingTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
