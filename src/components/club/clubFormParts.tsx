/**
 * [동아리] 폼 공통 조각
 * 등록·수정·모집 폼이 함께 쓰는 항목 묶음, 누르면 선택되는 칩, 관련 링크 행, 요청자 연락처·수집 동의 칸.
 */
import type { ReactNode } from 'react';

import { CLUB_LIMITS } from '@/constants/club';
import { INPUT_CLASS } from '@/constants/inputStyles';
import type { TClubLinkRow } from '@/types/club/TClubForm';

export function FormSection({
  title,
  required = false,
  description,
  error,
  children,
}: {
  title: string;
  required?: boolean;
  description?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-button-m lg:text-button-l text-coolgray-90">
          {title}
          {required ? (
            <span className="text-primary-60"> *</span>
          ) : (
            <span className="text-body-xs text-coolgray-60"> 선택</span>
          )}
        </h3>
        {description && <p className="break-keep text-body-xs lg:text-body-s text-coolgray-60">{description}</p>}
      </div>
      {children}
      {error && <p className="text-body-xs text-alert">{error}</p>}
    </section>
  );
}

// 누르면 선택·해제되는 칩 묶음. 선택된 칩은 마우스를 올렸을 때와 같은 테두리형으로 보인다. 단일 선택은 다른 칩을 누르면 바뀐다.
export function ChoiceChips<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => {
        const isSelected = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(value)}
            className={`cursor-pointer rounded-full border px-4 py-2 text-button-s transition-colors ${
              isSelected
                ? 'border-primary-60 bg-white text-primary-60'
                : 'border-coolgray-30 bg-white text-coolgray-60 hover:border-primary-60 hover:text-primary-60'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// 승인이 필요한 요청에만 보인다. 연락처는 관리자 확인용이며 동아리 화면에 공개하지 않는다.
export function RequesterConsentFields({
  contact,
  consent,
  errors,
  onContactChange,
  onConsentChange,
}: {
  contact: string;
  consent: boolean;
  errors: { contact?: string; consent?: string };
  onContactChange: (value: string) => void;
  onConsentChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-coolgray-20 bg-coolgray-10/40 p-4 lg:p-5">
      <FormSection
        title="요청자 연락처"
        required
        description="동그리는 안전한 동아리만 소개하기 위해 필요한 경우 검증 절차가 발생할 수 있어요. 확인할 때 연락드릴 연락처를 적어주세요. 동아리 화면에는 공개하지 않아요."
        error={errors.contact}
      >
        <input
          value={contact}
          maxLength={CLUB_LIMITS.CONTACT_MAX}
          placeholder="example@dgu.ac.kr 또는 010-0000-0000"
          onChange={(event) => onContactChange(event.target.value)}
          className={`${INPUT_CLASS} ${errors.contact ? 'border-alert' : 'border-coolgray-30'}`}
        />
      </FormSection>
      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-2 text-body-s text-coolgray-90">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => onConsentChange(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary-60"
          />
          <span>
            개인정보 수집·이용에 동의 <span className="text-primary-60">*</span>
          </span>
        </label>
        <ul className="ml-6 list-disc break-keep text-body-xs text-coolgray-60">
          <li>수집 항목: 이메일 또는 전화번호</li>
          <li>이용 목적: 동아리 등록·수정 요청의 사실 확인 연락</li>
          <li>보유 기간: 요청일로부터 1년 (파기 요청 시 즉시 파기)</li>
          <li>동의하지 않으면 등록이 불가해요.</li>
        </ul>
        {errors.consent && <p className="text-body-xs text-alert">{errors.consent}</p>}
      </div>
    </div>
  );
}

// 관련 링크 행(최대 3개). 앞칸에 화면에 보일 이름(1~10자)을 직접 쓰고, 뒷칸에 https 주소를 넣는다.
export function ClubLinkFields({
  description,
  links,
  error,
  onAdd,
  onChange,
  onRemove,
}: {
  description: string;
  links: TClubLinkRow[];
  error?: string;
  onAdd: () => void;
  onChange: (key: string, patch: Partial<TClubLinkRow>) => void;
  onRemove: (key: string) => void;
}) {
  const inputClass = `${INPUT_CLASS} ${error ? 'border-alert' : 'border-coolgray-30'} min-w-0`;
  return (
    <FormSection title="관련 링크" description={description} error={error}>
      {links.map((link) => (
        <div key={link.key} className="grid grid-cols-[112px_1fr_auto] gap-2 sm:grid-cols-[148px_1fr_auto]">
          <input
            aria-label="링크 이름"
            value={link.label}
            maxLength={CLUB_LIMITS.LINK_LABEL_MAX}
            placeholder="예: 인스타그램"
            onChange={(event) => onChange(link.key, { label: event.target.value })}
            className={inputClass}
          />
          <input
            type="url"
            aria-label="링크 주소"
            value={link.url}
            placeholder="https://"
            onChange={(event) => onChange(link.key, { url: event.target.value })}
            className={inputClass}
          />
          <button
            type="button"
            aria-label="링크 삭제"
            onClick={() => onRemove(link.key)}
            className="cursor-pointer px-2 text-heading-6 text-coolgray-60 hover:text-alert"
          >
            ×
          </button>
        </div>
      ))}
      {links.length < CLUB_LIMITS.LINKS_MAX && (
        <button
          type="button"
          onClick={onAdd}
          className="w-fit cursor-pointer rounded-full border border-coolgray-30 px-4 py-2 text-button-s text-coolgray-60 hover:border-primary-60 hover:text-primary-60"
        >
          + 링크 추가
        </button>
      )}
    </FormSection>
  );
}
