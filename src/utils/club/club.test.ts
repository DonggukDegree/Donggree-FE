/** [동아리] 모집 상태·필터·정렬·입력 검증 검사 */
import { describe, expect, it } from 'vitest';

import type { TClubRecruitment, TClubSummary } from '@/types/club/TClub';
import {
  EMPTY_CLUB_FILTERS,
  filterClubs,
  getRecruitmentBadge,
  getRecruitmentStatus,
  getRecruitmentStatusLabel,
  getRecruitmentTone,
  isValidContact,
  isValidHttpsUrl,
  sortClubs,
} from '@/utils/club/club';

const NOW = new Date('2026-03-10T12:00:00+09:00');

const recruitment = (overrides: Partial<TClubRecruitment> = {}): TClubRecruitment => ({
  id: 1,
  generation: 12,
  alwaysOpen: false,
  startsAt: '2026-03-01T00:00:00+09:00',
  endsAt: '2026-03-15T18:00:00+09:00',
  closedEarly: false,
  links: [],
  notice: null,
  ...overrides,
});

const club = (overrides: Partial<TClubSummary>): TClubSummary => ({
  id: 1,
  name: '동아리',
  affiliation: 'CENTRAL',
  fields: ['PERFORMANCE'],
  registration: 'OFFICIAL',
  activityConfirmed: true,
  imageUrls: [],
  totalMemberCount: null,
  foundedDate: null,
  recruitment: null,
  ...overrides,
});

describe('getRecruitmentStatus', () => {
  it('모집 건이 없으면 모집 전', () => {
    expect(getRecruitmentStatus(null, NOW)).toBe('BEFORE');
  });

  it('시작 포함·마감 제외로 계산한다', () => {
    const value = recruitment({ startsAt: '2026-03-10T12:00:00+09:00', endsAt: '2026-03-10T13:00:00+09:00' });
    expect(getRecruitmentStatus(value, NOW)).toBe('OPEN');
    expect(getRecruitmentStatus(value, new Date('2026-03-10T11:59:00+09:00'))).toBe('BEFORE');
    expect(getRecruitmentStatus(value, new Date('2026-03-10T13:00:00+09:00'))).toBe('CLOSED');
  });

  it('조기 마감은 기간·상시모집보다 우선한다', () => {
    expect(getRecruitmentStatus(recruitment({ closedEarly: true }), NOW)).toBe('CLOSED');
    expect(getRecruitmentStatus(recruitment({ alwaysOpen: true, closedEarly: true }), NOW)).toBe('CLOSED');
  });

  it('상시모집은 기간 없이 모집 중이며 라벨에 상시모집을 붙인다', () => {
    const value = recruitment({ alwaysOpen: true, startsAt: null, endsAt: null });
    expect(getRecruitmentStatus(value, NOW)).toBe('OPEN');
    expect(getRecruitmentStatusLabel(value, NOW)).toBe('현재 모집 중🏃 상시모집');
    expect(getRecruitmentBadge(value, NOW)).toBe('상시모집');
  });
});

describe('getRecruitmentBadge', () => {
  it('마감까지 남은 날짜를 D-n으로, 당일은 D-DAY로 표시한다', () => {
    expect(getRecruitmentBadge(recruitment(), NOW)).toBe('마감 D-5');
    expect(getRecruitmentBadge(recruitment({ endsAt: '2026-03-10T23:00:00+09:00' }), NOW)).toBe('마감 D-DAY');
  });
});

describe('filterClubs', () => {
  const clubs = [
    club({ id: 1, affiliation: 'CENTRAL', fields: ['PERFORMANCE', 'VOLUNTEER'], recruitment: recruitment() }),
    club({ id: 2, affiliation: 'UNION', fields: ['VOLUNTEER'] }),
    club({ id: 3, affiliation: 'CENTRAL', fields: ['ACADEMIC'] }),
  ];
  const ids = (list: TClubSummary[]) => list.map(({ id }) => id);

  it('필터를 고르지 않으면 전체', () => {
    expect(ids(filterClubs(clubs, EMPTY_CLUB_FILTERS, NOW))).toEqual([1, 2, 3]);
  });

  it('같은 필터 안에서는 하나라도 해당하면 통과한다', () => {
    expect(ids(filterClubs(clubs, { ...EMPTY_CLUB_FILTERS, fields: ['PERFORMANCE', 'ACADEMIC'] }, NOW))).toEqual([
      1, 3,
    ]);
  });

  it('필터 종류끼리는 교집합이다', () => {
    const filters = { affiliations: ['CENTRAL' as const], fields: ['VOLUNTEER' as const], recruitmentStatuses: [] };
    expect(ids(filterClubs(clubs, filters, NOW))).toEqual([1]);
    expect(ids(filterClubs(clubs, { ...filters, recruitmentStatuses: ['BEFORE'] }, NOW))).toEqual([]);
  });
});

