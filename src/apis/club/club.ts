/**
 * [동아리] API
 * UI 확인 단계라 아직 서버를 부르지 않고 모의 데이터(clubMock)를 돌려준다.
 * BE API가 생기면 함수 이름·반환 타입은 그대로 두고 본문만 axiosInstance 호출로 바꾼다.
 * 저장 요청은 메모리에만 반영되어 새로고침하면 처음 상태로 돌아간다.
 */
import {
  addRequest,
  applyClubSave,
  applyRecruitmentSave,
  canCurrentMemberEdit,
  CURRENT_MEMBER,
  findClub,
  store,
  toClubSave,
  toRecruitmentSave,
} from '@/apis/club/clubMockStore';
import { CLUB_LIST_PAGE_SIZE } from '@/constants/club';
import type {
  TClubBanner,
  TClubDetail,
  TClubListParams,
  TClubPage,
  TClubRecruitmentSaveRequest,
  TClubRequest,
  TClubRequesterRole,
  TClubSaveRequest,
  TClubSaveResult,
  TClubSummary,
  TMyClubRequestDetail,
} from '@/types/club/TClub';
import { filterClubs, sortClubs } from '@/utils/club/club';
import { isBannerVisible } from '@/utils/club/clubAdmin';

const delay = () => new Promise((resolve) => setTimeout(resolve, 250));

export const toSummary = (club: TClubDetail): TClubSummary => ({
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

const requester = (body: { requesterContact: string | null; requesterRole: TClubRequesterRole | null }) => ({
  ...CURRENT_MEMBER,
  contact: body.requesterContact ?? '',
  role: body.requesterRole ?? 'OUTSIDER',
});

// 목록 상단 광고 배너. 켜져 있고 노출 기간 안인 배너만 순서대로 받는다.
export const getClubBanners = async (): Promise<TClubBanner[]> => {
  await delay();
  const now = new Date();
  return structuredClone(
    store.banners
      .filter((banner) => isBannerVisible(banner, now))
      .sort((a, b) => a.order - b.order)
      .map(({ id, eyebrow, title, description, imageUrl, mobileImageUrl, background, link }) => ({
        id,
        eyebrow,
        title,
        description,
        imageUrl,
        mobileImageUrl,
        background,
        link,
      })),
  );
};

// 공개 목록(커서 기반, 12개씩). 필터·정렬·찜 범위를 서버가 적용한 뒤 cursor 다음부터 잘라 준다.
// 모의 구현은 커서에 위치(offset)를 문자열로 담는다. 실제 서버는 정렬 키 기반 커서를 쓰고 FE는 값을 그대로 돌려준다.
export const getClubs = async (params: TClubListParams, cursor: string | null): Promise<TClubPage> => {
  await delay();
  const now = new Date();
  const scoped = store.clubs
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

// 상세. 바로 수정 가능 여부는 이 동아리의 직접 수정 권한(승인 이력, 관리자 회수 가능)으로 정한다.
export const getClubDetail = async (clubId: number): Promise<TClubDetail> => {
  await delay();
  return structuredClone({ ...findClub(clubId), canEditDirectly: canCurrentMemberEdit(clubId) });
};

// 내 요청 내역(최신순).
export const getMyClubRequests = async (): Promise<TClubRequest[]> => {
  await delay();
  return structuredClone(
    store.requests
      .filter((request) => request.mine)
      .map(({ id, type, clubId, clubName, status, requestedAt, processedAt, rejectReason }) => ({
        id,
        type,
        clubId,
        clubName,
        status,
        requestedAt,
        processedAt,
        rejectReason,
      })),
  );
};

// 신규 등록 요청. 관리자 승인 후 공개된다.
export const postClub = async (body: TClubSaveRequest): Promise<TClubSaveResult> => {
  await delay();
  addRequest({ type: 'REGISTER', before: null, after: body }, null, body.name, requester(body), true);
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
  if (!canCurrentMemberEdit(clubId)) {
    addRequest({ type: 'EDIT', before: toClubSave(club), after: body }, clubId, club.name, requester(body), true);
    return { applied: 'PENDING', clubId };
  }
  applyClubSave(club, body);
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
  if (!canCurrentMemberEdit(clubId)) {
    addRequest(
      { type: 'RECRUITMENT', before: club.recruitment ? toRecruitmentSave(club.recruitment) : null, after: body },
      clubId,
      club.name,
      requester(body),
      true,
    );
    return { applied: 'PENDING', clubId };
  }
  applyRecruitmentSave(club, body);
  return { applied: 'DIRECT', clubId };
};

const findMyRequest = (requestId: number) => {
  const request = store.requests.find((item) => item.id === requestId && item.mine);
  if (!request) throw new Error('요청을 찾을 수 없어요.');
  return request;
};

// 내 요청 한 건(보냈던 입력값 포함). 반려·검토 중 요청을 고쳐서 다시 보낼 때 불러온다.
export const getMyClubRequestDetail = async (requestId: number): Promise<TMyClubRequestDetail> => {
  await delay();
  const { id, type, clubId, clubName, status, requestedAt, processedAt, rejectReason, after } =
    findMyRequest(requestId);
  return structuredClone({
    id,
    type,
    clubId,
    clubName,
    status,
    requestedAt,
    processedAt,
    rejectReason,
    after,
  } as TMyClubRequestDetail);
};

// 고쳐서 다시 요청. 검토 중이던 요청은 취소되고, 새 요청이 맨 뒤(최신)로 들어간다. 반려된 요청은 그대로 남는다.
export const resubmitMyClubRequest = async ({
  requestId,
  body,
}: {
  requestId: number;
  body: TClubSaveRequest | TClubRecruitmentSaveRequest;
}): Promise<TClubSaveResult> => {
  await delay();
  const previous = findMyRequest(requestId);
  if (previous.status !== 'PENDING' && previous.status !== 'REJECTED')
    throw new Error('검토 중이거나 반려된 요청만 다시 보낼 수 있어요.');
  if (previous.status === 'PENDING') {
    previous.status = 'CANCELED';
    previous.processedAt = new Date().toISOString();
  }
  const { clubId } = previous;
  if (previous.type === 'RECRUITMENT') {
    const club = findClub(clubId as number);
    const after = body as TClubRecruitmentSaveRequest;
    addRequest(
      { type: 'RECRUITMENT', before: club.recruitment ? toRecruitmentSave(club.recruitment) : null, after },
      clubId,
      club.name,
      requester(after),
      true,
    );
  } else {
    const after = body as TClubSaveRequest;
    const before = previous.type === 'EDIT' ? toClubSave(findClub(clubId as number)) : null;
    addRequest({ type: previous.type, before, after }, clubId, after.name, requester(after), true);
  }
  return { applied: 'PENDING', clubId };
};
