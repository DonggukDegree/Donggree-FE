/**
 * 만족도 조사 노출 상태. 개인정보 없이 브라우저 단위 불리언만 저장한다.
 * 실제 로그인 성공 시 1회 노출만 초기화하며, 다시 보지 않음은 별도로 유지한다.
 */
const SHOWN_KEY = 'donggree.survey.shownForLogin';
const DISMISSED_KEY = 'donggree.survey.dismissed';

// 저장소 차단 시에도 현재 페이지에서 반복 노출되지 않도록 메모리 값을 함께 유지한다.
let shownInMemory = false;
let dismissedInMemory = false;

const readFlag = (key: string, fallback: boolean): boolean => {
  try {
    return fallback || localStorage.getItem(key) === '1';
  } catch {
    return fallback;
  }
};

const writeFlag = (key: string) => {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // 저장소를 사용할 수 없으면 메모리 값만으로 이번 페이지의 반복 노출을 막는다.
  }
};

// OAuth 로그인 성공 경로에서만 호출한다. 새로고침·토큰 재발급은 새 로그인으로 보지 않는다.
export const resetSurveyPromptForLogin = () => {
  shownInMemory = false;
  try {
    localStorage.removeItem(SHOWN_KEY);
  } catch {
    // 설문 상태 저장 실패가 로그인을 막아서는 안 된다.
  }
};

// 다른 모달이 없고 실제 표시 가능한 시점에만 호출한다.
export const claimSurveyPrompt = (): boolean => {
  if (readFlag(DISMISSED_KEY, dismissedInMemory) || readFlag(SHOWN_KEY, shownInMemory)) return false;
  shownInMemory = true;
  writeFlag(SHOWN_KEY);
  return true;
};

export const dismissSurveyPermanently = () => {
  dismissedInMemory = true;
  writeFlag(DISMISSED_KEY);
};
