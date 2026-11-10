/** [동글맵 > 장소 등록] 서비스 영역·쓰기 권한·폼 검증·메뉴 행·요청 변환 검사 */
import { describe, expect, it } from 'vitest';

import { CAMPUS_CENTER } from '@/constants/place';
import type { TPlaceForm } from '@/types/place/TPlaceForm';
import {
  addMenuRow,
  canWritePlace,
  changeCategory,
  createEmptyPlaceForm,
  createMenuRow,
  distanceMeters,
  hasPlaceFormErrors,
  isInsideCampusArea,
  moveMenuRow,
  removeMenuRow,
  sanitizePriceInput,
  toPlaceRegisterRequest,
  validatePlaceForm,
} from '@/utils/place/placeForm';

const validForm = (): TPlaceForm => ({
  ...createEmptyPlaceForm(),
  name: '  동국반점 ',
  category: 'RESTAURANT',
  subCategory: 'CHINESE',
  businessHours: '  ',
  description: ' 정문 맞은편 2층 ',
  menus: [
    { key: 'a', name: ' 짜장면 ', price: '7000' },
    { key: 'b', name: '탕수육', price: '' },
  ],
});

describe('서비스 영역과 쓰기 권한', () => {
  it('위도 0.001도는 약 111m, 캠퍼스 반경 1.5km 안만 등록 가능', () => {
    expect(distanceMeters({ lat: 37.5, lng: 127 }, { lat: 37.501, lng: 127 })).toBeCloseTo(111.2, 0);
    expect(isInsideCampusArea(CAMPUS_CENTER)).toBe(true);
    expect(isInsideCampusArea({ lat: CAMPUS_CENTER.lat + 0.012, lng: CAMPUS_CENTER.lng })).toBe(true);
    expect(isInsideCampusArea({ lat: CAMPUS_CENTER.lat + 0.02, lng: CAMPUS_CENTER.lng })).toBe(false);
  });

  it('PDF 본인인증 또는 학교 이메일 인증 회원만 쓰기 가능', () => {
    expect(canWritePlace({ identityVerified: true, schoolEmailVerified: false })).toBe(true);
    expect(canWritePlace({ identityVerified: false, schoolEmailVerified: true })).toBe(true);
    expect(canWritePlace({ identityVerified: false, schoolEmailVerified: false })).toBe(false);
    expect(canWritePlace(undefined)).toBe(false);
  });
});

describe('장소 등록 폼', () => {
  it('필수값 누락과 길이 초과, 빈 메뉴명·가격 상한을 오류로 표시', () => {
    const errors = validatePlaceForm({
      ...createEmptyPlaceForm(),
      name: '가'.repeat(31),
      businessHours: '가'.repeat(101),
      description: '가'.repeat(301),
      menus: [{ key: 'm1', name: ' ', price: '1000001' }],
    });
    expect(errors.name).toContain('30자');
    expect(errors.category).toBeDefined();
    expect(errors.subCategory).toBeDefined();
    expect(errors.businessHours).toContain('100자');
    expect(errors.description).toContain('300자');
    expect(errors.menus?.m1).toEqual({
      name: '메뉴명을 입력하거나 행을 삭제해주세요.',
      price: '100만 원 이하로 입력해주세요.',
    });
    expect(hasPlaceFormErrors(validatePlaceForm(validForm()))).toBe(false);
  });

  it('카테고리를 바꾸면 속하지 않는 상세카테고리만 비움', () => {
    const form = validForm();
    expect(changeCategory(form, 'CAFE').subCategory).toBeNull();
    expect(changeCategory(form, 'RESTAURANT').subCategory).toBe('CHINESE');
  });

  it('메뉴 행을 50개까지 추가하고 삭제·위아래 이동', () => {
    let rows = Array.from({ length: 49 }, createMenuRow);
    rows = addMenuRow(rows);
    expect(addMenuRow(rows)).toHaveLength(50);
    const first = rows[0]!;
    const second = rows[1]!;
    expect(moveMenuRow(rows, second.key, -1).slice(0, 2)).toEqual([second, first]);
    expect(moveMenuRow(rows, first.key, 1).slice(0, 2)).toEqual([second, first]);
    expect(moveMenuRow(rows, first.key, -1)).toBe(rows);
    expect(removeMenuRow(rows, first.key)).toHaveLength(49);
  });

  it('가격 칸은 숫자만 남김', () => {
    expect(sanitizePriceInput('7,000원')).toBe('7000');
    expect(sanitizePriceInput('abc')).toBe('');
  });

  it('공백 선택 항목은 null, 빈 가격은 가격 변동(null)으로 요청 변환', () => {
    expect(toPlaceRegisterRequest(validForm(), { lat: 37.5585, lng: 127.0 })).toEqual({
      name: '동국반점',
      category: 'RESTAURANT',
      subCategory: 'CHINESE',
      latitude: 37.5585,
      longitude: 127.0,
      businessHours: null,
      description: '정문 맞은편 2층',
      menus: [
        { name: '짜장면', price: 7000 },
        { name: '탕수육', price: null },
      ],
    });
  });
});
