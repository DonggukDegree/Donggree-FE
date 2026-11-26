/**
 * [동아리] 모집 상태 계산·목록 필터·정렬·입력 검증 순수 함수
 * 필터·정렬 규칙은 서버(현재는 모의 API)가 목록에 적용하는 기준과 같다. 화면은 커서 기반으로 12개씩 받는다.
 */
import type {
  TClubFilters,
  TClubRecruitment,
  TClubRecruitmentStatus,
  TClubSort,
  TClubSummary,
} from '@/types/club/TClub';

// 시작 포함·마감 제외. 조기 마감은 기간보다 우선하고, 상시모집은 기간 없이 열려 있다.
export const getRecruitmentStatus = (recruitment: TClubRecruitment | null, now: Date): TClubRecruitmentStatus => {
  if (!recruitment) return 'BEFORE';
  if (recruitment.closedEarly) return 'CLOSED';
  if (recruitment.alwaysOpen) return 'OPEN';
  const startsAt = recruitment.startsAt ? new Date(recruitment.startsAt).getTime() : null;
  const endsAt = recruitment.endsAt ? new Date(recruitment.endsAt).getTime() : null;
  const current = now.getTime();
  if (startsAt !== null && current < startsAt) return 'BEFORE';
  if (endsAt !== null && current >= endsAt) return 'CLOSED';
  return 'OPEN';
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const DAY = 24 * 60 * 60 * 1000;

// 카드·상세의 짧은 모집 표시. 기간 모집 중이면 '마감 D-n'처럼 마감까지 남은 날짜만 보여준다.
export const getRecruitmentBadge = (recruitment: TClubRecruitment | null, now: Date): string => {
  const status = getRecruitmentStatus(recruitment, now);
  if (status === 'CLOSED') return '모집 마감';
  if (status === 'BEFORE') return '모집 전';
  if (recruitment?.alwaysOpen) return '상시모집';
  if (!recruitment?.endsAt) return '모집 중';
  const days = Math.round((startOfDay(new Date(recruitment.endsAt)) - startOfDay(now)) / DAY);
  return days <= 0 ? '마감 D-DAY' : `마감 D-${days}`;
};

// 배지·안내 박스 색 구분. 모집 중 중에서도 상시모집은 따로 본다.
export type TRecruitmentTone = 'OPEN' | 'ALWAYS' | 'BEFORE' | 'CLOSED';

export const getRecruitmentTone = (recruitment: TClubRecruitment | null, now: Date): TRecruitmentTone => {
  const status = getRecruitmentStatus(recruitment, now);
  if (status === 'OPEN' && recruitment?.alwaysOpen) return 'ALWAYS';
  return status;
};

// 상세 모집 정보 탭의 상태 안내 문장
export const getRecruitmentStatusLabel = (recruitment: TClubRecruitment | null, now: Date): string => {
  const tone = getRecruitmentTone(recruitment, now);
  if (tone === 'OPEN') return `현재 모집 중🏃 ${getRecruitmentBadge(recruitment, now)}`;
  if (tone === 'ALWAYS') return '현재 모집 중🏃 상시모집';
  if (tone === 'CLOSED') return '모집이 마감되었어요.';
  // 모집 정보가 아직 없으면 기본값은 모집 전.
  return recruitment ? '모집 시작 전이에요.' : '모집 전이에요.';
};

// 필터 종류끼리는 교집합, 같은 필터 안에서는 하나라도 해당하면 통과. 아무것도 고르지 않은 필터는 전체.
export const filterClubs = (clubs: TClubSummary[], filters: TClubFilters, now: Date): TClubSummary[] =>
  clubs.filter((club) => {
    if (filters.affiliations.length > 0 && !filters.affiliations.includes(club.affiliation)) return false;
    if (filters.fields.length > 0 && !club.fields.some((field) => filters.fields.includes(field))) return false;
    if (
      filters.recruitmentStatuses.length > 0 &&
      !filters.recruitmentStatuses.includes(getRecruitmentStatus(club.recruitment, now))
    )
      return false;
    return true;
  });

const byName = (a: TClubSummary, b: TClubSummary) => a.name.localeCompare(b.name, 'ko');

// 마감 임박순: 기간 모집 중(마감 빠른 순) → 상시모집 → 나머지(이름순).
const deadlineRank = (club: TClubSummary, now: Date): [number, number] => {
  if (getRecruitmentStatus(club.recruitment, now) !== 'OPEN') return [2, 0];
  if (club.recruitment?.alwaysOpen || !club.recruitment?.endsAt) return [1, 0];
  return [0, new Date(club.recruitment.endsAt).getTime()];
};

// 값이 없는 동아리(인원 미입력·창립일 모름)는 정렬 방향과 관계없이 맨 뒤, 같은 값끼리는 이름순.
const compareNullableLast = (a: number | null, b: number | null) => {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
};
const foundedTime = (club: TClubSummary) => (club.foundedDate ? new Date(club.foundedDate).getTime() : null);
const negativeMembers = (club: TClubSummary) => (club.totalMemberCount === null ? null : -club.totalMemberCount);

export const sortClubs = (clubs: TClubSummary[], sort: TClubSort, now: Date): TClubSummary[] => {
  const sorted = [...clubs];
  if (sort === 'NAME') return sorted.sort(byName);
  if (sort === 'MEMBERS')
    return sorted.sort((a, b) => compareNullableLast(negativeMembers(a), negativeMembers(b)) || byName(a, b));
  if (sort === 'OLDEST')
    return sorted.sort((a, b) => compareNullableLast(foundedTime(a), foundedTime(b)) || byName(a, b));
  return sorted.sort((a, b) => {
    const [rankA, timeA] = deadlineRank(a, now);
    const [rankB, timeB] = deadlineRank(b, now);
    if (rankA !== rankB) return rankA - rankB;
    if (timeA !== timeB) return timeA - timeB;
    return byName(a, b);
  });
};

export const countActiveFilters = (filters: TClubFilters) =>
  filters.affiliations.length + filters.fields.length + filters.recruitmentStatuses.length;

export const EMPTY_CLUB_FILTERS: TClubFilters = { affiliations: [], fields: [], recruitmentStatuses: [] };

// 지원 링크는 https만 받는다. javascript: 등 다른 스킴과 형식이 깨진 주소를 막는다.
export const isValidHttpsUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

// 요청자 확인 연락처: 이메일 또는 전화번호.
export const isValidContact = (value: string) => {
  const trimmed = value.trim();
  return EMAIL_PATTERN.test(trimmed) || PHONE_PATTERN.test(trimmed);
};

// 'YYYY-MM-DD' → 'YYYY.MM.DD'
export const formatClubDate = (value: string | null) => (value ? value.slice(0, 10).replaceAll('-', '.') : '');

// 주소창 ?club=ID 해석. 양의 정수가 아니면 null.
export const parseClubIdParam = (value: string | null): number | null => {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
