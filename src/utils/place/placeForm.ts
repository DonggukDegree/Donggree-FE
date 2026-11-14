import {
  CAMPUS_CENTER,
  CAMPUS_RADIUS_METERS,
  PLACE_FORM_LIMITS,
  PLACE_SUB_CATEGORIES_BY_CATEGORY,
  PLACE_TAGS,
} from '@/constants/place';
import type {
  TPlaceCategory,
  TPlaceDetail,
  TPlaceInfoEditRequest,
  TPlaceMenu,
  TPlaceRegisterRequest,
  TPlaceTag,
} from '@/types/place/TPlace';
import type {
  TLatLng,
  TPlaceForm,
  TPlaceFormErrors,
  TPlaceInfoForm,
  TPlaceInfoFormErrors,
  TPlaceMenuRow,
} from '@/types/place/TPlaceForm';
import type { TUserInfo } from '@/types/user/TGetUserInfo';

// [동글맵 > 장소 등록·정보 수정] 폼 상태·검증·요청 변환 순수 함수. 최종 검증은 서버가 다시 한다.

const EARTH_RADIUS_METERS = 6_371_008.8;

// 두 좌표 사이 지표면 거리(m). BE GeoPoint와 같은 하버사인 계산.
export const distanceMeters = (from: TLatLng, to: TLatLng) => {
  const toRadian = (degree: number) => (degree * Math.PI) / 180;
  const deltaLat = toRadian(to.lat - from.lat);
  const deltaLng = toRadian(to.lng - from.lng);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadian(from.lat)) * Math.cos(toRadian(to.lat)) * Math.sin(deltaLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(haversine)));
};

export const isInsideCampusArea = (point: TLatLng) => distanceMeters(CAMPUS_CENTER, point) <= CAMPUS_RADIUS_METERS;

// PDF 본인인증 또는 학교 이메일 인증 회원만 장소 등록·수정·신고·리뷰를 쓸 수 있다.
export const canWritePlace = (user: Pick<TUserInfo, 'identityVerified' | 'schoolEmailVerified'> | undefined) =>
  Boolean(user?.identityVerified || user?.schoolEmailVerified);

let menuRowSequence = 0;
export const createMenuRow = (): TPlaceMenuRow => ({ key: `menu-${++menuRowSequence}`, name: '', price: '' });

export const createEmptyPlaceForm = (): TPlaceForm => ({
  name: '',
  category: null,
  subCategory: null,
  businessHours: '',
  description: '',
  menus: [],
  tags: [],
});

// 카테고리가 바뀌면 그 카테고리에 속하지 않는 상세카테고리를 비운다.
export const changeCategory = (form: TPlaceForm, category: TPlaceCategory): TPlaceForm => ({
  ...form,
  category,
  subCategory:
    form.subCategory && PLACE_SUB_CATEGORIES_BY_CATEGORY[category].includes(form.subCategory) ? form.subCategory : null,
});

export const addMenuRow = (rows: TPlaceMenuRow[]) =>
  rows.length >= PLACE_FORM_LIMITS.MENU_MAX_COUNT ? rows : [...rows, createMenuRow()];

export const removeMenuRow = (rows: TPlaceMenuRow[], key: string) => rows.filter((row) => row.key !== key);

// 가격 칸은 숫자만 남긴다. (쉼표·원 표기를 붙여 입력해도 숫자로 정리)
export const sanitizePriceInput = (value: string) => value.replace(/\D/g, '').slice(0, 7);

// 메뉴 한 행의 이름·가격을 바꾼다. 가격은 숫자만 남긴다.
export const changeMenuRow = (rows: TPlaceMenuRow[], key: string, patch: { name?: string; price?: string }) =>
  rows.map((row) =>
    row.key === key
      ? {
          ...row,
          ...(patch.name !== undefined && { name: patch.name }),
          ...(patch.price !== undefined && { price: sanitizePriceInput(patch.price) }),
        }
      : row,
  );

// 한 칸 위(-1)·아래(+1)로 옮긴다. 끝을 넘으면 그대로 둔다.
export const moveMenuRow = (rows: TPlaceMenuRow[], key: string, direction: -1 | 1) => {
  const index = rows.findIndex((row) => row.key === key);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= rows.length) return rows;
  const next = [...rows];
  const [moved] = next.splice(index, 1);
  if (moved) next.splice(target, 0, moved);
  return next;
};

