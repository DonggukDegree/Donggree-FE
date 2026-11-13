/**
 * [동글맵] 첫 방문 튜토리얼 노출 상태. 개인정보 없이 브라우저 단위 불리언만 저장한다.
 * 마지막 단계의 "시작하기"를 눌렀을 때만 본 것으로 기록해, 중간에 나가면 다음 방문에 다시 보여준다.
 */
const SEEN_KEY = 'donggree.map.onboardingSeen';

// 저장소 차단 시에도 같은 페이지 안에서 반복 노출되지 않도록 메모리 값을 함께 유지한다.
let seenInMemory = false;

export const hasSeenMapOnboarding = (): boolean => {
  if (seenInMemory) return true;
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

export const markMapOnboardingSeen = () => {
  seenInMemory = true;
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // 저장소를 사용할 수 없으면 메모리 값만으로 이번 페이지의 반복 노출을 막는다.
  }
};
