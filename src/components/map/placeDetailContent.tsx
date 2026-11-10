/**
 * [동글맵] 장소 정보 본문
 * 주소는 저장하지 않으므로 좌표로 실시간 조회해 보여준다. 등록자·수정자는 표시하지 않는다.
 * 리뷰 영역은 리뷰 기능이 열릴 때 채운다.
 */
import { type ReactNode, useState } from 'react';

import { PLACE_CATEGORY_BY_VALUE, PLACE_MENU_PREVIEW_COUNT, PLACE_SUB_CATEGORY_LABELS } from '@/constants/place';
import usePlaceAddress from '@/hooks/place/usePlaceAddress';
import type { TPlaceDetail, TPlaceMenu } from '@/types/place/TPlace';
import { formatMenuPrice, formatPlaceDate } from '@/utils/place/place';

export default function PlaceDetailContent({ place }: { place: TPlaceDetail }) {
  const category = PLACE_CATEGORY_BY_VALUE[place.category];
  const { address, isLoading: isAddressLoading } = usePlaceAddress(place.latitude, place.longitude);
  const [showAllMenus, setShowAllMenus] = useState(false);
  const menus = showAllMenus ? place.menus : place.menus.slice(0, PLACE_MENU_PREVIEW_COUNT);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-body-s text-coolgray-60">
          <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: category.color }} />
          {category.label} · {PLACE_SUB_CATEGORY_LABELS[place.subCategory]}
        </p>
        <h2 className="text-heading-5 text-coolgray-90 break-keep">{place.name}</h2>
      </div>

      <dl className="flex flex-col gap-3 text-body-s">
        <InfoRow label="주소">
          {isAddressLoading ? '주소를 불러오는 중이에요' : (address ?? '주소를 확인할 수 없어요')}
        </InfoRow>
        {place.businessHours && <InfoRow label="영업시간">{place.businessHours}</InfoRow>}
      </dl>

      {place.description && (
        <p className="whitespace-pre-line break-keep text-body-s text-coolgray-90">{place.description}</p>
      )}

      {place.menus.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-button-m text-coolgray-90">메뉴</h3>
          <ul className="flex flex-col divide-y divide-coolgray-10 border-y border-coolgray-10">
            {withMenuKeys(menus).map(({ key, menu }) => (
              <li key={key} className="flex justify-between gap-4 py-2.5 text-body-s">
                <span className="break-keep text-coolgray-90">{menu.name}</span>
                <span className="shrink-0 text-coolgray-60">{formatMenuPrice(menu.price)}</span>
              </li>
            ))}
          </ul>
          {place.menus.length > PLACE_MENU_PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllMenus((value) => !value)}
              className="cursor-pointer self-center text-button-s text-coolgray-60 hover:text-primary-60"
            >
              {showAllMenus ? '메뉴 접기' : `메뉴 더보기 (${place.menus.length - PLACE_MENU_PREVIEW_COUNT})`}
            </button>
          )}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="text-button-m text-coolgray-90">리뷰</h3>
        <p className="rounded-lg bg-coolgray-10 px-4 py-5 text-center text-body-s text-coolgray-60">
          리뷰 기능은 곧 열려요.
        </p>
      </section>

      <p className="text-body-xs text-coolgray-60">
        최초 등록 {formatPlaceDate(place.createdAt)} · 마지막 수정 {formatPlaceDate(place.updatedAt)}
      </p>
    </div>
  );
}

// 메뉴에는 ID가 없어 이름·가격과 같은 항목의 등장 순번으로 안정적인 key를 만든다.
function withMenuKeys(menus: TPlaceMenu[]) {
  const seen = new Map<string, number>();
  return menus.map((menu) => {
    const base = `${menu.name}:${menu.price ?? ''}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return { key: `${base}:${count}`, menu };
  });
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-14 shrink-0 text-coolgray-60">{label}</dt>
      <dd className="whitespace-pre-line break-keep text-coolgray-90">{children}</dd>
    </div>
  );
}
