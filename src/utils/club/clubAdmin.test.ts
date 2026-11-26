import { describe, expect, it } from 'vitest';

import type { TClubSaveRequest } from '@/types/club/TClub';
import type { TClubBannerForm } from '@/types/club/TClubAdmin';
import {
  createBannerForm,
  describeRequestChanges,
  getBannerStatus,
  isValidBannerLink,
  numberRequestsByOldest,
  toBannerSave,
  validateBannerForm,
} from '@/utils/club/clubAdmin';

const body: TClubSaveRequest = {
  name: '소리마루',
  affiliation: 'CENTRAL',
  fields: ['PERFORMANCE'],
  description: '밴드 동아리',
  generation: 24,
  activityStartDate: '2026-03-01',
  activityEndDate: '2027-02-28',
  roomLocation: '학생회관 312호',
  generationMemberCount: 14,
  totalMemberCount: 120,
  foundedDate: null,
  officers: [],
  links: [],
  imageCount: 2,
  requesterContact: null,
  requesterRole: null,
};

describe('describeRequestChanges', () => {
  it('수정 요청은 바뀐 항목만 changed', () => {
    const rows = describeRequestChanges({
      type: 'EDIT',
      before: body,
      after: { ...body, roomLocation: null, totalMemberCount: 130 },
    });
    const changed = rows.filter((row) => row.changed).map((row) => [row.label, row.before, row.after]);
    expect(changed).toEqual([
      ['동아리방', '학생회관 312호', '없음'],
      ['전체 활동 중 인원', '120', '130'],
    ]);
  });

  it('신규 등록은 전 값이 없어 모든 항목이 새 값', () => {
    const rows = describeRequestChanges({ type: 'REGISTER', before: null, after: body });
    expect(rows.every((row) => row.changed && row.before === '-')).toBe(true);
    expect(rows.find((row) => row.label === '창립일자')?.after).toBe('모름');
  });

  it('모집 요청은 모집 항목으로 비교', () => {
    const rows = describeRequestChanges({
      type: 'RECRUITMENT',
      before: null,
      after: {
        generation: null,
        alwaysOpen: true,
        startsAt: null,
        endsAt: null,
        closedEarly: false,
        links: [{ label: '오픈채팅', url: 'https://open.kakao.com/o/x' }],
        notice: null,
        requesterContact: 'a@b.c',
        requesterRole: 'STAFF',
      },
    });
    expect(rows.map((row) => row.label)).toEqual(['모집 기수', '모집 기간', '조기 마감', '관련 링크', '모집 안내']);
    expect(rows[1]?.after).toBe('상시모집');
  });
});

describe('numberRequestsByOldest', () => {
  it('화면 순서와 상관없이 먼저 들어온 요청이 1번', () => {
    const numbers = numberRequestsByOldest([
      { id: 9, requestedAt: '2026-11-26T12:00:00+09:00' },
      { id: 3, requestedAt: '2026-11-20T12:00:00+09:00' },
      { id: 5, requestedAt: '2026-11-24T12:00:00+09:00' },
    ]);
    expect([numbers.get(3), numbers.get(5), numbers.get(9)]).toEqual([1, 2, 3]);
  });
});

describe('배너', () => {
  const NOW = new Date('2026-11-26T12:00:00+09:00');

  it('노출 상태: 꺼짐 > 예정 > 종료 > 노출 중', () => {
    expect(getBannerStatus({ active: false, startsAt: null, endsAt: null }, NOW)).toBe('OFF');
    expect(getBannerStatus({ active: true, startsAt: '2026-12-01T00:00:00+09:00', endsAt: null }, NOW)).toBe(
      'SCHEDULED',
    );
    expect(getBannerStatus({ active: true, startsAt: null, endsAt: '2026-11-26T12:00:00+09:00' }, NOW)).toBe('ENDED');
    expect(getBannerStatus({ active: true, startsAt: null, endsAt: null }, NOW)).toBe('LIVE');
  });

  it('링크는 동그리 경로나 https만', () => {
    expect(isValidBannerLink('/clubs?club=3')).toBe(true);
    expect(isValidBannerLink('https://pf.kakao.com/_x/chat')).toBe(true);
    expect(isValidBannerLink('http://pf.kakao.com/_x/chat')).toBe(false);
    expect(isValidBannerLink('//evil.example.com')).toBe(false);
    expect(isValidBannerLink('javascript:alert(1)')).toBe(false);
  });

  it('글자 배너는 제목·링크가 필요하고, 이미지 배너는 PC 이미지가 필요하다', () => {
    const text: TClubBannerForm = {
      ...createBannerForm(null),
      title: '우리 동아리가 없나요?',
      link: '/clubs/register',
    };
    expect(validateBannerForm(text)).toEqual({});
    expect(validateBannerForm({ ...text, title: '' }).title).toBeDefined();
    expect(validateBannerForm({ ...text, link: 'http://x.com' }).link).toBeDefined();
    expect(validateBannerForm({ ...text, mode: 'IMAGE' }).image).toBeDefined();
    expect(
      validateBannerForm({ ...text, startsAt: '2026-12-02T00:00', endsAt: '2026-12-01T00:00' }).period,
    ).toBeDefined();
  });

  it('저장할 때 방식에 맞지 않는 값은 비운다', () => {
    const form: TClubBannerForm = {
      ...createBannerForm(null),
      mode: 'IMAGE',
      eyebrow: 'AD',
      title: '광고 이미지',
      imageUrl: 'blob:pc',
      link: '/clubs',
    };
    const saved = toBannerSave(form);
    expect(saved.eyebrow).toBeNull();
    expect(saved.background).toBeNull();
    expect(saved.imageUrl).toBe('blob:pc');
    expect(saved.mobileImageUrl).toBeNull();
  });
});
