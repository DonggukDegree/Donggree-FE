/**
 * [동아리] 모집 등록·수정 폼 상태
 * 기간 모집은 시작·마감 일시(분 단위), 상시모집은 기간 없이 수동 마감만 한다.
 * 승인 이력이 있는 회원이면 바로 반영, 아니면 관리자 승인 요청으로 보낸다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { putClubRecruitment, resubmitMyRecruitmentRequest } from '@/apis/club/club';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import type { TClubResubmit } from '@/hooks/club/useClubForm';
import { useCoreMutation } from '@/hooks/customQuery';
import type { TClubDetail, TClubRecruitmentSaveRequest } from '@/types/club/TClub';
import type { TClubLinkRow, TClubRecruitmentForm, TClubRecruitmentFormErrors } from '@/types/club/TClubForm';
import { trackEvent } from '@/utils/analytics/analytics';
import { getRecruitmentStatus } from '@/utils/club/club';
import {
  addLinkRow,
  changeLinkRow,
  createRecruitmentForm,
  isRecruitmentFormComplete,
  recruitmentFormFromSave,
  removeLinkRow,
  toRecruitmentSaveRequest,
  validateRecruitmentForm,
} from '@/utils/club/clubForm';

// resubmit: 내 요청 내역에서 모집 요청을 고쳐 다시 보낼 때. 보냈던 입력값으로 채우고 항상 승인 요청으로 보낸다.
export default function useClubRecruitmentForm(
  club: TClubDetail,
  { resubmit }: { resubmit?: TClubResubmit<TClubRecruitmentSaveRequest> } = {},
) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // 마감된 모집은 새 모집을 등록하는 것으로 보고 빈 폼에서 시작한다. 진행 중·예정 모집은 수정한다.
  const [existing] = useState(() =>
    club.recruitment && getRecruitmentStatus(club.recruitment, new Date()) !== 'CLOSED' ? club.recruitment : null,
  );
  const [form, setForm] = useState<TClubRecruitmentForm>(() =>
    resubmit ? recruitmentFormFromSave(resubmit.body) : createRecruitmentForm(existing, club.generation),
  );
  const [errors, setErrors] = useState<TClubRecruitmentFormErrors>({});
  const needsApproval = Boolean(resubmit) || !club.canEditDirectly;
  const hasExisting = existing !== null;

  const update = <K extends keyof TClubRecruitmentForm>(key: K, value: TClubRecruitmentForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 관련 링크 행(최대 3개). 운영진 행처럼 추가·수정·삭제한다.
  const addLink = () => setForm((prev) => ({ ...prev, links: addLinkRow(prev.links) }));
  const changeLink = (key: string, patch: Partial<TClubLinkRow>) =>
    setForm((prev) => ({ ...prev, links: changeLinkRow(prev.links, key, patch) }));
  const removeLink = (key: string) => setForm((prev) => ({ ...prev, links: removeLinkRow(prev.links, key) }));

  const mutation = useCoreMutation(
    (body: TClubRecruitmentSaveRequest) =>
      resubmit
        ? resubmitMyRecruitmentRequest({ requestId: resubmit.requestId, body })
        : putClubRecruitment({ clubId: club.id, body }),
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLUBS_ROOT });
        toast.success(
          result.applied === 'DIRECT'
            ? '모집 정보를 바로 반영했어요.'
            : resubmit
              ? '다시 요청을 보냈어요. 관리자 확인 후 반영돼요.'
              : '모집 등록 요청을 보냈어요. 관리자 확인 후 반영돼요.',
        );
        navigate(resubmit ? '/clubs' : `/clubs?club=${club.id}`);
      },
    },
  );

  const submit = () => {
    const nextErrors = validateRecruitmentForm(form, needsApproval);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('입력하지 않았거나 잘못된 항목을 확인해주세요.');
      return;
    }
    trackEvent(resubmit ? 'club_request_resubmit' : 'club_recruitment_submit');
    mutation.mutate(toRecruitmentSaveRequest(form, needsApproval));
  };

  return {
    form,
    errors,
    needsApproval,
    hasExisting,
    isSubmitting: mutation.isPending,
    // 필수 칸을 다 채워야 제출 버튼이 켜진다.
    canSubmit: isRecruitmentFormComplete(form, needsApproval) && !mutation.isPending,
    update,
    addLink,
    changeLink,
    removeLink,
    submit,
  };
}