// 영업시간·설명·메뉴 검증. 등록 폼과 수정 폼이 같은 규칙을 쓴다.
export const validatePlaceInfoForm = (form: TPlaceInfoForm): TPlaceInfoFormErrors => {
  const errors: TPlaceInfoFormErrors = {};
  if (form.businessHours.trim().length > PLACE_FORM_LIMITS.BUSINESS_HOURS_MAX)
    errors.businessHours = `영업시간은 ${PLACE_FORM_LIMITS.BUSINESS_HOURS_MAX}자 이하로 입력해주세요.`;
  if (form.description.trim().length > PLACE_FORM_LIMITS.DESCRIPTION_MAX)
    errors.description = `설명은 ${PLACE_FORM_LIMITS.DESCRIPTION_MAX}자 이하로 입력해주세요.`;

  const menuErrors: NonNullable<TPlaceInfoFormErrors['menus']> = {};
  for (const row of form.menus) {
    const rowError: { name?: string; price?: string } = {};
    const menuName = row.name.trim();
    if (!menuName) rowError.name = '메뉴명을 입력하거나 행을 삭제해주세요.';
    else if (menuName.length > PLACE_FORM_LIMITS.MENU_NAME_MAX)
      rowError.name = `메뉴명은 ${PLACE_FORM_LIMITS.MENU_NAME_MAX}자 이하로 입력해주세요.`;
    if (row.price && Number(row.price) > PLACE_FORM_LIMITS.MENU_PRICE_MAX)
      rowError.price = '100만 원 이하로 입력해주세요.';
    if (rowError.name || rowError.price) menuErrors[row.key] = rowError;
  }
  if (Object.keys(menuErrors).length > 0) errors.menus = menuErrors;
  return errors;
};

export const validatePlaceForm = (form: TPlaceForm): TPlaceFormErrors => {
  const errors: TPlaceFormErrors = {};
  const name = form.name.trim();
  if (!name) errors.name = '이름을 입력해주세요.';
  else if (name.length > PLACE_FORM_LIMITS.NAME_MAX)
    errors.name = `이름은 ${PLACE_FORM_LIMITS.NAME_MAX}자 이하로 입력해주세요.`;
  if (!form.category) errors.category = '카테고리를 선택해주세요.';
  if (!form.subCategory) errors.subCategory = '상세카테고리를 선택해주세요.';
  return { ...errors, ...validatePlaceInfoForm(form) };
};

export const hasPlaceFormErrors = (errors: TPlaceFormErrors | TPlaceInfoFormErrors) => Object.keys(errors).length > 0;

// 숨은 맛집 태그를 중복 없이 서버(enum)와 같은 순서로 맞춘다. 순서만 다른 선택은 같은 값으로 본다.
export const sortPlaceTags = (tags: readonly TPlaceTag[]): TPlaceTag[] =>
  PLACE_TAGS.map(({ value }) => value).filter((value) => tags.includes(value));

// 태그 체크박스 토글.
export const togglePlaceTag = (tags: readonly TPlaceTag[], tag: TPlaceTag): TPlaceTag[] =>
  tags.includes(tag) ? tags.filter((value) => value !== tag) : sortPlaceTags([...tags, tag]);

// 선택 항목의 공백은 미입력(null), 빈 가격은 가격 변동(null).
const toInfoPayload = (form: TPlaceInfoForm) => ({
  businessHours: form.businessHours.trim() || null,
  description: form.description.trim() || null,
  menus: form.menus.map((row): TPlaceMenu => ({ name: row.name.trim(), price: row.price ? Number(row.price) : null })),
  tags: sortPlaceTags(form.tags),
});

// 검증을 통과한 폼을 등록 요청으로 바꾼다.
export const toPlaceRegisterRequest = (form: TPlaceForm, point: TLatLng): TPlaceRegisterRequest => {
  if (!form.category || !form.subCategory) throw new Error('카테고리가 선택되지 않은 폼은 변환할 수 없습니다.');
  return {
    name: form.name.trim(),
    category: form.category,
    subCategory: form.subCategory,
    latitude: point.lat,
    longitude: point.lng,
    ...toInfoPayload(form),
  };
};

// 수정 폼을 현재 장소 값으로 채운다. 가격 없음(가격 변동)은 빈 칸.
export const createPlaceInfoForm = (
  place: Pick<TPlaceDetail, 'businessHours' | 'description' | 'menus' | 'tags'>,
): TPlaceInfoForm => ({
  businessHours: place.businessHours ?? '',
  description: place.description ?? '',
  menus: place.menus.map((menu) => ({ ...createMenuRow(), name: menu.name, price: menu.price?.toString() ?? '' })),
  tags: [...place.tags],
});

// 검증을 통과한 수정 폼을 요청으로 바꾼다. version은 폼을 채운 시점의 장소 버전.
export const toPlaceInfoEditRequest = (form: TPlaceInfoForm, version: number): TPlaceInfoEditRequest => ({
  version,
  ...toInfoPayload(form),
});

// 요청이 현재 장소 값과 같은지. 같으면 서버에 보내지 않는다(서버도 이력을 남기지 않음).
export const isSamePlaceInfo = (
  place: Pick<TPlaceDetail, 'businessHours' | 'description' | 'menus' | 'tags'>,
  request: TPlaceInfoEditRequest,
) =>
  (place.businessHours ?? null) === request.businessHours &&
  (place.description ?? null) === request.description &&
  place.menus.length === request.menus.length &&
  place.menus.every(
    (menu, index) => menu.name === request.menus[index]?.name && menu.price === request.menus[index]?.price,
  ) &&
  sortPlaceTags(place.tags).join() === sortPlaceTags(request.tags).join();
