/**
 * [동글맵 > 장소 정보 수정] 입력 폼
 * 등록 폼과 같은 자리(모바일 전체 화면, lg 이상 왼쪽 400px 패널)에 띄운다.
 * 이름·위치·카테고리는 바꿀 수 없어 보기만 하고, 영업시간·설명·메뉴만 고친다.
 * 다른 회원이 먼저 고쳤으면 입력을 지우지 않고 안내한 뒤, 최신 정보를 불러와 다시 고치게 한다.
 */
import Button from '@/components/common/inputs/button';
import PlaceInfoFields from '@/components/map/placeInfoFields';
import { PLACE_CATEGORY_BY_VALUE, PLACE_SUB_CATEGORY_LABELS } from '@/constants/place';
import usePlaceInfoEditForm from '@/hooks/place/usePlaceInfoEditForm';
import type { TPlaceDetail } from '@/types/place/TPlace';

interface IPlaceInfoEditFormProps {
  place: TPlaceDetail;
  onClose: () => void;
}

export default function PlaceInfoEditForm({ place, onClose }: IPlaceInfoEditFormProps) {
  const edit = usePlaceInfoEditForm(place, onClose);
  const category = PLACE_CATEGORY_BY_VALUE[place.category];
  const isBusy = edit.isSubmitting || edit.isReloading || edit.hasConflict;

  return (
    <section
      aria-label="장소 정보 수정"
      className="absolute inset-0 z-40 flex flex-col bg-white lg:right-auto lg:w-100 lg:shadow-[4px_0_16px_rgba(0,0,0,0.08)]"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-coolgray-10 px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer text-button-m text-coolgray-60 hover:text-primary-60"
        >
          ‹ 취소
        </button>
        <h2 className="text-heading-6 text-coolgray-90">정보 수정</h2>
      </header>

      <form
        noValidate
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 py-5"
        onSubmit={(event) => {
          event.preventDefault();
          edit.submit();
        }}
      >
        <div className="flex flex-col gap-1 rounded-lg bg-coolgray-10 px-4 py-3">
          <p className="text-body-xs text-coolgray-60">
            {category.emoji} {category.label} · {PLACE_SUB_CATEGORY_LABELS[place.subCategory]}
          </p>
          <p className="break-keep text-button-m text-coolgray-90">{place.name}</p>
          <p className="break-keep text-body-xs text-coolgray-60">이름·위치·카테고리는 바꿀 수 없어요.</p>
        </div>

        {edit.hasConflict && (
          <div role="alert" className="flex flex-col gap-3 rounded-lg border border-alert bg-white px-4 py-3">
            <p className="break-keep text-body-s text-coolgray-90">
              다른 회원이 먼저 수정했어요. 최신 정보를 불러와 다시 수정해주세요.
            </p>
            <p className="break-keep text-body-xs text-coolgray-60">
              불러오면 지금 입력한 내용은 최신 정보로 바뀌어요.
            </p>
            <Button
              type="button"
              variant={edit.isReloading ? 'disabled' : 'outlined'}
              className="w-full"
              onClick={edit.reloadLatest}
            >
              {edit.isReloading ? '불러오는 중' : '최신 정보 불러오기'}
            </Button>
          </div>
        )}

        <PlaceInfoFields form={edit.form} errors={edit.errors} onChange={edit.changeInfo} />

        <Button type="submit" variant={isBusy ? 'disabled' : 'primary'} className="mt-2 w-full shrink-0">
          {edit.isSubmitting ? '저장 중' : '저장하기'}
        </Button>
      </form>
    </section>
  );
}