describe('getRecruitmentStatusLabel', () => {
  it('상태별 안내 문장', () => {
    expect(getRecruitmentStatusLabel(recruitment(), NOW)).toBe('현재 모집 중🏃 마감 D-5');
    expect(getRecruitmentStatusLabel(recruitment({ closedEarly: true }), NOW)).toBe('모집이 마감되었어요.');
    expect(getRecruitmentStatusLabel(null, NOW)).toBe('모집 전이에요.');
  });
});

describe('getRecruitmentTone', () => {
  it('상시모집은 모집 중과 색을 따로 쓴다', () => {
    expect(getRecruitmentTone(recruitment({ alwaysOpen: true, startsAt: null, endsAt: null }), NOW)).toBe('ALWAYS');
    expect(getRecruitmentTone(recruitment(), NOW)).toBe('OPEN');
    expect(getRecruitmentTone(null, NOW)).toBe('BEFORE');
    expect(getRecruitmentTone(recruitment({ closedEarly: true }), NOW)).toBe('CLOSED');
  });
});

describe('sortClubs', () => {
  const clubs = [
    club({ id: 1, name: '하늘', recruitment: recruitment({ endsAt: '2026-03-20T00:00:00+09:00' }) }),
    club({ id: 2, name: '가람' }),
    club({ id: 3, name: '나무', recruitment: recruitment({ alwaysOpen: true, startsAt: null, endsAt: null }) }),
    club({ id: 4, name: '다솜', recruitment: recruitment({ endsAt: '2026-03-12T00:00:00+09:00' }) }),
    club({ id: 5, name: '마루', recruitment: recruitment({ closedEarly: true }) }),
  ];
  const ids = (list: TClubSummary[]) => list.map(({ id }) => id);

  it('이름순은 가나다순', () => {
    expect(ids(sortClubs(clubs, 'NAME', NOW))).toEqual([2, 3, 4, 5, 1]);
  });

  it('마감 임박순은 기간 모집 중(마감 빠른 순) → 상시모집 → 나머지 이름순', () => {
    expect(ids(sortClubs(clubs, 'DEADLINE', NOW))).toEqual([4, 1, 3, 2, 5]);
  });

  it('인원 많은 순은 전체 활동 인원 내림차순, 인원 미입력은 맨 뒤', () => {
    const list = [
      club({ id: 1, name: '가람', totalMemberCount: null }),
      club({ id: 2, name: '나무', totalMemberCount: 40 }),
      club({ id: 3, name: '다솜', totalMemberCount: 120 }),
      club({ id: 4, name: '라온', totalMemberCount: 40 }),
    ];
    expect(ids(sortClubs(list, 'MEMBERS', NOW))).toEqual([3, 2, 4, 1]);
  });

  it('오래된 순은 창립일 오름차순, 창립일을 모르면 맨 뒤', () => {
    const list = [
      club({ id: 1, name: '가람', foundedDate: null }),
      club({ id: 2, name: '나무', foundedDate: '2015-03-01' }),
      club({ id: 3, name: '다솜', foundedDate: '1998-09-01' }),
      club({ id: 4, name: '라온', foundedDate: null }),
    ];
    expect(ids(sortClubs(list, 'OLDEST', NOW))).toEqual([3, 2, 1, 4]);
  });
});

describe('입력 검증', () => {
  it('지원 링크는 https만 허용한다', () => {
    expect(isValidHttpsUrl('https://forms.gle/abc')).toBe(true);
    expect(isValidHttpsUrl('http://forms.gle/abc')).toBe(false);
    expect(isValidHttpsUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpsUrl('forms.gle/abc')).toBe(false);
  });

  it('연락처는 이메일 또는 전화번호', () => {
    expect(isValidContact('club@dgu.ac.kr')).toBe(true);
    expect(isValidContact('010-1234-5678')).toBe(true);
    expect(isValidContact('01012345678')).toBe(true);
    expect(isValidContact('카톡 아이디')).toBe(false);
  });
});
