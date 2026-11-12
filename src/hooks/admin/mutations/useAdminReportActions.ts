import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  postAdminLiftSuspension,
  postAdminMemberSuspension,
  postAdminPlaceVisibility,
  postAdminReportAction,
  postAdminReportSuspension,
  postAdminRevertEdit,
  postAdminReviewVisibility,
} from '@/apis/admin/reports';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';

// [관리자 > 신고 관리] 처리·숨김·되돌리기·정지. 어느 목록·상세가 바뀌는지 특정하기 어려워 신고 관리 캐시와
// 지도 장소 캐시를 통째로 무효화한다. 실패 안내는 공용 토스트(서버 메시지)를 쓴다.
function useAfterAction(message: string) {
  const queryClient = useQueryClient();
  return () => {
    toast.success(message);
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_REPORTS_ROOT });
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLACES_ROOT });
  };
}

export const useAdminReportAction = () =>
  useCoreMutation(postAdminReportAction, { onSuccess: useAfterAction('신고를 처리했어요.') });
export const useAdminReportSuspension = () =>
  useCoreMutation(postAdminReportSuspension, { onSuccess: useAfterAction('회원을 정지하고 신고를 처리했어요.') });
export const useAdminPlaceVisibility = () =>
  useCoreMutation(postAdminPlaceVisibility, { onSuccess: useAfterAction('장소 노출 상태를 바꿨어요.') });
export const useAdminReviewVisibility = () =>
  useCoreMutation(postAdminReviewVisibility, { onSuccess: useAfterAction('리뷰 노출 상태를 바꿨어요.') });
export const useAdminRevertEdit = () =>
  useCoreMutation(postAdminRevertEdit, { onSuccess: useAfterAction('수정 전 정보로 되돌렸어요.') });
export const useAdminMemberSuspension = () =>
  useCoreMutation(postAdminMemberSuspension, { onSuccess: useAfterAction('회원을 정지했어요.') });
export const useAdminLiftSuspension = () =>
  useCoreMutation(postAdminLiftSuspension, { onSuccess: useAfterAction('정지를 해제했어요.') });
