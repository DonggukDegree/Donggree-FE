/**
 * [동아리] 등록·정보 수정 폼
 * 필수: 이름·소속 분류(칩 1개)·활동 분야(칩 최대 3개)·소개(100자 이상)·창립일자(날짜 또는 모름)·동아리방(위치 또는 없음),
 * 기수제면 기수와 활동 기간.
 * 선택: 사진(0~3장·대표 선택)·인원(한 기수 선발·전체 활동 중)·운영진·관련 링크(최대 3개).
 * 승인이 필요한 요청이면 요청자 연락처와 수집 동의를 마지막에 받는다. 필수 칸을 다 채워야 제출 버튼이 켜진다.
 */
import { useNavigate } from 'react-router-dom';

import { ChoiceChips, ClubLinkFields, FormSection, RequesterConsentFields } from '@/components/club/clubFormParts';
import Button from '@/components/common/inputs/button';
import Toggle from '@/components/common/inputs/toggle';
import { CLUB_AFFILIATIONS, CLUB_FIELDS, CLUB_LIMITS, CLUB_POINTS } from '@/constants/club';
import { INPUT_CLASS } from '@/constants/inputStyles';
import useClubForm, { type TClubResubmit } from '@/hooks/club/useClubForm';
import type { TClubDetail, TClubSaveRequest } from '@/types/club/TClub';
import { dateTextClass } from '@/utils/club/clubForm';

const inputClass = (error?: string) => `${INPUT_CLASS} ${error ? 'border-alert' : 'border-coolgray-30'}`;

