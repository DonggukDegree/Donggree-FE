/**
 * [정각원의 비밀] 비회원 진행 토큰 보관
 * 서버는 비회원 진행을 저장하지 않으므로, 암호화된 진행 토큰만 이 브라우저에 둔다.
 * 지난 날짜나 망가진 토큰은 서버가 새 진행으로 바꿔 주므로 날짜를 따로 보지 않는다.
 */
const KEY = 'mystery:guest-progress';

export const readGuestProgress = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const saveGuestProgress = (token: string) => {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // 저장소가 막히면 새로고침 때 처음부터 다시 시작한다.
  }
};
