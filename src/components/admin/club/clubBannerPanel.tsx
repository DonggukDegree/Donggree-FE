/**
 * [관리자 > 동아리 관리 > 배너]
 * 왼쪽은 노출 순서대로 배너 목록(No = 노출 순서, 순서 바꾸기·노출 상태), 오른쪽은 고른 배너의 입력 폼과 실제 모양 미리보기.
 * 글자 배너(라벨·제목·설명·배경색)와 이미지 배너(PC·모바일 이미지, 글자는 이미지 안에)를 고를 수 있다.
 * 이미지는 고르면 바로 서버에 올리고 받은 경로를 저장한다.
 */
import { useState } from 'react';
import { toast } from 'sonner';

import { uploadAdminClubImage } from '@/apis/club/clubAdmin';
import ClubBannerCarousel from '@/components/club/clubBannerCarousel';
import { ChoiceChips } from '@/components/club/clubFormParts';
import Button from '@/components/common/inputs/button';
import Toggle from '@/components/common/inputs/toggle';
import { CLUB_BANNER_BACKGROUNDS, CLUB_BANNER_LIMITS, CLUB_BANNER_STATUS_LABELS, CLUB_LIMITS } from '@/constants/club';
import { ADMIN_INPUT_CLASS } from '@/constants/inputStyles';
import { useDeleteClubBanner, useMoveClubBanner, useSaveClubBanner } from '@/hooks/admin/mutations/useAdminClubActions';
import { useAdminClubBanners } from '@/hooks/admin/queries/useAdminClubs';
import { useModalStore } from '@/stores/modalStore';
import type { TAdminBannerStatus, TAdminClubBanner, TClubBannerForm } from '@/types/club/TClubAdmin';
import type { TResponseError } from '@/types/common';
import {
  createBannerForm,
  formatBannerPeriod,
  getBannerStatus,
  toBannerSave,
  validateBannerForm,
} from '@/utils/club/clubAdmin';
import { toAssetUrl } from '@/utils/club/clubImage';

const STATUS_BADGE: Record<TAdminBannerStatus, string> = {
  LIVE: 'bg-chip-green-bg text-chip-green',
  SCHEDULED: 'bg-primary-30 text-primary-90',
  ENDED: 'bg-coolgray-10 text-coolgray-60',
  OFF: 'bg-coolgray-10 text-coolgray-60',
};

const MODE_OPTIONS: { value: TClubBannerForm['mode']; label: string }[] = [
  { value: 'TEXT', label: '글자 배너' },
  { value: 'IMAGE', label: '이미지 배너' },
];

// 편집 대상: 기존 배너 또는 새 배너('NEW'). null이면 아무것도 고르지 않은 상태.
type TEditing = TAdminClubBanner | 'NEW' | null;

