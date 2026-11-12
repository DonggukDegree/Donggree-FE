import { PLACE_REPORT_DESCRIPTION_MAX } from '@/constants/place';
import type { TPlaceReportReason } from '@/types/place/TPlace';

// [동글맵 > 장소·리뷰 신고] 입력 검증·요청 변환 순수 함수. 사유 코드만 다르고 규칙은 같다. 최종 검증은 서버가 다시 한다.

export type TReportForm<TReason extends string> = {
  reason: TReason | null;
  description: string;
};

export type TReportFormErrors = {
  reason?: string;
  description?: string;
};

export type TPlaceReportForm = TReportForm<TPlaceReportReason>;
export type TPlaceReportFormErrors = TReportFormErrors;

export const createEmptyPlaceReportForm = <TReason extends string = TPlaceReportReason>(): TReportForm<TReason> => ({
  reason: null,
  description: '',
});

// 기타(OTHER)는 내용 필수, 내용은 최대 200자.
export const validatePlaceReportForm = <TReason extends string>(form: TReportForm<TReason>): TReportFormErrors => {
  const errors: TReportFormErrors = {};
  const description = form.description.trim();
  if (!form.reason) errors.reason = '신고 사유를 선택해주세요.';
  if (form.reason === 'OTHER' && !description) errors.description = '기타 사유는 내용을 적어주세요.';
  else if (description.length > PLACE_REPORT_DESCRIPTION_MAX)
    errors.description = `${PLACE_REPORT_DESCRIPTION_MAX}자 이하로 입력해주세요.`;
  return errors;
};

// 검증을 통과한 신고 폼을 요청으로 바꾼다. 공백만 입력한 설명은 미입력(null).
export const toPlaceReportRequest = <TReason extends string>(form: TReportForm<TReason>) => {
  if (!form.reason) throw new Error('신고 사유가 선택되지 않은 폼은 변환할 수 없습니다.');
  return { reason: form.reason, description: form.description.trim() || null };
};
