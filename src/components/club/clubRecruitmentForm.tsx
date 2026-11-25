/**
 * [동아리] 모집 등록·수정 폼
 * 기간 모집은 시작·마감 일시(한국시간, 분 단위)에 맞춰 자동으로 모집 중·마감이 되고,
 * 상시모집은 기간 없이 '현재 모집 중 · 상시모집'으로 보인다. 조기 마감은 기간보다 우선하며 자동으로 다시 열리지 않는다.
 */
import { useNavigate } from 'react-router-dom';

import { ChoiceChips, ClubLinkFields, FormSection, RequesterConsentFields } from '@/components/club/clubFormParts';
import Button from '@/components/common/inputs/button';
import Toggle from '@/components/common/inputs/toggle';
import { CLUB_LIMITS, CLUB_POINTS } from '@/constants/club';
import { INPUT_CLASS } from '@/constants/inputStyles';
import useClubRecruitmentForm from '@/hooks/club/useClubRecruitmentForm';
import type { TClubDetail } from '@/types/club/TClub';
import { dateTextClass } from '@/utils/club/clubForm';

const inputClass = (error?: string) => `${INPUT_CLASS} ${error ? 'border-alert' : 'border-coolgray-30'}`;

const MODE_OPTIONS: { value: 'PERIOD' | 'ALWAYS'; label: string }[] = [
  { value: 'PERIOD', label: '기간 모집' },
  { value: 'ALWAYS', label: '상시모집' },
];

export default function ClubRecruitmentForm({ club }: { club: TClubDetail }) {
  const navigate = useNavigate();
  const recruitmentForm = useClubRecruitmentForm(club);
  const { form, errors, update } = recruitmentForm;

  return (
    <form
      noValidate
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        recruitmentForm.submit();
      }}
    >
      <p className="break-keep rounded-xl bg-primary-30 px-4 py-3 text-body-s text-primary-90">
        {recruitmentForm.needsApproval
          ? '관리자 확인 후 모집 정보가 반영돼요. '
          : '이 동아리 정보를 승인받은 적이 있어 저장하면 바로 반영돼요. '}
        {!recruitmentForm.hasExisting && `새 모집을 등록하면 ${CLUB_POINTS.RECRUITMENT}P를 드려요.`}
      </p>

      <FormSection title="모집 기수" description="기수제가 아니면 비워 두세요." error={errors.generation}>
        <input
          inputMode="numeric"
          value={form.generation}
          placeholder="예: 25"
          onChange={(event) => update('generation', event.target.value)}
          className={`${inputClass(errors.generation)} sm:w-40`}
        />
      </FormSection>

      <FormSection
        title="모집 방식"
        required
        description={
          form.alwaysOpen
            ? '기간 없이 모집 중으로 보여요. 그만 받을 때는 아래에서 모집 마감을 켜주세요.'
            : '시작 일시부터 모집 중, 마감 일시가 되면 자동으로 모집 마감이 돼요. (한국시간)'
        }
        error={errors.period}
      >
        <ChoiceChips
          options={MODE_OPTIONS}
          selected={[form.alwaysOpen ? 'ALWAYS' : 'PERIOD']}
          onToggle={(value) => update('alwaysOpen', value === 'ALWAYS')}
        />
        {!form.alwaysOpen && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-body-xs text-coolgray-60">
              시작 일시
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => update('startsAt', event.target.value)}
                className={`${inputClass(errors.period)} ${dateTextClass(form.startsAt)}`}
              />
            </label>
            <label className="flex flex-col gap-1 text-body-xs text-coolgray-60">
              마감 일시
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => update('endsAt', event.target.value)}
                className={`${inputClass(errors.period)} ${dateTextClass(form.endsAt)}`}
              />
            </label>
          </div>
        )}
      </FormSection>

      <ClubLinkFields
        description={`지원폼, 오픈채팅 등 보일 이름(${CLUB_LIMITS.LINK_LABEL_MAX}자 이내)과 모집 관련 https:// 주소를 최대 ${CLUB_LIMITS.LINKS_MAX}개까지 넣을 수 있어요.`}
        links={form.links}
        error={errors.links}
        onAdd={recruitmentForm.addLink}
        onChange={recruitmentForm.changeLink}
        onRemove={recruitmentForm.removeLink}
      />

      <FormSection title="모집 안내">
        <textarea
          rows={4}
          value={form.notice}
          maxLength={CLUB_LIMITS.NOTICE_MAX}
          placeholder="지원 대상, 선발 방법, 면접 일정 등을 적어주세요."
          onChange={(event) => update('notice', event.target.value)}
          className={`${inputClass()} resize-none`}
        />
        <p className="text-right text-body-xs text-coolgray-60">
          {form.notice.length}/{CLUB_LIMITS.NOTICE_MAX}
        </p>
      </FormSection>

      {recruitmentForm.hasExisting && (
        <FormSection
          title="모집 마감"
          description="기간과 관계없이 지금 모집을 마감해요. 마감 후에는 자동으로 다시 열리지 않아요."
        >
          <div className="flex items-center gap-3 text-body-s text-coolgray-90">
            <Toggle checked={form.closedEarly} onChange={(checked) => update('closedEarly', checked)} />
            모집 마감하기
          </div>
        </FormSection>
      )}

      {recruitmentForm.needsApproval && (
        <RequesterConsentFields
          contact={form.contact}
          consent={form.consent}
          errors={errors}
          onContactChange={(value) => update('contact', value)}
          onConsentChange={(value) => update('consent', value)}
        />
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outlined" className="flex-1" onClick={() => navigate(-1)}>
          취소
        </Button>
        <Button type="submit" variant={recruitmentForm.canSubmit ? 'primary' : 'disabled'} className="flex-1">
          {recruitmentForm.isSubmitting ? '보내는 중' : recruitmentForm.needsApproval ? '모집 등록 요청' : '저장하기'}
        </Button>
      </div>
    </form>
  );
}
