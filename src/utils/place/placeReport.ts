import { PLACE_REPORT_DESCRIPTION_MAX } from '@/constants/place';
import type { TPlaceReportReason, TPlaceReportRequest } from '@/types/place/TPlace';

// [동글맵 > 장소 신고] 입력 검증·요청 변환 순수 함수. 최종 검증은 서버가 다시 한다.

export type TPlaceReportForm = {
  reason: TPlaceReportReason | null;
  description: string;
};

export type TPlaceReportFormErrors = {
  reason?: string;
  description?: string;
};

export const createEmptyPlaceReportForm = (): TPlaceReportForm => ({ reason: null, description: '' });

export const validatePlaceReportForm = (form: TPlaceReportForm): TPlaceReportFormErrors => {
  const errors: TPlaceReportFormErrors = {};
  const description = form.description.trim();
  if (!form.reason) errors.reason = '신고 사유를 선택해주세요.';
  if (form.reason === 'OTHER' && !description) errors.description = '기타 사유는 내용을 적어주세요.';
  else if (description.length > PLACE_REPORT_DESCRIPTION_MAX)
    errors.description = `${PLACE_REPORT_DESCRIPTION_MAX}자 이하로 입력해주세요.`;
  return errors;
};

// 검증을 통과한 신고 폼을 요청으로 바꾼다. 공백만 입력한 설명은 미입력(null).
export const toPlaceReportRequest = (form: TPlaceReportForm): TPlaceReportRequest => {
  if (!form.reason) throw new Error('신고 사유가 선택되지 않은 폼은 변환할 수 없습니다.');
  return { reason: form.reason, description: form.description.trim() || null };
};
