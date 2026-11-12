import type { TPlaceCategory, TPlaceSubCategory } from '@/types/place/TPlace';

// 동글맵 장소 등록·수정 폼의 화면 상태. 가격은 입력 중인 문자열 그대로 두고 제출 시 숫자로 바꾼다.
export type TPlaceMenuRow = {
  key: string; // 행 추가·삭제·이동 시 React key와 오류 위치를 고정하기 위한 화면 전용 ID
  name: string;
  price: string;
};

// 등록 후에도 인증 회원 누구나 고칠 수 있는 항목(영업시간·설명·메뉴). 등록 폼과 수정 폼이 함께 쓴다.
export type TPlaceInfoForm = {
  businessHours: string;
  description: string;
  menus: TPlaceMenuRow[];
};

export type TPlaceForm = TPlaceInfoForm & {
  name: string;
  category: TPlaceCategory | null;
  subCategory: TPlaceSubCategory | null;
};

export type TPlaceInfoFormErrors = {
  businessHours?: string;
  description?: string;
  menus?: Record<string, { name?: string; price?: string }>;
};

export type TPlaceFormErrors = TPlaceInfoFormErrors & {
  name?: string;
  category?: string;
  subCategory?: string;
};

export type TLatLng = { lat: number; lng: number };
