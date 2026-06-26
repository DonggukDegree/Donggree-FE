// 공통 입력 검증 (서버 규칙과 동일). blur·입력 중과 제출 시 결과가 일치하도록 내부에서 먼저 trim한다.
// 위반 시 '*'로 시작하는 안내 문구를, 통과 시 빈 문자열을 반환한다.

// 이름: 필수, 5자 이하
export const validateName = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '*이름을 입력해주세요.';
  if (trimmed.length > 5) return '*이름은 5자 이하로 입력해주세요.';
  return '';
};

// 학번: 필수, 숫자 10자리
export const validateStudentId = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '*학번을 입력해주세요.';
  if (!/^\d{10}$/.test(trimmed)) return '*학번은 숫자 10자리로 입력해주세요.';
  return '';
};

// 닉네임: 필수, 8자 이하
export const validateNickname = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '*닉네임을 입력해주세요.';
  if (trimmed.length > 8) return '*닉네임은 8자 이하로 입력해주세요.';
  return '';
};
