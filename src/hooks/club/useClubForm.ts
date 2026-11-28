/**
 * [동아리] 등록·정보 수정 폼 상태
 * 새 동아리는 항상 승인 요청이고, 기존 동아리는 직접 수정 권한이 있는 회원이면 바로 반영한다.
 * 고른 사진은 한 장씩 가로 4:3 크롭 화면을 거쳐, 자른 사진을 바로 올려 사진 ID를 받는다.
 * 크롭·올리기가 끝나기 전에는 제출 버튼을 끈다. 올리기에 실패한 사진은 빼고 알린다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { postClub, putClub, resubmitMyClubRequest, uploadClubImage } from '@/apis/club/club';
import { createAdminClub, updateAdminClub, uploadAdminClubImage } from '@/apis/club/clubAdmin';
import { CLUB_LIMITS } from '@/constants/club';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import type { TClubDetail, TClubField, TClubSaveRequest, TClubSaveResult, TClubSaveValue } from '@/types/club/TClub';
import type {
  TClubForm,
  TClubFormErrors,
  TClubImageCropTarget,
  TClubImageDraft,
  TClubLinkRow,
  TClubOfficerRow,
} from '@/types/club/TClubForm';
import type { TResponseError } from '@/types/common';
import { trackEvent } from '@/utils/analytics/analytics';
import {
  addLinkRow,
  changeLinkRow,
  clubFormFromDetail,
  clubFormFromSave,
  createEmptyClubForm,
  createOfficerRow,
  createRowKey,
  isClubFormComplete,
  removeLinkRow,
  toClubSaveRequest,
  validateClubForm,
  validateClubImageFile,
} from '@/utils/club/clubForm';

// admin: 관리자 화면에서 쓰면 승인 없이 바로 저장한다(새 동아리는 임시 등록). 요청자 연락처·동의도 받지 않는다.
// resubmit: 내 요청 내역에서 검토 중·반려 요청을 고쳐 다시 보낼 때. 보냈던 입력값으로 채우고 항상 승인 요청으로 보낸다.
export type TClubResubmit<TBody> = { requestId: number; body: TBody };

export default function useClubForm(
  club: TClubDetail | null,
  { admin = false, resubmit }: { admin?: boolean; resubmit?: TClubResubmit<TClubSaveValue> } = {},
) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TClubForm>(() =>
    resubmit ? clubFormFromSave(resubmit.body) : club ? clubFormFromDetail(club) : createEmptyClubForm(),
  );
  const [errors, setErrors] = useState<TClubFormErrors>({});
  // 크롭 화면을 기다리는 고른 사진(맨 앞이 지금 크롭 중인 사진).
  const [cropQueue, setCropQueue] = useState<TClubImageCropTarget[]>([]);
  const objectUrls = useRef<string[]>([]);
  const isEditing = club !== null;
  const needsApproval = !admin && (Boolean(resubmit) || !club?.canEditDirectly);

  // 미리보기 URL은 화면을 떠날 때 해제한다.
  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const update = <K extends keyof TClubForm>(key: K, value: TClubForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleField = (field: TClubField) => {
    setForm((prev) => {
      if (prev.fields.includes(field)) return { ...prev, fields: prev.fields.filter((value) => value !== field) };
      if (prev.fields.length >= CLUB_LIMITS.FIELDS_MAX) {
        toast.info(`활동 분야는 최대 ${CLUB_LIMITS.FIELDS_MAX}개까지 고를 수 있어요.`);
        return prev;
      }
      return { ...prev, fields: [...prev.fields, field] };
    });
  };

  const addOfficer = () =>
    setForm((prev) =>
      prev.officers.length >= CLUB_LIMITS.OFFICERS_MAX
        ? prev
        : { ...prev, officers: [...prev.officers, createOfficerRow()] },
    );
  const changeOfficer = (key: string, patch: Partial<TClubOfficerRow>) =>
    setForm((prev) => ({
      ...prev,
      officers: prev.officers.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    }));
  const removeOfficer = (key: string) =>
    setForm((prev) => ({ ...prev, officers: prev.officers.filter((row) => row.key !== key) }));

  // 파일 목록은 호출부에서 배열로 복사해 넘긴다. input 값을 비우면 FileList도 비기 때문이다.
  // 관련 링크 행(최대 3개)
  const addLink = () => setForm((prev) => ({ ...prev, links: addLinkRow(prev.links) }));
  const changeLink = (key: string, patch: Partial<TClubLinkRow>) =>
    setForm((prev) => ({ ...prev, links: changeLinkRow(prev.links, key, patch) }));
  const removeLink = (key: string) => setForm((prev) => ({ ...prev, links: removeLinkRow(prev.links, key) }));

  // 대표 사진을 지우면 남은 첫 장으로 바꾸고, 사진이 없으면 기본 이미지로 보여준다.
  const removeImage = (key: string) =>
    setForm((prev) => {
      const images = prev.images.filter((image) => image.key !== key);
      const representativeImageKey =
        prev.representativeImageKey === key ? (images[0]?.key ?? null) : prev.representativeImageKey;
      return { ...prev, images, representativeImageKey };
    });

  // 관리자는 관리자 업로드(학생 인증 불필요)를 쓴다. 올리는 사이 사진을 지웠으면 결과를 버린다.
  const uploadDraft = async (draft: TClubImageDraft) => {
    if (!draft.file) return;
    try {
      const uploaded = admin
        ? await uploadAdminClubImage({ file: draft.file, purpose: 'CLUB' })
        : await uploadClubImage(draft.file);
      setForm((prev) => ({
        ...prev,
        images: prev.images.map((image) => (image.key === draft.key ? { ...image, existingId: uploaded.id } : image)),
      }));
    } catch (error) {
      removeImage(draft.key);
      toast.error((error as TResponseError).response?.data?.message ?? '사진을 올리지 못했어요. 다시 골라주세요.');
    }
  };

  // 고른 사진은 검사 후 크롭 대기열에 넣는다. 크롭 화면은 대기열 맨 앞 사진을 보여준다.
  const addImages = (files: File[]) => {
    const queued: TClubImageCropTarget[] = [];
    for (const file of files) {
      const reason = validateClubImageFile(file, form.images.length + cropQueue.length + queued.length);
      if (reason) {
        toast.error(reason);
        break;
      }
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      queued.push({ key: createRowKey('crop'), file, url });
    }
    if (queued.length > 0) setCropQueue((prev) => [...prev, ...queued]);
  };

  // 자른 사진을 사진 목록에 넣고 바로 올린다.
  const confirmCrop = (file: File) => {
    setCropQueue((prev) => prev.slice(1));
    if (file.size > CLUB_LIMITS.IMAGE_BYTES_MAX) {
      toast.error('자른 사진이 5MB를 넘어요. 다른 사진을 골라주세요.');
      return;
    }
    const url = URL.createObjectURL(file);
    objectUrls.current.push(url);
    const draft: TClubImageDraft = { key: createRowKey('image'), url, file, existingId: null };
    setForm((prev) => {
      const images = [...prev.images, draft];
      // 사진이 처음 생기면 첫 장을 대표 사진으로 둔다.
      return { ...prev, images, representativeImageKey: prev.representativeImageKey ?? images[0]?.key ?? null };
    });
    setErrors((prev) => ({ ...prev, images: undefined }));
    void uploadDraft(draft);
  };

  // 크롭을 취소한 사진은 올리지 않고 다음 사진으로 넘어간다.
  const cancelCrop = () => setCropQueue((prev) => prev.slice(1));

  const saveClub = async (body: TClubSaveRequest): Promise<TClubSaveResult> => {
    if (admin) {
      const { clubId } = club ? await updateAdminClub({ clubId: club.id, body }) : await createAdminClub(body);
      return { applied: 'DIRECT', clubId };
    }
    if (resubmit) return resubmitMyClubRequest({ requestId: resubmit.requestId, body });
    return club ? putClub({ clubId: club.id, body }) : postClub(body);
  };
  const mutation = useCoreMutation(saveClub, {
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLUBS_ROOT });
      if (admin) {
        toast.success(isEditing ? '동아리 정보를 저장했어요.' : '임시 등록했어요. 동아리 목록에 바로 보여요.');
        navigate('/admin/clubs?tab=clubs');
        return;
      }
      if (resubmit) {
        toast.success('다시 요청을 보냈어요. 관리자 확인 후 반영돼요.');
        navigate('/clubs');
        return;
      }
      toast.success(
        result.applied === 'DIRECT'
          ? '동아리 정보를 바로 반영했어요.'
          : isEditing
            ? '수정 요청을 보냈어요. 관리자 확인 후 반영돼요.'
            : '등록 요청을 보냈어요. 관리자 확인 후 목록에 보여요.',
      );
      navigate(club ? `/clubs?club=${club.id}` : '/clubs');
    },
  });

  const isUploading = cropQueue.length > 0 || form.images.some((image) => image.existingId === null);

  const submit = () => {
    const nextErrors = validateClubForm(form, needsApproval);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('입력하지 않았거나 잘못된 항목을 확인해주세요.');
      return;
    }
    if (resubmit) trackEvent('club_request_resubmit');
    else if (!admin) trackEvent(isEditing ? 'club_edit_submit' : 'club_register_submit');
    mutation.mutate(toClubSaveRequest(form, needsApproval));
  };

  return {
    admin,
    form,
    errors,
    isEditing,
    needsApproval,
    isSubmitting: mutation.isPending,
    isUploading,
    // 필수 칸을 다 채우고 사진 크롭·올리기가 끝나야 제출 버튼이 켜진다.
    canSubmit: isClubFormComplete(form, needsApproval) && !isUploading && !mutation.isPending,
    update,
    toggleField,
    addOfficer,
    changeOfficer,
    removeOfficer,
    addLink,
    changeLink,
    removeLink,
    addImages,
    cropTarget: cropQueue[0] ?? null,
    cropRemaining: cropQueue.length,
    confirmCrop,
    cancelCrop,
    removeImage,
    submit,
  };
}