// admin: 관리자 화면(/admin/clubs/register·edit)에서 바로 저장하는 모드. 안내 문구·버튼 이름만 다르고 입력 항목은 같다.
// resubmit: 내 요청 내역에서 고쳐 다시 보내는 모드(보냈던 입력값으로 채우고 승인 요청으로 다시 보낸다).
export default function ClubForm({
  club,
  admin = false,
  resubmit,
}: {
  club: TClubDetail | null;
  admin?: boolean;
  resubmit?: TClubResubmit<TClubSaveRequest>;
}) {
  const navigate = useNavigate();
  const clubForm = useClubForm(club, { admin, resubmit });
  const { form, errors, update } = clubForm;
  const pointHint = !club
    ? `처음 등록한 동아리가 승인되면 ${CLUB_POINTS.FIRST_REGISTRATION}P를 드려요.`
    : club.firstRegistrationRewardAvailable
      ? `임시 등록 동아리예요. 정보를 보완해 처음 승인받으면 ${CLUB_POINTS.FIRST_REGISTRATION}P를 드려요.`
      : `새 기수 정보를 처음 올리면 ${CLUB_POINTS.GENERATION_UPDATE}P를 드려요.`;

  return (
    <form
      noValidate
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        clubForm.submit();
      }}
    >
      <p className="break-keep rounded-xl bg-primary-30 px-4 py-3 text-body-s text-primary-90">
        {admin
          ? club
            ? '관리자 저장은 승인 없이 바로 반영돼요.'
            : '임시 등록 동아리로 바로 공개돼요. 회원의 등록·수정 요청이 승인되면 정식 등록으로 바뀌고, 처음 승인받은 회원이 최초 등록 포인트를 받아요.'
          : clubForm.needsApproval
            ? `관리자가 실존하는 안전한 동아리인지 검토한 뒤 반영돼요. 상세히 정보를 입력할수록 빠르게 승인될 확률이 높아요. ${pointHint}`
            : `이 동아리 정보를 승인받은 적이 있어 저장하면 바로 반영돼요. ${pointHint}`}
      </p>

      <FormSection title="동아리 이름" required error={errors.name}>
        <input
          value={form.name}
          maxLength={CLUB_LIMITS.NAME_MAX}
          placeholder="예: 동그리"
          onChange={(event) => update('name', event.target.value)}
          className={inputClass(errors.name)}
        />
      </FormSection>

      <FormSection title="소속 분류" required description="하나만 골라주세요." error={errors.affiliation}>
        <ChoiceChips
          options={CLUB_AFFILIATIONS}
          selected={form.affiliation ? [form.affiliation] : []}
          onToggle={(value) => update('affiliation', value)}
        />
      </FormSection>

      <FormSection
        title="활동 분야"
        required
        description={`최대 ${CLUB_LIMITS.FIELDS_MAX}개까지 고를 수 있어요. (${form.fields.length}/${CLUB_LIMITS.FIELDS_MAX})`}
        error={errors.fields}
      >
        <ChoiceChips options={CLUB_FIELDS} selected={form.fields} onToggle={clubForm.toggleField} />
      </FormSection>

      <FormSection title="동아리 소개" required error={errors.description}>
        <textarea
          rows={6}
          value={form.description}
          maxLength={CLUB_LIMITS.DESCRIPTION_MAX}
          placeholder="어떤 활동을 하는지, 어떤 사람에게 추천하는지 소개해주세요."
          onChange={(event) => update('description', event.target.value)}
          className={`${inputClass(errors.description)} resize-none`}
        />
        <p className="flex justify-between text-body-xs text-coolgray-60">
          <span className={form.description.trim().length >= CLUB_LIMITS.DESCRIPTION_MIN ? '' : 'text-primary-60'}>
            최소 {CLUB_LIMITS.DESCRIPTION_MIN}자
          </span>
          <span>
            {form.description.length}/{CLUB_LIMITS.DESCRIPTION_MAX}
          </span>
        </p>
      </FormSection>

      <FormSection
        title="창립일자"
        required
        description="역사가 깊은 순으로 정렬할 때 사용돼요."
        error={errors.foundedDate}
      >
        <div className="flex items-center gap-3">
          <input
            type="date"
            aria-label="창립일자"
            value={form.foundedUnknown ? '' : form.foundedDate}
            disabled={form.foundedUnknown}
            onChange={(event) => update('foundedDate', event.target.value)}
            className={`${inputClass(errors.foundedDate)} ${dateTextClass(form.foundedDate)} min-w-0 flex-1 disabled:bg-coolgray-10 disabled:text-coolgray-60`}
          />
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-body-s text-coolgray-90">
            <input
              type="checkbox"
              checked={form.foundedUnknown}
              onChange={(event) => update('foundedUnknown', event.target.checked)}
              className="h-4 w-4 accent-primary-60"
            />
            모르겠어요
          </label>
        </div>
      </FormSection>

      <FormSection
        title="활동 정보"
        required
        description={
          form.hasGeneration
            ? '현재 기수의 활동 기간이에요. 활동 마감일이 지나면 연장·다음 기수 정보를 갱신해 주세요.'
            : '기수 없이 활동하는 조직은 매년 3월·9월에 활동 확인을 받아요.'
        }
        error={errors.generation ?? errors.activityPeriod}
      >
        <div className="flex items-center gap-3 text-body-s text-coolgray-90">
          <Toggle checked={form.hasGeneration} onChange={(checked) => update('hasGeneration', checked)} />
          기수제로 활동해요
        </div>
        {form.hasGeneration && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_1fr_1fr]">
            <label className="flex flex-col gap-1 text-body-xs text-coolgray-60">
              현재 기수
              <input
                inputMode="numeric"
                value={form.generation}
                placeholder="예: 24"
                onChange={(event) => update('generation', event.target.value)}
                className={inputClass(errors.generation)}
              />
            </label>
            <label className="flex flex-col gap-1 text-body-xs text-coolgray-60">
              활동 시작일
              <input
                type="date"
                value={form.activityStartDate}
                onChange={(event) => update('activityStartDate', event.target.value)}
                className={`${inputClass(errors.activityPeriod)} ${dateTextClass(form.activityStartDate)}`}
              />
            </label>
            <label className="flex flex-col gap-1 text-body-xs text-coolgray-60">
              활동 마감일
              <input
                type="date"
                value={form.activityEndDate}
                onChange={(event) => update('activityEndDate', event.target.value)}
                className={`${inputClass(errors.activityPeriod)} ${dateTextClass(form.activityEndDate)}`}
              />
            </label>
          </div>
        )}
      </FormSection>

      <FormSection
        title="사진"
        description={`JPG, PNG, WEBP 사진을 최대 ${CLUB_LIMITS.IMAGES_MAX}장, 한 장에 5MB 이하로 올릴 수 있어요. 대표 사진이 목록 카드에 먼저 보여요.`}
        error={errors.images}
      >
        <div className="grid grid-cols-3 gap-2 lg:gap-3">
          {form.images.map((image) => {
            const isRepresentative = form.representativeImageKey === image.key;
            return (
              <div
                key={image.key}
                className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 ${
                  isRepresentative ? 'border-primary-60' : 'border-transparent'
                }`}
              >
                <img src={image.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="사진 삭제"
                  onClick={() => clubForm.removeImage(image.key)}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-coolgray-90/70 text-white"
                >
                  ×
                </button>
                {/* 왼쪽 위 각진 대표 박스: 속이 투명한 테두리형이고 누르면 주황으로 채워진다. */}
                <button
                  type="button"
                  aria-pressed={isRepresentative}
                  aria-label={isRepresentative ? '대표 사진' : '대표 사진으로 지정'}
                  onClick={() => update('representativeImageKey', image.key)}
                  className={`absolute left-1.5 top-1.5 flex cursor-pointer items-center gap-1 rounded-[3px] border-2 border-primary-60 px-1.5 py-0.5 text-body-s font-semibold ${
                    isRepresentative ? 'bg-primary-60 text-white' : 'bg-transparent text-primary-60'
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                    <path
                      d="m3.5 8.5 3 3 6-6.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  대표
                </button>
              </div>
            );
          })}
          {form.images.length < CLUB_LIMITS.IMAGES_MAX && (
            <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-coolgray-30 text-body-s text-coolgray-60 hover:border-primary-60 hover:text-primary-60">
              <span className="text-heading-4">+</span>
              사진 추가
              <input
                type="file"
                accept={CLUB_LIMITS.IMAGE_TYPES.join(',')}
                multiple
                className="sr-only"
                onChange={(event) => {
                  clubForm.addImages(Array.from(event.target.files ?? []));
                  event.target.value = '';
                }}
              />
            </label>
          )}
        </div>
      </FormSection>

      <FormSection title="동아리방 위치" required error={errors.roomLocation}>
        <div className="flex items-center gap-3">
          <input
            value={form.noRoom ? '' : form.roomLocation}
            maxLength={CLUB_LIMITS.ROOM_MAX}
            disabled={form.noRoom}
            placeholder={form.noRoom ? '동아리방 없음' : '예: 학생회관 3층 312호'}
            onChange={(event) => update('roomLocation', event.target.value)}
            className={`${inputClass(errors.roomLocation)} min-w-0 flex-1 disabled:bg-coolgray-10 disabled:text-coolgray-60`}
          />
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-body-s text-coolgray-90">
            <input
              type="checkbox"
              checked={form.noRoom}
              onChange={(event) => update('noRoom', event.target.checked)}
              className="h-4 w-4 accent-primary-60"
            />
            없음
          </label>
        </div>
      </FormSection>

      <FormSection title="인원" description="등록일 기준 인원을 입력해 주세요." error={errors.memberCount}>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-body-xs text-coolgray-60">
            한 기수 선발 인원
            <input
              inputMode="numeric"
              value={form.generationMemberCount}
              placeholder="예: 15"
              onChange={(event) => update('generationMemberCount', event.target.value)}
              className={inputClass(errors.memberCount)}
            />
          </label>
          <label className="flex flex-col gap-1 text-body-xs text-coolgray-60">
            전체 활동 중 인원 (OB 포함)
            <input
              inputMode="numeric"
              value={form.totalMemberCount}
              placeholder="예: 120"
              onChange={(event) => update('totalMemberCount', event.target.value)}
              className={inputClass(errors.memberCount)}
            />
          </label>
        </div>
      </FormSection>

      <FormSection
        title={form.hasGeneration && form.generation ? `${form.generation}기 운영진` : '운영진'}
        description="동아리 신뢰성을 위해 입력을 권장해요. 본인 동의를 받은 경우에만 입력해주세요."
        error={errors.officers}
      >
        {form.officers.map((row) => (
          <div key={row.key} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <input
              value={row.role}
              maxLength={CLUB_LIMITS.OFFICER_TEXT_MAX}
              placeholder="직책"
              aria-label="직책"
              onChange={(event) => clubForm.changeOfficer(row.key, { role: event.target.value })}
              className={inputClass()}
            />
            <input
              value={row.department}
              maxLength={CLUB_LIMITS.OFFICER_TEXT_MAX}
              placeholder="학과"
              aria-label="학과"
              onChange={(event) => clubForm.changeOfficer(row.key, { department: event.target.value })}
              className={inputClass()}
            />
            <input
              value={row.name}
              maxLength={CLUB_LIMITS.OFFICER_TEXT_MAX}
              placeholder="이름"
              aria-label="이름"
              onChange={(event) => clubForm.changeOfficer(row.key, { name: event.target.value })}
              className={inputClass()}
            />
            <button
              type="button"
              aria-label="운영진 행 삭제"
              onClick={() => clubForm.removeOfficer(row.key)}
              className="cursor-pointer px-2 text-heading-6 text-coolgray-60 hover:text-alert"
            >
              ×
            </button>
          </div>
        ))}
        {form.officers.length < CLUB_LIMITS.OFFICERS_MAX && (
          <button
            type="button"
            onClick={clubForm.addOfficer}
            className="w-fit cursor-pointer rounded-full border border-coolgray-30 px-4 py-2 text-button-s text-coolgray-60 hover:border-primary-60 hover:text-primary-60"
          >
            + 운영진 추가
          </button>
        )}
      </FormSection>

      <ClubLinkFields
        description={`인스타그램, 공식 홈페이지 등 보일 이름(${CLUB_LIMITS.LINK_LABEL_MAX}자 이내)과 https:// 주소를 최대 ${CLUB_LIMITS.LINKS_MAX}개까지 넣을 수 있어요. 모집 링크는 모집 등록에서 따로 넣어요.`}
        links={form.links}
        error={errors.links}
        onAdd={clubForm.addLink}
        onChange={clubForm.changeLink}
        onRemove={clubForm.removeLink}
      />

      {clubForm.needsApproval && (
        <RequesterConsentFields
          role={form.requesterRole}
          contact={form.contact}
          consent={form.consent}
          errors={errors}
          onRoleChange={(value) => update('requesterRole', value)}
          onContactChange={(value) => update('contact', value)}
          onConsentChange={(value) => update('consent', value)}
        />
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outlined" className="flex-1" onClick={() => navigate(-1)}>
          취소
        </Button>
        <Button type="submit" variant={clubForm.canSubmit ? 'primary' : 'disabled'} className="flex-1">
          {clubForm.isSubmitting
            ? '보내는 중'
            : admin
              ? clubForm.isEditing
                ? '저장하기'
                : '임시 등록하기'
              : resubmit
                ? '다시 요청'
                : !clubForm.isEditing
                  ? '등록 요청'
                  : clubForm.needsApproval
                    ? '수정 요청'
                    : '저장하기'}
        </Button>
      </div>
    </form>
  );
}
