/**
 * [관리자 > 동아리 관리] 요청 변경 비교·배너 노출 상태·배너 폼 변환과 검증
 */
import {
  CLUB_AFFILIATION_LABELS,
  CLUB_BANNER_BACKGROUNDS,
  CLUB_BANNER_LIMITS,
  CLUB_FIELD_LABELS,
} from '@/constants/club';
import type { TClubLink, TClubRecruitmentSaveRequest, TClubSaveValue } from '@/types/club/TClub';
import type {
  TAdminBannerStatus,
  TAdminClubBanner,
  TAdminClubBannerSave,
  TAdminClubRequest,
  TClubBannerForm,
  TClubBannerFormErrors,
} from '@/types/club/TClubAdmin';
import { formatClubDate, isValidHttpsUrl } from '@/utils/club/club';
import { toDateTimeLocal } from '@/utils/club/clubForm';
import { formatDateTime } from '@/utils/date';

// ── 요청 변경 비교 ──

export type TChangeRow = { label: string; before: string; after: string; changed: boolean };

const EMPTY = '-';
const text = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === '' ? EMPTY : String(value);
const linksText = (links: TClubLink[]) =>
  links.length === 0 ? EMPTY : links.map((link) => `${link.label} ${link.url}`).join('\n');

const clubRows = (body: TClubSaveValue): [string, string][] => [
  ['동아리 이름', body.name],
  ['소속 분류', CLUB_AFFILIATION_LABELS[body.affiliation]],
  ['활동 분야', body.fields.map((field) => CLUB_FIELD_LABELS[field]).join(', ')],
  ['동아리 소개', body.description],
  ['창립일자', body.foundedDate ? formatClubDate(body.foundedDate) : '모름'],
  [
    '활동 기간',
    body.generation === null
      ? '기수 없이 활동'
      : `${body.generation}기 / ${formatClubDate(body.activityStartDate)} ~ ${formatClubDate(body.activityEndDate)}`,
  ],
  ['동아리방', body.roomLocation ?? '없음'],
  ['한 기수 선발 인원', text(body.generationMemberCount)],
  ['전체 활동 중 인원', text(body.totalMemberCount)],
  [
    '운영진',
    body.officers.length === 0
      ? EMPTY
      : body.officers
          .map((officer) => `${officer.role} ${officer.name}${officer.department ? ` (${officer.department})` : ''}`)
          .join('\n'),
  ],
  ['관련 링크', linksText(body.links)],
  ['사진', `${body.images.length}장`],
];

const recruitmentRows = (body: TClubRecruitmentSaveRequest): [string, string][] => [
  ['모집 기수', body.generation === null ? EMPTY : `${body.generation}기`],
  [
    '모집 기간',
    body.alwaysOpen ? '상시모집' : `${formatDateTime(body.startsAt ?? '')} ~ ${formatDateTime(body.endsAt ?? '')}`,
  ],
  ['조기 마감', body.closedEarly ? '마감' : EMPTY],
  ['관련 링크', linksText(body.links)],
  ['모집 안내', text(body.notice)],
];

// 바꾸기 전·요청 값을 같은 항목끼리 나란히 놓는다. 신규 등록·첫 모집은 전 값이 없어 모든 항목을 바뀐 것으로 본다.
export const describeRequestChanges = (request: Pick<TAdminClubRequest, 'type' | 'before' | 'after'>): TChangeRow[] => {
  const toRows = (body: TClubSaveValue | TClubRecruitmentSaveRequest) =>
    request.type === 'RECRUITMENT'
      ? recruitmentRows(body as TClubRecruitmentSaveRequest)
      : clubRows(body as TClubSaveValue);
  const after = toRows(request.after);
  const before = request.before ? toRows(request.before) : null;
  return after.map(([label, value], index) => {
    const previous = before ? (before[index]?.[1] ?? EMPTY) : EMPTY;
    return { label, before: previous, after: value, changed: before === null || previous !== value };
  });
};

// 목록 No: 먼저 들어온 요청이 1번. 화면 정렬(최신순 등)과 상관없이 요청 시각으로 매긴다.
export const numberRequestsByOldest = (requests: Pick<TAdminClubRequest, 'id' | 'requestedAt'>[]) =>
  new Map(
    [...requests]
      .sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime() || a.id - b.id)
      .map(({ id }, index) => [id, index + 1]),
  );

// ── 배너 ──

