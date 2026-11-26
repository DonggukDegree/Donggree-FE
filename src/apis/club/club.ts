/**
 * [동아리] API
 * UI 확인 단계라 아직 서버를 부르지 않고 모의 데이터(clubMock)를 돌려준다.
 * BE API가 생기면 함수 이름·반환 타입은 그대로 두고 본문만 axiosInstance 호출로 바꾼다.
 * 저장 요청은 메모리에만 반영되어 새로고침하면 처음 상태로 돌아간다.
 */
import { MOCK_CLUB_BANNERS, MOCK_CLUB_REQUESTS, MOCK_CLUBS } from '@/apis/club/clubMock';
import { CLUB_LIST_PAGE_SIZE } from '@/constants/club';
import type {
  TClubBanner,
  TClubDetail,
  TClubListParams,
  TClubPage,
  TClubRecruitmentSaveRequest,
  TClubRequest,
  TClubRequestType,
  TClubSaveRequest,
  TClubSaveResult,
  TClubSummary,
} from '@/types/club/TClub';
import { filterClubs, getRecruitmentStatus, sortClubs } from '@/utils/club/club';

const clubs: TClubDetail[] = structuredClone(MOCK_CLUBS);
const requests: TClubRequest[] = structuredClone(MOCK_CLUB_REQUESTS);
let nextId = 1000;

const delay = () => new Promise((resolve) => setTimeout(resolve, 250));

const toSummary = (club: TClubDetail): TClubSummary => ({
  id: club.id,
  name: club.name,
  affiliation: club.affiliation,
  fields: club.fields,
  registration: club.registration,
  activityConfirmed: club.activityConfirmed,
  // 대표 사진을 맨 앞에 두고 나머지는 등록 순서대로.
  imageUrls: [...club.images]
    .sort((a, b) => Number(b.id === club.representativeImageId) - Number(a.id === club.representativeImageId))
    .map((image) => image.url),
  totalMemberCount: club.totalMemberCount,
  foundedDate: club.foundedDate,
  recruitment: club.recruitment,
});

const findClub = (clubId: number) => {
  const club = clubs.find(({ id }) => id === clubId);
  if (!club) throw new Error('동아리를 찾을 수 없어요.');
  return club;
};

const addRequest = (type: TClubRequestType, clubId: number | null, clubName: string) => {
  requests.unshift({
    id: ++nextId,
    type,
    clubId,
    clubName,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
    processedAt: null,
    rejectReason: null,
  });
};

// 목록 상단 광고 배너. 노출 순서대로 받는다.
export const getClubBanners = async (): Promise<TClubBanner[]> => {
  await delay();
  return structuredClone(MOCK_CLUB_BANNERS);
};

// 공개 목록(커서 기반, 12개씩). 필터·정렬·찜 범위를 서버가 적용한 뒤 cursor 다음부터 잘라 준다.
// 모의 구현은 커서에 위치(offset)를 문자열로 담는다. 실제 서버는 정렬 키 기반 커서를 쓰고 FE는 값을 그대로 돌려준다.
export const getClubs = async (params: TClubListParams, cursor: string | null): Promise<TClubPage> => {
  await delay();
  const now = new Date();
  const scoped = clubs
    .filter((club) => params.favoriteIds === null || params.favoriteIds.includes(club.id))
    .map(toSummary);
  const list = sortClubs(filterClubs(scoped, params.filters, now), params.sort, now);
  const offset = cursor ? Number(cursor) : 0;
  const end = offset + CLUB_LIST_PAGE_SIZE;
  return {
    clubs: list.slice(offset, end),
    nextCursor: end < list.length ? String(end) : null,
    totalCount: list.length,
  };
};

export const getClubDetail = async (clubId: number): Promise<TClubDetail> => {
  await delay();
  return structuredClone(findClub(clubId));
};

// 내 요청 내역(최신순).
export const getMyClubRequests = async (): Promise<TClubRequest[]> => {
  await delay();
  return structuredClone(requests);
};

// 신규 등록 요청. 관리자 승인 후 공개된다.
export const postClub = async (body: TClubSaveRequest): Promise<TClubSaveResult> => {
  await delay();
  addRequest('REGISTER', null, body.name);
  return { applied: 'PENDING', clubId: null };
};

// 정보 수정. 이 동아리에 승인된 요청이 있는 회원이면 바로 반영, 아니면 승인 요청.
export const putClub = async ({
  clubId,
  body,
}: {
  clubId: number;
  body: TClubSaveRequest;
}): Promise<TClubSaveResult> => {
  await delay();
  const club = findClub(clubId);
  if (!club.canEditDirectly) {
    addRequest('EDIT', clubId, club.name);
    return { applied: 'PENDING', clubId };
  }
  Object.assign(club, {
    name: body.name,
    affiliation: body.affiliation,
    fields: body.fields,
    description: body.description,
    generation: body.generation,
    activityStartDate: body.activityStartDate,
    activityEndDate: body.activityEndDate,
    roomLocation: body.roomLocation,
    generationMemberCount: body.generationMemberCount,
    totalMemberCount: body.totalMemberCount,
    foundedDate: body.foundedDate,
    officers: body.officers,
    links: body.links,
    updatedAt: new Date().toISOString(),
  });
  return { applied: 'DIRECT', clubId };
};

// 모집 등록·수정. 권한 규칙은 정보 수정과 같다.
export const putClubRecruitment = async ({
  clubId,
  body,
}: {
  clubId: number;
  body: TClubRecruitmentSaveRequest;
}): Promise<TClubSaveResult> => {
  await delay();
  const club = findClub(clubId);
  if (!club.canEditDirectly) {
    addRequest('RECRUITMENT', clubId, club.name);
    return { applied: 'PENDING', clubId };
  }
  const current = club.recruitment && getRecruitmentStatus(club.recruitment, new Date()) !== 'CLOSED';
  club.recruitment = {
    id: current && club.recruitment ? club.recruitment.id : ++nextId,
    generation: body.generation,
    alwaysOpen: body.alwaysOpen,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    closedEarly: body.closedEarly,
    links: body.links,
    notice: body.notice,
  };
  return { applied: 'DIRECT', clubId };
};
