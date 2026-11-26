/**
 * [관리자 > 동아리 관리] 승인·반려·권한 회수·배너 저장/삭제/순서 변경
 * 처리 결과가 공개 목록·상세·내 요청 내역에도 보이므로 동아리 캐시(CLUBS_ROOT)를 통째로 무효화한다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  approveAdminClubRequest,
  deleteAdminClubBanner,
  moveAdminClubBanner,
  rejectAdminClubRequest,
  revokeAdminClubEditor,
  saveAdminClubBanner,
} from '@/apis/club/clubAdmin';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';

function useAfterAction(message?: string) {
  const queryClient = useQueryClient();
  return () => {
    if (message) toast.success(message);
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLUBS_ROOT });
  };
}

export const useApproveClubRequest = () =>
  useCoreMutation(approveAdminClubRequest, { onSuccess: useAfterAction('요청을 승인했어요.') });
export const useRejectClubRequest = () =>
  useCoreMutation(rejectAdminClubRequest, { onSuccess: useAfterAction('요청을 반려했어요.') });
export const useRevokeClubEditor = () =>
  useCoreMutation(revokeAdminClubEditor, { onSuccess: useAfterAction('직접 수정 권한을 회수했어요.') });
export const useSaveClubBanner = () =>
  useCoreMutation(saveAdminClubBanner, { onSuccess: useAfterAction('배너를 저장했어요.') });
export const useDeleteClubBanner = () =>
  useCoreMutation(deleteAdminClubBanner, { onSuccess: useAfterAction('배너를 삭제했어요.') });
export const useMoveClubBanner = () => useCoreMutation(moveAdminClubBanner, { onSuccess: useAfterAction() });