export const getBannerStatus = (
  banner: Pick<TAdminClubBanner, 'active' | 'startsAt' | 'endsAt'>,
  now: Date,
): TAdminBannerStatus => {
  if (!banner.active) return 'OFF';
  if (banner.startsAt && now.getTime() < new Date(banner.startsAt).getTime()) return 'SCHEDULED';
  if (banner.endsAt && now.getTime() >= new Date(banner.endsAt).getTime()) return 'ENDED';
  return 'LIVE';
};

export const isBannerVisible = (banner: Pick<TAdminClubBanner, 'active' | 'startsAt' | 'endsAt'>, now: Date) =>
  getBannerStatus(banner, now) === 'LIVE';

// 배너 링크: 동그리 안 경로('/'로 시작, '//' 제외) 또는 https 외부 주소.
export const isValidBannerLink = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  return isValidHttpsUrl(trimmed);
};

const DEFAULT_BACKGROUND = CLUB_BANNER_BACKGROUNDS[0]?.value ?? '';

export const createBannerForm = (banner: TAdminClubBanner | null): TClubBannerForm => ({
  mode: banner?.imageUrl ? 'IMAGE' : 'TEXT',
  eyebrow: banner?.eyebrow ?? '',
  title: banner?.title ?? '',
  description: banner?.description ?? '',
  background: banner?.background ?? DEFAULT_BACKGROUND,
  imageUrl: banner?.imageUrl ?? '',
  mobileImageUrl: banner?.mobileImageUrl ?? '',
  link: banner?.link ?? '',
  startsAt: toDateTimeLocal(banner?.startsAt ?? null),
  endsAt: toDateTimeLocal(banner?.endsAt ?? null),
  active: banner?.active ?? true,
});

export const validateBannerForm = (form: TClubBannerForm): TClubBannerFormErrors => {
  const errors: TClubBannerFormErrors = {};
  const title = form.title.trim();
  if (!title)
    errors.title = form.mode === 'TEXT' ? '배너 제목을 입력해주세요.' : '이미지 설명(대체 텍스트)을 입력해주세요.';
  else if (title.length > CLUB_BANNER_LIMITS.TITLE_MAX)
    errors.title = `${CLUB_BANNER_LIMITS.TITLE_MAX}자 이내로 입력해주세요.`;
  if (form.mode === 'TEXT') {
    if (form.eyebrow.trim().length > CLUB_BANNER_LIMITS.EYEBROW_MAX)
      errors.eyebrow = `${CLUB_BANNER_LIMITS.EYEBROW_MAX}자 이내로 입력해주세요.`;
    if (form.description.trim().length > CLUB_BANNER_LIMITS.DESCRIPTION_MAX)
      errors.description = `${CLUB_BANNER_LIMITS.DESCRIPTION_MAX}자 이내로 입력해주세요.`;
  } else if (!form.imageUrl) errors.image = 'PC 배너 이미지를 올려주세요.';
  if (!isValidBannerLink(form.link)) errors.link = '/로 시작하는 동그리 경로나 https:// 주소를 입력해주세요.';
  if (form.startsAt && form.endsAt && form.startsAt >= form.endsAt) errors.period = '노출 종료는 시작 이후여야 해요.';
  return errors;
};

const optional = (value: string) => value.trim() || null;
const fromLocal = (value: string) => (value ? new Date(value).toISOString() : null);

export const toBannerSave = (form: TClubBannerForm): TAdminClubBannerSave => {
  const isText = form.mode === 'TEXT';
  return {
    title: form.title.trim(),
    eyebrow: isText ? optional(form.eyebrow) : null,
    description: isText ? optional(form.description) : null,
    background: isText ? form.background : null,
    imageUrl: isText ? null : form.imageUrl,
    mobileImageUrl: isText ? null : optional(form.mobileImageUrl),
    link: form.link.trim(),
    startsAt: fromLocal(form.startsAt),
    endsAt: fromLocal(form.endsAt),
    active: form.active,
  };
};

export const formatBannerPeriod = (banner: Pick<TAdminClubBanner, 'startsAt' | 'endsAt'>) => {
  if (!banner.startsAt && !banner.endsAt) return '기간 제한 없음';
  return `${banner.startsAt ? formatDateTime(banner.startsAt) : '바로'} ~ ${banner.endsAt ? formatDateTime(banner.endsAt) : '계속'}`;
};
