import { describe, expect, it } from 'vitest';

import type { TClubForm, TClubRecruitmentForm } from '@/types/club/TClubForm';
import {
  createEmptyClubForm,
  createRecruitmentForm,
  isClubFormComplete,
  isRecruitmentFormComplete,
  toClubSaveRequest,
  toRecruitmentSaveRequest,
  validateClubForm,
  validateRecruitmentForm,
} from '@/utils/club/clubForm';

const filledForm = (patch: Partial<TClubForm> = {}): TClubForm => ({
  ...createEmptyClubForm(),
  name: '소리마루',
  affiliation: 'CENTRAL',
  fields: ['PERFORMANCE'],
  description: '밴드 동아리예요. '.repeat(12),
  foundedDate: '1987-03-02',
  generation: '24',
  activityStartDate: '2026-03-01',
  activityEndDate: '2027-02-28',
  roomLocation: '학생회관 312호',
  contact: 'club@dgu.ac.kr',
  consent: true,
  ...patch,
});

describe('isClubFormComplete', () => {
  it('필수 칸을 다 채우면 제출할 수 있다', () => {
    expect(isClubFormComplete(filledForm(), true)).toBe(true);
  });

  it('소개는 100자 이상이어야 한다', () => {
    expect(isClubFormComplete(filledForm({ description: '짧은 소개' }), true)).toBe(false);
    expect(validateClubForm(filledForm({ description: '짧은 소개' }), true).description).toBeDefined();
  });

  it('창립일은 날짜를 쓰거나 모르겠어요를 체크해야 한다', () => {
    expect(isClubFormComplete(filledForm({ foundedDate: '' }), true)).toBe(false);
    const unknown = filledForm({ foundedDate: '', foundedUnknown: true });
    expect(isClubFormComplete(unknown, true)).toBe(true);
    expect(toClubSaveRequest(unknown, true).foundedDate).toBeNull();
  });

  it('동아리방은 위치를 쓰거나 없음을 체크해야 한다', () => {
    expect(isClubFormComplete(filledForm({ roomLocation: ' ' }), true)).toBe(false);
    expect(isClubFormComplete(filledForm({ roomLocation: '', noRoom: true }), true)).toBe(true);
  });

  it('승인이 필요할 때만 연락처와 동의를 요구한다', () => {
    const form = filledForm({ contact: '', consent: false });
    expect(isClubFormComplete(form, true)).toBe(false);
    expect(isClubFormComplete(form, false)).toBe(true);
  });

  it('기수제가 아니면 기수·활동 기간 없이도 제출할 수 있다', () => {
    const form = filledForm({ generation: '', activityStartDate: '', activityEndDate: '' });
    expect(isClubFormComplete(form, true)).toBe(false);
    expect(isClubFormComplete({ ...form, hasGeneration: false }, true)).toBe(true);
  });
});

describe('validateClubForm·toClubSaveRequest', () => {
  it('인원은 숫자만 받는다', () => {
    expect(validateClubForm(filledForm({ totalMemberCount: '많음' }), true).memberCount).toBeDefined();
    expect(validateClubForm(filledForm({ generationMemberCount: '15', totalMemberCount: '120' }), true)).toEqual({});
  });

  it('동아리방 없음은 null, 인원은 숫자로 보낸다', () => {
    const body = toClubSaveRequest(
      filledForm({ noRoom: true, roomLocation: '이전 입력', generationMemberCount: '15', totalMemberCount: '' }),
      true,
    );
    expect(body.roomLocation).toBeNull();
    expect(body.generationMemberCount).toBe(15);
    expect(body.totalMemberCount).toBeNull();
  });
});

describe('isRecruitmentFormComplete', () => {
  const base = (patch: Partial<TClubRecruitmentForm>): TClubRecruitmentForm => ({
    ...createRecruitmentForm(null, 24),
    contact: '010-1234-5678',
    consent: true,
    ...patch,
  });

  it('기간 모집은 시작·마감 일시가 있어야 한다', () => {
    expect(isRecruitmentFormComplete(base({}), true)).toBe(false);
    expect(isRecruitmentFormComplete(base({ startsAt: '2026-03-01T00:00', endsAt: '2026-03-10T23:59' }), true)).toBe(
      true,
    );
  });

  it('상시모집은 기간 없이 제출할 수 있다', () => {
    expect(isRecruitmentFormComplete(base({ alwaysOpen: true }), true)).toBe(true);
    expect(isRecruitmentFormComplete(base({ alwaysOpen: true, consent: false }), true)).toBe(false);
  });
});

describe('모집 관련 링크', () => {
  const form = (links: TClubRecruitmentForm['links']): TClubRecruitmentForm => ({
    ...createRecruitmentForm(null, 24),
    alwaysOpen: true,
    links,
  });

  it('입력한 링크는 이름 1~10자와 https 주소가 모두 있어야 한다', () => {
    const errorOf = (label: string, url: string) =>
      validateRecruitmentForm(form([{ key: 'a', label, url }]), false).links;
    expect(errorOf('인스타그램', 'http://insta')).toBeDefined();
    expect(errorOf('', 'https://insta.com/x')).toBeDefined();
    expect(errorOf('가'.repeat(11), 'https://insta.com/x')).toBeDefined();
    expect(errorOf('지원폼', '')).toBeDefined();
    expect(errorOf('공식 홈페이지', 'https://club.example.com')).toBeUndefined();
  });

  it('이름·주소를 모두 비운 행은 저장하지 않고 앞뒤 공백은 지운다', () => {
    const body = toRecruitmentSaveRequest(
      form([
        { key: 'a', label: ' 지원폼 ', url: ' https://forms.gle/x ' },
        { key: 'b', label: '', url: ' ' },
      ]),
      false,
    );
    expect(body.links).toEqual([{ label: '지원폼', url: 'https://forms.gle/x' }]);
  });
});

describe('동아리 관련 링크', () => {
  it('등록·수정 요청에도 직접 입력한 이름으로 링크를 담는다', () => {
    const body = toClubSaveRequest(
      filledForm({ links: [{ key: 'a', label: '인스타그램', url: 'https://instagram.com/club' }] }),
      true,
    );
    expect(body.links).toEqual([{ label: '인스타그램', url: 'https://instagram.com/club' }]);
  });

  it('https가 아닌 동아리 링크는 막는다', () => {
    expect(
      validateClubForm(filledForm({ links: [{ key: 'a', label: '홈페이지', url: 'http://x.com' }] }), true).links,
    ).toBeDefined();
  });
});
