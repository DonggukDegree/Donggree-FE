/** [공통 > 분석] 오류 원문을 제외한 고정 코드·실제 HTTP 상태 */
import { BACKEND_ERROR_CODE_PATTERN, type TErrorSource } from '@/constants/analytics';
import { trackEvent, trackOncePerVisit } from '@/utils/analytics/analytics';
import { getErrorCode, getErrorStatus } from '@/utils/error';

export const analyticsError = (source: TErrorSource, error?: unknown) => {
  const status = getErrorStatus(error) ?? 0;
  const rawCode = getErrorCode(error);
  const code =
    typeof rawCode === 'string' && BACKEND_ERROR_CODE_PATTERN.test(rawCode)
      ? rawCode
      : status
        ? 'UNKNOWN_ERROR'
        : 'NETWORK_ERROR';
  return { error_source: source, code, status };
};
export const trackErrorShown = (source: TErrorSource, error?: unknown, once = false) => {
  const params = analyticsError(source, error);
  if (once) trackOncePerVisit('error_shown', params, `${source}:${params.code}:${params.status}`);
  else trackEvent('error_shown', params);
};
