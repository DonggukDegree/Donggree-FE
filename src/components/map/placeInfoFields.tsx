/**
 * [동글맵 > 장소 등록·정보 수정] 영업시간·설명·숨은 맛집 태그·메뉴 입력 칸
 * 등록 후에도 인증 회원 누구나 고칠 수 있는 항목이라 등록 폼과 수정 폼이 함께 쓴다.
 * 메뉴는 행을 추가·삭제·이동해 입력하고, 저장할 때 목록 전체를 보낸다.
 * 숨은 맛집 태그는 체크박스로 0개 이상 고르며, 강력한 추천일 때만 고르도록 안내한다.
 */
import type { ReactNode } from 'react';

import Checkmark from '@/assets/icons/checkmark.svg?react';
import TextField from '@/components/common/inputs/textField';
import { INPUT_CLASS } from '@/constants/inputStyles';
import { HIDDEN_GEM, PLACE_FORM_LIMITS, PLACE_TAGS } from '@/constants/place';
import type { TPlaceInfoForm, TPlaceInfoFormErrors } from '@/types/place/TPlaceForm';
import { addMenuRow, changeMenuRow, moveMenuRow, removeMenuRow, togglePlaceTag } from '@/utils/place/placeForm';

interface IPlaceInfoFieldsProps {
  form: TPlaceInfoForm;
  errors: TPlaceInfoFormErrors;
  // 연속 입력에도 최신 상태를 기준으로 바꾸도록 갱신 함수를 받는다.
  onChange: (update: (current: TPlaceInfoForm) => TPlaceInfoForm) => void;
}

export default function PlaceInfoFields({ form, errors, onChange }: IPlaceInfoFieldsProps) {
  const updateMenus = (update: (menus: TPlaceInfoForm['menus']) => TPlaceInfoForm['menus']) =>
    onChange((current) => ({ ...current, menus: update(current.menus) }));

  return (
    <>
      <PlaceFormField label="영업시간" htmlFor="place-hours" hint="선택">
        <TextField
          id="place-hours"
          className="w-full"
          value={form.businessHours}
          maxLength={PLACE_FORM_LIMITS.BUSINESS_HOURS_MAX}
          placeholder="예) 평일 11:00-21:00, 일요일 휴무"
          onChange={(event) => {
            const businessHours = event.target.value;
            onChange((current) => ({ ...current, businessHours }));
          }}
          error={errors.businessHours}
        />
      </PlaceFormField>

      <PlaceFormField label="설명" htmlFor="place-description" hint="선택" error={errors.description}>
        <textarea
          id="place-description"
          rows={3}
          value={form.description}
          maxLength={PLACE_FORM_LIMITS.DESCRIPTION_MAX}
          placeholder="예) 2층, 정문 맞은편 골목 · 분위기 등"
          onChange={(event) => {
            const description = event.target.value;
            onChange((current) => ({ ...current, description }));
          }}
          className={`${INPUT_CLASS} resize-none ${errors.description ? 'border-alert' : 'border-coolgray-30'}`}
        />
        <p className="self-end text-body-xs text-coolgray-60">
          {form.description.length}/{PLACE_FORM_LIMITS.DESCRIPTION_MAX}
        </p>
      </PlaceFormField>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-button-m text-coolgray-90">
          <span aria-hidden="true" className="mr-1">
            {HIDDEN_GEM.emoji}
          </span>
          {HIDDEN_GEM.label} <span className="text-body-xs text-coolgray-60">선택 · 여러 개 가능</span>
        </legend>
        <p className="break-keep text-body-xs text-primary-90">강력한 추천인 경우에만 눌러주세요!</p>
        <div className="grid grid-cols-2 gap-2">
          {PLACE_TAGS.map(({ value, label }) => {
            const checked = form.tags.includes(value);
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-body-s text-coolgray-90 ${
                  checked ? 'border-primary-60' : 'border-coolgray-30'
                }`}
              >
                {/* 기본 체크박스는 강조색이 번져 보여 테두리·체크를 직접 그린다(신고 사유 라디오와 같은 방식). */}
                <span className="relative flex h-4 w-4 shrink-0">
                  <input
                    type="checkbox"
                    value={value}
                    checked={checked}
                    onChange={() => onChange((current) => ({ ...current, tags: togglePlaceTag(current.tags, value) }))}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-sm border-[1.5px] border-coolgray-30 checked:border-primary-60 checked:bg-primary-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
                  />
                  <Checkmark
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 hidden h-4 w-4 text-white peer-checked:block"
                  />
                </span>
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-button-m text-coolgray-90">
          메뉴 <span className="text-body-xs text-coolgray-60">선택 · 가격을 비우면 가격 변동</span>
        </legend>
        {form.menus.map((row, index) => {
          const rowError = errors.menus?.[row.key];
          return (
            <div key={row.key} className="flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <TextField
                  aria-label={`${index + 1}번째 메뉴명`}
                  className="min-w-0 flex-3"
                  value={row.name}
                  maxLength={PLACE_FORM_LIMITS.MENU_NAME_MAX}
                  placeholder="메뉴명"
                  onChange={(event) => {
                    const name = event.target.value;
                    updateMenus((menus) => changeMenuRow(menus, row.key, { name }));
                  }}
                  error={rowError?.name}
                />
                <TextField
                  aria-label={`${index + 1}번째 메뉴 가격`}
                  className="min-w-0 flex-2"
                  value={row.price}
                  inputMode="numeric"
                  placeholder="가격(원)"
                  onChange={(event) => {
                    const price = event.target.value;
                    updateMenus((menus) => changeMenuRow(menus, row.key, { price }));
                  }}
                  error={rowError?.price}
                />
                <div className="flex shrink-0 items-center">
                  <IconButton
                    label={`${index + 1}번째 메뉴 위로`}
                    disabled={index === 0}
                    onClick={() => updateMenus((menus) => moveMenuRow(menus, row.key, -1))}
                  >
                    ↑
                  </IconButton>
                  <IconButton
                    label={`${index + 1}번째 메뉴 아래로`}
                    disabled={index === form.menus.length - 1}
                    onClick={() => updateMenus((menus) => moveMenuRow(menus, row.key, 1))}
                  >
                    ↓
                  </IconButton>
                  <IconButton
                    label={`${index + 1}번째 메뉴 삭제`}
                    onClick={() => updateMenus((menus) => removeMenuRow(menus, row.key))}
                  >
                    ×
                  </IconButton>
                </div>
              </div>
            </div>
          );
        })}
        {form.menus.length < PLACE_FORM_LIMITS.MENU_MAX_COUNT && (
          <button
            type="button"
            onClick={() => updateMenus(addMenuRow)}
            className="cursor-pointer rounded-lg border border-dashed border-coolgray-30 py-3 text-button-m text-coolgray-60 hover:border-primary-60 hover:text-primary-60"
          >
            + 메뉴 추가
          </button>
        )}
      </fieldset>
    </>
  );
}

export function PlaceFormField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <label htmlFor={htmlFor} className="text-button-m text-coolgray-90">
        {label}
        {required && <span className="ml-0.5 text-alert">*</span>}
        {hint && <span className="ml-1 text-body-xs text-coolgray-60">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-body-xs text-alert">{error}</p>}
    </div>
  );
}

function IconButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-12 w-8 cursor-pointer items-center justify-center text-body-m text-coolgray-60 hover:text-primary-60 disabled:cursor-default disabled:text-coolgray-20"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