export default function ClubBannerPanel() {
  const { data: banners, isPending } = useAdminClubBanners();
  const move = useMoveClubBanner();
  const [editing, setEditing] = useState<TEditing>(null);
  const [now] = useState(() => new Date());
  const liveCount = banners?.filter((banner) => getBannerStatus(banner, now) === 'LIVE').length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <section aria-label="배너 목록" className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <p className="flex flex-col text-body-s text-coolgray-60">
            <span>동아리 쇼핑 맨 위에 No 순서대로 4초마다 넘어가요.</span>
            <span>
              총 {banners?.length ?? 0}개 · 지금 노출 중 {liveCount}개
            </span>
          </p>
          <Button className="shrink-0 px-4 py-2" onClick={() => setEditing('NEW')}>
            배너 추가
          </Button>
        </div>
        {isPending ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">불러오는 중이에요</p>
        ) : !banners || banners.length === 0 ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">등록된 배너가 없어요.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-coolgray-10">
            {banners.map((banner, index) => {
              const status = getBannerStatus(banner, now);
              const isSelected = editing !== 'NEW' && editing?.id === banner.id;
              return (
                <li
                  key={banner.id}
                  className={`flex items-center gap-3 px-2 py-3 ${isSelected ? 'bg-primary-30' : ''}`}
                >
                  <span className="w-6 shrink-0 text-center text-body-s text-coolgray-60">{index + 1}</span>
                  <span className="flex flex-col">
                    <button
                      type="button"
                      aria-label="앞으로"
                      disabled={index === 0 || move.isPending}
                      onClick={() => move.mutate({ bannerId: banner.id, offset: -1 })}
                      className="cursor-pointer px-1 text-coolgray-60 hover:text-primary-60 disabled:cursor-default disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="뒤로"
                      disabled={index === banners.length - 1 || move.isPending}
                      onClick={() => move.mutate({ bannerId: banner.id, offset: 1 })}
                      className="cursor-pointer px-1 text-coolgray-60 hover:text-primary-60 disabled:cursor-default disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </span>
                  <span
                    aria-hidden
                    className="h-10 w-16 shrink-0 rounded-md bg-cover bg-center"
                    style={
                      banner.imageUrl
                        ? { backgroundImage: `url("${toAssetUrl(banner.imageUrl)}")` }
                        : { background: banner.background ?? undefined }
                    }
                  />
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setEditing(banner)}
                    className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-body-xs ${STATUS_BADGE[status]}`}>
                        {CLUB_BANNER_STATUS_LABELS[status]}
                      </span>
                      <span className="truncate text-body-m text-coolgray-90">{banner.title.split('\n')[0]}</span>
                    </span>
                    <span className="truncate text-body-xs text-coolgray-60">
                      {formatBannerPeriod(banner)} · {banner.link}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
      <section aria-label="배너 편집" className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-3">
        {editing === null ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">왼쪽에서 배너를 고르거나 새로 추가해주세요.</p>
        ) : (
          <BannerEditor
            key={editing === 'NEW' ? 'new' : editing.id}
            banner={editing === 'NEW' ? null : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-body-s font-semibold text-coolgray-90">{label}</span>
      {hint && <span className="break-keep text-body-xs text-coolgray-60">{hint}</span>}
      {children}
      {error && <span className="text-body-xs text-alert">{error}</span>}
    </div>
  );
}

const imageError = (file: File) => {
  if (!(CLUB_LIMITS.IMAGE_TYPES as readonly string[]).includes(file.type))
    return 'JPG, PNG, WEBP 이미지만 올릴 수 있어요.';
  if (file.size > CLUB_LIMITS.IMAGE_BYTES_MAX) return '이미지는 5MB 이하만 올릴 수 있어요.';
  return null;
};

// 고르면 바로 배너 사진(BANNER, 자동 정리 대상 아님)으로 올리고, 받은 서버 경로를 값으로 둔다.
function ImagePicker({
  label,
  hint,
  value,
  error,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  error?: string;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploaded = await uploadAdminClubImage({ file, purpose: 'BANNER' });
      onChange(uploaded.url);
    } catch (uploadError) {
      toast.error((uploadError as TResponseError).response?.data?.message ?? '이미지를 올리지 못했어요.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Field label={label} hint={hint} error={error}>
      <div className="flex items-center gap-3">
        <label
          className={`rounded-full border border-coolgray-30 px-4 py-2 text-button-s text-coolgray-90 ${
            isUploading ? 'cursor-default opacity-60' : 'cursor-pointer hover:border-primary-60 hover:text-primary-60'
          }`}
        >
          {isUploading ? '올리는 중' : value ? '이미지 바꾸기' : '이미지 올리기'}
          <input
            type="file"
            accept={CLUB_LIMITS.IMAGE_TYPES.join(',')}
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              const reason = imageError(file);
              if (reason) {
                toast.error(reason);
                return;
              }
              void upload(file);
            }}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="cursor-pointer text-body-s text-coolgray-60 underline underline-offset-2 hover:text-alert"
          >
            지우기
          </button>
        )}
      </div>
    </Field>
  );
}

function BannerEditor({ banner, onDone }: { banner: TAdminClubBanner | null; onDone: () => void }) {
  const save = useSaveClubBanner();
  const remove = useDeleteClubBanner();
  const openConfirm = useModalStore((state) => state.openConfirm);
  const [form, setForm] = useState<TClubBannerForm>(() => createBannerForm(banner));
  const [errors, setErrors] = useState<ReturnType<typeof validateBannerForm>>({});
  const update = <K extends keyof TClubBannerForm>(key: K, value: TClubBannerForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const isText = form.mode === 'TEXT';
  const preview = { id: banner?.id ?? 0, ...toBannerSave(form) };

  const submit = () => {
    const nextErrors = validateBannerForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('입력하지 않았거나 잘못된 항목을 확인해주세요.');
      return;
    }
    save.mutate({ bannerId: banner?.id ?? null, body: toBannerSave(form) }, { onSuccess: onDone });
  };

  const confirmDelete = () =>
    banner &&
    openConfirm({
      title: '동아리 관리',
      action: '이 배너를 삭제할까요?',
      description: '삭제하면 되돌릴 수 없어요. 잠시 내리려면 노출 켜기를 끄세요.',
      confirmText: '삭제',
      confirmVariant: 'alert',
      onConfirm: () => remove.mutate(banner.id, { onSuccess: onDone }),
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-heading-6 text-coolgray-90">{banner ? '배너 수정' : '새 배너'}</h2>
        <p className="text-body-xs text-coolgray-60">미리보기 (실제 목록에서는 PC 기준 높이로 보여요)</p>
        <ClubBannerCarousel banners={[preview]} onSelect={() => undefined} />
      </div>

      <ChoiceChips options={MODE_OPTIONS} selected={[form.mode]} onToggle={(value) => update('mode', value)} />

      {isText ? (
        <>
          <Field
            label="작은 라벨"
            hint={`제목 위 작은 표시예요. 가운데점 없이 짧게(예: EVENT, AD). ${CLUB_BANNER_LIMITS.EYEBROW_MAX}자 이내`}
            error={errors.eyebrow}
          >
            <input
              value={form.eyebrow}
              maxLength={CLUB_BANNER_LIMITS.EYEBROW_MAX}
              placeholder="EVENT"
              onChange={(event) => update('eyebrow', event.target.value)}
              className={ADMIN_INPUT_CLASS}
            />
          </Field>
          <Field
            label="제목 *"
            hint={`줄을 바꾸면 배너에서도 줄이 바뀌어요. ${CLUB_BANNER_LIMITS.TITLE_MAX}자 이내`}
            error={errors.title}
          >
            <textarea
              rows={2}
              value={form.title}
              maxLength={CLUB_BANNER_LIMITS.TITLE_MAX}
              placeholder={'우리 동아리가 없나요?\n등록하면 500P'}
              onChange={(event) => update('title', event.target.value)}
              className={`${ADMIN_INPUT_CLASS} resize-none`}
            />
          </Field>
          <Field label="설명" hint={`${CLUB_BANNER_LIMITS.DESCRIPTION_MAX}자 이내`} error={errors.description}>
            <input
              value={form.description}
              maxLength={CLUB_BANNER_LIMITS.DESCRIPTION_MAX}
              placeholder="처음 등록한 동아리가 승인되면 포인트를 드려요."
              onChange={(event) => update('description', event.target.value)}
              className={ADMIN_INPUT_CLASS}
            />
          </Field>
          <Field label="배경색">
            <div className="flex flex-wrap gap-2">
              {CLUB_BANNER_BACKGROUNDS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={form.background === option.value}
                  onClick={() => update('background', option.value)}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-body-s ${
                    form.background === option.value
                      ? 'border-primary-60 text-primary-60'
                      : 'border-coolgray-30 text-coolgray-90'
                  }`}
                >
                  <span aria-hidden className="h-4 w-4 rounded-full" style={{ background: option.value }} />
                  {option.label}
                </button>
              ))}
            </div>
          </Field>
        </>
      ) : (
        <>
          <ImagePicker
            label="PC 이미지 *"
            hint="권장 2240×512px(약 4.4:1). 글자는 이미지 안에 넣어주세요. JPG·PNG·WEBP, 5MB 이하"
            value={form.imageUrl}
            error={errors.image}
            onChange={(url) => update('imageUrl', url)}
          />
          <ImagePicker
            label="모바일 이미지"
            hint="권장 1312×704px(약 1.9:1). 비우면 PC 이미지를 같이 써요."
            value={form.mobileImageUrl}
            onChange={(url) => update('mobileImageUrl', url)}
          />
          <Field
            label="이미지 설명 *"
            hint={`화면 읽기 프로그램이 읽는 대체 텍스트예요. 이미지 속 문구를 적어주세요. ${CLUB_BANNER_LIMITS.TITLE_MAX}자 이내`}
            error={errors.title}
          >
            <input
              value={form.title}
              maxLength={CLUB_BANNER_LIMITS.TITLE_MAX}
              onChange={(event) => update('title', event.target.value)}
              className={ADMIN_INPUT_CLASS}
            />
          </Field>
        </>
      )}

      <Field
        label="링크 *"
        hint="동그리 안 화면은 /로 시작(예: /clubs?club=3은 그 동아리 상세), 외부 주소는 https://만 새 창으로 열려요."
        error={errors.link}
      >
        <input
          value={form.link}
          placeholder="/clubs/register"
          onChange={(event) => update('link', event.target.value)}
          className={ADMIN_INPUT_CLASS}
        />
      </Field>

      <Field label="노출 기간" hint="비워 두면 바로 노출하고 끄기 전까지 계속 보여요." error={errors.period}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            type="datetime-local"
            aria-label="노출 시작"
            value={form.startsAt}
            onChange={(event) => update('startsAt', event.target.value)}
            className={ADMIN_INPUT_CLASS}
          />
          <input
            type="datetime-local"
            aria-label="노출 종료"
            value={form.endsAt}
            onChange={(event) => update('endsAt', event.target.value)}
            className={ADMIN_INPUT_CLASS}
          />
        </div>
      </Field>

      <div className="flex items-center gap-3 text-body-s text-coolgray-90">
        <Toggle checked={form.active} onChange={(checked) => update('active', checked)} />
        노출 켜기
      </div>

      <div className="flex justify-between gap-2 border-t border-coolgray-20 pt-5">
        {banner ? (
          <Button variant="outlined" className="w-24 py-2.5" onClick={confirmDelete}>
            삭제
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="outlined" className="w-24 py-2.5" onClick={onDone}>
            취소
          </Button>
          <Button variant={save.isPending ? 'disabled' : 'primary'} className="w-24 py-2.5" onClick={submit}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
