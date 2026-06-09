// ISO 날짜 문자열을 'YYYY.MM.DD HH:MM'(로컬 시각) 형식으로 변환한다.
export const formatDateTime = (iso: string): string => {
  // 빈 문자열·null 등 falsy 값은 new Date가 1970-01-01 등으로 잘못 파싱할 수 있어 먼저 거른다.
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
