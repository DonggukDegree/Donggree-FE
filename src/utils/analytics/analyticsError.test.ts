/** [분석 회귀] 오류 코드 허용 접두어 검사 */
import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { analyticsError } from '@/utils/analytics/analyticsError';

const responseError = (status: number, code: string) =>
  new AxiosError('failed', String(status), undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { isSuccess: false, code, message: '안내', result: null },
  });

describe('GA 오류 코드', () => {
  it('BE 오류 접두어(동아리·인증·커리큘럼·고객지원·입력 검증 포함)는 코드를 그대로 보냄', () => {
    for (const code of ['CLUB409_4', 'AUTH401_2', 'CURRICULUM404_1', 'SUPPORT404_1', 'VALID400_1', 'PLACE403_1']) {
      expect(analyticsError('club', responseError(Number(code.slice(-5, -2)), code)).code).toBe(code);
    }
  });

  it('모르는 코드는 UNKNOWN_ERROR, 응답이 없으면 NETWORK_ERROR', () => {
    expect(analyticsError('club', responseError(500, 'SECRET_abc')).code).toBe('UNKNOWN_ERROR');
    expect(analyticsError('club', new Error('offline'))).toEqual({
      error_source: 'club',
      code: 'NETWORK_ERROR',
      status: 0,
    });
  });
});
