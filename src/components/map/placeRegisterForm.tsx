/**
 * [동글맵 > 장소 등록] 입력 폼
 * 모바일은 지도 위 전체 화면, lg 이상은 장소 정보 패널 자리(왼쪽 400px)에 띄운다.
 * 이름·위치·카테고리는 등록 후 바꿀 수 없다는 점을 미리 알리고, 메뉴는 행을 추가·삭제·이동해 입력한다.
 */
import Button from '@/components/common/inputs/button';
import Select from '@/components/common/inputs/select';
import TextField from '@/components/common/inputs/textField';
import PlaceDuplicateDialog from '@/components/map/placeDuplicateDialog';
import PlaceInfoFields, { PlaceFormField as Field } from '@/components/map/placeInfoFields';
import {
  PLACE_CATEGORIES,
  PLACE_FORM_LIMITS,
  PLACE_SUB_CATEGORIES_BY_CATEGORY,
  PLACE_SUB_CATEGORY_LABELS,
} from '@/constants/place';
import usePlaceAddress from '@/hooks/place/usePlaceAddress';
import usePlaceRegisterForm from '@/hooks/place/usePlaceRegisterForm';
import type { TLatLng } from '@/types/place/TPlaceForm';

interface IPlaceRegisterFormProps {
  point: TLatLng;
  onBack: () => void;
  onRegistered: (placeId: number) => void;
  onSelectExisting: (placeId: number) => void;
}

const CATEGORY_LABELS = PLACE_CATEGORIES.map(({ label }) => label);

export default function PlaceRegisterForm({ point, onBack, onRegistered, onSelectExisting }: IPlaceRegisterFormProps) {
  const register = usePlaceRegisterForm(point, onRegistered);
  const { form, errors } = register;
  const { address, isLoading: isAddressLoading } = usePlaceAddress(point.lat, point.lng);
  const subCategories = form.category ? PLACE_SUB_CATEGORIES_BY_CATEGORY[form.category] : [];
  const categoryLabel = PLACE_CATEGORIES.find(({ value }) => value === form.category)?.label ?? '';

  return (
    <section
      aria-label="장소 등록"
      className="absolute inset-0 z-40 flex flex-col bg-white lg:right-auto lg:w-100 lg:shadow-[4px_0_16px_rgba(0,0,0,0.08)]"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-coolgray-10 px-5 py-3">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-button-m text-coolgray-60 hover:text-primary-60"
        >
          ‹ 위치 다시 정하기
        </button>
        <h2 className="text-heading-6 text-coolgray-90">장소 등록</h2>
      </header>

      <form
        noValidate
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 py-5"
        onSubmit={(event) => {
          event.preventDefault();
          void register.submit();
        }}
      >
        <div className="flex flex-col gap-1 rounded-lg bg-coolgray-10 px-4 py-3">
          <p className="text-body-xs text-coolgray-60">위치</p>
          <p className="break-keep text-body-s text-coolgray-90">
            {isAddressLoading ? '주소를 불러오는 중이에요' : (address ?? '주소를 확인할 수 없어요')}
          </p>
        </div>

        <Field label="이름" htmlFor="place-name" required>
          <TextField
            id="place-name"
            className="w-full"
            value={form.name}
            maxLength={PLACE_FORM_LIMITS.NAME_MAX}
            placeholder="간판에 적힌 이름"
            onChange={(event) => register.changeName(event.target.value)}
            error={errors.name}
          />
        </Field>

        <div className="flex gap-3">
          <Field label="카테고리" htmlFor="place-category" required error={errors.category}>
            <Select
              id="place-category"
              options={CATEGORY_LABELS}
              value={categoryLabel}
              onChange={(event) => {
                const next = PLACE_CATEGORIES.find(({ label }) => label === event.target.value);
                if (next) register.changeCategory(next.value);
              }}
            />
          </Field>
          <Field label="상세카테고리" htmlFor="place-sub-category" required error={errors.subCategory}>
            <Select
              id="place-sub-category"
              options={subCategories.map((value) => PLACE_SUB_CATEGORY_LABELS[value])}
              value={form.subCategory ? PLACE_SUB_CATEGORY_LABELS[form.subCategory] : ''}
              placeholder={form.category ? '선택' : '카테고리 먼저'}
              disabled={!form.category}
              onChange={(event) => {
                const next = subCategories.find((value) => PLACE_SUB_CATEGORY_LABELS[value] === event.target.value);
                if (next) register.changeSubCategory(next);
              }}
            />
          </Field>
        </div>
        <p className="-mt-3 break-keep text-body-xs text-coolgray-60">
          이름·위치·카테고리는 등록 후 바꿀 수 없어요. 영업시간·설명·숨은 맛집·메뉴는 나중에도 수정할 수 있어요.
        </p>

        <PlaceInfoFields form={form} errors={errors} onChange={register.changeInfo} />

        <Button type="submit" variant={register.isSubmitting ? 'disabled' : 'primary'} className="mt-2 w-full shrink-0">
          {register.isSubmitting ? '등록 중' : '등록하기'}
        </Button>
      </form>

      {register.duplicateNotice && (
        <PlaceDuplicateDialog
          notice={register.duplicateNotice}
          onSelectExisting={onSelectExisting}
          onConfirmDifferent={register.confirmDifferentPlace}
          onClose={register.closeDuplicateNotice}
        />
      )}
    </section>
  );
}
