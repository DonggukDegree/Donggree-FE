/**
 * [동글맵 > 장소 신고] 장소 신고 제어
 * 서로 다른 회원 3명이 신고하면 서버가 장소를 자동 숨김하므로 접수 후 지도 핀 목록을 다시 받는다.
 */
import { useQueryClient } from '@tanstack/react-query';

import { postPlaceReport } from '@/apis/place/place';
import { ERROR_CODE } from '@/constants/errorCodes';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import useReportForm from '@/hooks/place/useReportForm';
import type { TPlaceDetail, TPlaceReportReason } from '@/types/place/TPlace';
import { trackEvent } from '@/utils/analytics/analytics';

export default function usePlaceReportForm(place: Pick<TPlaceDetail, 'id' | 'category'>, onClose: () => void) {
  const queryClient = useQueryClient();
  return useReportForm<TPlaceReportReason>({
    submit: (body) => postPlaceReport({ placeId: place.id, body }),
    duplicateCode: ERROR_CODE.PLACE_REPORT_DUPLICATE,
    duplicateMessage: '이미 신고한 장소예요. 처리된 뒤 다시 신고할 수 있어요.',
    onSubmitted: (body) => {
      trackEvent('place_report_submit', { place_category: place.category, report_reason: body.reason });
      // 이 신고로 자동 숨김됐을 수 있어 핀 목록만 다시 받는다(열린 장소 정보는 그대로 둔다).
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_PLACES, exact: true });
    },
    onClose,
  });
}
