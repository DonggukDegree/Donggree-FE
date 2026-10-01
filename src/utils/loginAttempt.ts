/** [로그인 > 분석] 계정 정보 없는 단기 시도 연결. 종료 결과 미관찰은 실패로 추정하지 않는다. */
import { createAttemptId } from '@/utils/analytics';

const KEY = 'analytics.loginAttempt';
const MAX_AGE = 30 * 60 * 1000;
export const startLoginAttempt = () => {
  const id = createAttemptId();
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ id, at: Date.now() }));
  } catch {
    /* 저장소 차단 시 연결 없이 이용 */
  }
  return id;
};
export const consumeLoginAttempt = () => {
  try {
    const saved = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!saved) return undefined;
    const value = JSON.parse(saved);
    return typeof value.id === 'string' &&
      typeof value.at === 'number' &&
      Date.now() - value.at >= 0 &&
      Date.now() - value.at <= MAX_AGE
      ? value.id
      : undefined;
  } catch {
    return undefined;
  }
};
