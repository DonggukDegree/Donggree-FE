/**
 * [동아리] 등록·정보 수정 폼 상태
 * 새 동아리는 항상 승인 요청이고, 기존 동아리는 승인 이력이 있는 회원이면 바로 반영한다.
 * 사진은 업로드 API 확정 전이라 브라우저 미리보기까지만 다룬다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { postClub, putClub } from '@/apis/club/club';
import { CLUB_LIMITS } from '@/constants/club';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import type { TClubDetail, TClubField, TClubSaveRequest } from '@/types/club/TClub';
import type {
  TClubForm,
  TClubFormErrors,
  TClubImageDraft,
  TClubLinkRow,
  TClubOfficerRow,
} from '@/types/club/TClubForm';
import { trackEvent } from '@/utils/analytics/analytics';
import {
  addLinkRow,
  changeLinkRow,
  clubFormFromDetail,
  createEmptyClubForm,
  createOfficerRow,
  createRowKey,
  isClubFormComplete,
  removeLinkRow,
  toClubSaveRequest,
  validateClubForm,
  validateClubImageFile,
} from '@/utils/club/clubForm';

export default function useClubForm(club: TClubDetail | null) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TClubForm>(() => (club ? clubFormFromDetail(club) : createEmptyClubForm()));
  const [errors, setErrors] = useState<TClubFormErrors>({});
  const objectUrls = useRef<string[]>([]);
  const isEditing = club !== null;
  const needsApproval = !club?.canEditDirectly;

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

  const addImages = (files: File[]) => {
    const added: TClubImageDraft[] = [];
    for (const file of files) {
      const reason = validateClubImageFile(file, form.images.length + added.length);
      if (reason) {
        toast.error(reason);
        break;
      }
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      added.push({ key: createRowKey('image'), url, file, existingId: null });
    }
    if (added.length === 0) return;
    setForm((prev) => {
      const images = [...prev.images, ...added];
      // 사진이 처음 생기면 첫 장을 대표 사진으로 둔다.
      return { ...prev, images, representativeImageKey: prev.representativeImageKey ?? images[0]?.key ?? null };
    });
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  // 대표 사진을 지우면 남은 첫 장으로 바꾸고, 사진이 없으면 기본 이미지로 보여준다.
  const removeImage = (key: string) =>
    setForm((prev) => {
      const images = prev.images.filter((image) => image.key !== key);
      const representativeImageKey =
        prev.representativeImageKey === key ? (images[0]?.key ?? null) : prev.representativeImageKey;
      return { ...prev, images, representativeImageKey };
    });

  const saveClub = (body: TClubSaveRequest) => (club ? putClub({ clubId: club.id, body }) : postClub(body));
  const mutation = useCoreMutation(saveClub, {
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLUBS_ROOT });
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

  const submit = () => {
    const nextErrors = validateClubForm(form, needsApproval);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('입력하지 않았거나 잘못된 항목을 확인해주세요.');
      return;
    }
    trackEvent(isEditing ? 'club_edit_submit' : 'club_register_submit');
    mutation.mutate(toClubSaveRequest(form, needsApproval));
  };

  return {
    form,
    errors,
    isEditing,
    needsApproval,
    isSubmitting: mutation.isPending,
    // 필수 칸을 다 채워야 제출 버튼이 켜진다.
    canSubmit: isClubFormComplete(form, needsApproval) && !mutation.isPending,
    update,
    toggleField,
    addOfficer,
    changeOfficer,
    removeOfficer,
    addLink,
    changeLink,
    removeLink,
    addImages,
    removeImage,
    submit,
  };
}
