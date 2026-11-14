/** [동글맵 > 장소 신고] 사유·설명 검증과 요청 변환 검사 */
import { describe, expect, it } from 'vitest';

import { createEmptyPlaceReportForm, toPlaceReportRequest, validatePlaceReportForm } from '@/utils/place/placeReport';

describe('장소 신고 폼', () => {
  it('사유를 고르지 않으면 오류, 기타는 내용이 필수', () => {
    expect(validatePlaceReportForm(createEmptyPlaceReportForm()).reason).toBe('신고 사유를 선택해주세요.');
    expect(validatePlaceReportForm({ reason: 'OTHER', description: '  ' }).description).toBe(
      '기타 사유는 내용을 적어주세요.',
    );
    expect(validatePlaceReportForm({ reason: 'CLOSED', description: '' })).toEqual({});
    expect(validatePlaceReportForm({ reason: 'OTHER', description: '주차장 입구예요' })).toEqual({});
  });

  it('내용은 200자까지 허용', () => {
    expect(validatePlaceReportForm({ reason: 'CLOSED', description: '가'.repeat(200) })).toEqual({});
    expect(validatePlaceReportForm({ reason: 'CLOSED', description: '가'.repeat(201) }).description).toContain('200자');
  });

  it('공백만 입력한 내용은 미입력(null)으로 요청 변환', () => {
    expect(toPlaceReportRequest({ reason: 'CLOSED', description: '  ' })).toEqual({
      reason: 'CLOSED',
      description: null,
    });
    expect(toPlaceReportRequest({ reason: 'WRONG_NAME', description: ' 간판은 동국각 ' })).toEqual({
      reason: 'WRONG_NAME',
      description: '간판은 동국각',
    });
  });
});
