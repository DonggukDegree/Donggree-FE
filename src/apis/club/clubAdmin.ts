/**
 * [관리자 > 동아리 관리] API
 * 공개 API와 같은 모의 저장소(clubMockStore)를 바꾸므로, 승인·임시 등록·배너 저장이 공개 화면에도 바로 보인다.
 * BE API가 생기면 함수 이름·반환 타입은 그대로 두고 본문만 axiosInstance 호출로 바꾼다.
 */
import { toSummary } from '@/apis/club/club';
import {
  addEditor,
  applyClubSave,
  applyRecruitmentSave,
  createClub,
  findClub,
  getEditors,
  issueId,
  store,
} from '@/apis/club/clubMockStore';
import type { TClubRecruitmentSaveRequest, TClubRequestStatus, TClubSaveRequest } from '@/types/club/TClub';
import type { TAdminClub, TAdminClubBanner, TAdminClubBannerSave, TAdminClubRequest } from '@/types/club/TClubAdmin';

const delay = () => new Promise((resolve) => setTimeout(resolve, 250));

const findRequest = (requestId: number) => {
  const request = store.requests.find(({ id }) => id === requestId);
  if (!request) throw new Error('요청을 찾을 수 없어요.');
  if (request.status !== 'PENDING') throw new Error('이미 처리된 요청이에요.');
  return request;
};

// 요청 목록. 검토 중은 먼저 들어온 순(대기 순서, 다시 보낸 요청은 맨 뒤), 나머지는 최신순. status가 null이면 전체(최신순).
export const getAdminClubRequests = async (status: TClubRequestStatus | null): Promise<TAdminClubRequest[]> => {
  await delay();
  const direction = status === 'PENDING' ? 1 : -1;
  return structuredClone(
    store.requests
      .filter((request) => status === null || request.status === status)
      .sort((a, b) => direction * (new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()))
      .map(({ mine: _mine, ...request }) => request),
  );
};

// 승인: 신규 등록은 정식 동아리로 공개, 수정·모집은 바로 반영(임시 등록 동아리는 정식으로 전환).
// 요청자에게는 이 동아리의 직접 수정 권한이 생긴다.
export const approveAdminClubRequest = async (requestId: number): Promise<void> => {
  await delay();
  const request = findRequest(requestId);
  const member = { memberId: request.requester.memberId, name: request.requester.name };
  if (request.type === 'REGISTER') {
    const club = createClub(request.after as TClubSaveRequest, 'OFFICIAL');
    request.clubId = club.id;
    addEditor(club.id, member);
  } else {
    const club = findClub(request.clubId as number);
    if (request.type === 'EDIT') applyClubSave(club, request.after as TClubSaveRequest);
    else applyRecruitmentSave(club, request.after as TClubRecruitmentSaveRequest);
    if (club.registration === 'PROVISIONAL') {
      club.registration = 'OFFICIAL';
      club.firstRegistrationRewardAvailable = false;
    }
    addEditor(club.id, member);
  }
  request.status = 'APPROVED';
  request.processedAt = new Date().toISOString();
};

export const rejectAdminClubRequest = async ({
  requestId,
  reason,
}: {
  requestId: number;
  reason: string;
}): Promise<void> => {
  await delay();
  const request = findRequest(requestId);
  request.status = 'REJECTED';
  request.rejectReason = reason;
  request.processedAt = new Date().toISOString();
};

// 동아리 목록(먼저 등록된 순 = ID 오름차순). keyword는 이름에 포함된 동아리만.
export const getAdminClubs = async (keyword: string): Promise<TAdminClub[]> => {
  await delay();
  const query = keyword.trim();
  return structuredClone(
    store.clubs
      .filter((club) => !query || club.name.includes(query))
      .sort((a, b) => a.id - b.id)
      .map((club) => ({ ...toSummary(club), editors: getEditors(club.id), updatedAt: club.updatedAt })),
  );
};

export const revokeAdminClubEditor = async ({ clubId, memberId }: { clubId: number; memberId: number }) => {
  await delay();
  store.editors.set(
    clubId,
    getEditors(clubId).filter((editor) => editor.memberId !== memberId),
  );
};

// 관리자 임시 등록. 회원 요청이 승인되면 정식 등록으로 바뀌고 처음 승인받은 회원이 최초 등록 포인트를 받는다.
export const createAdminClub = async (body: TClubSaveRequest): Promise<{ clubId: number }> => {
  await delay();
  return { clubId: createClub(body, 'PROVISIONAL').id };
};

export const updateAdminClub = async ({ clubId, body }: { clubId: number; body: TClubSaveRequest }) => {
  await delay();
  applyClubSave(findClub(clubId), body);
  return { clubId };
};

// 배너(노출 순서대로)
export const getAdminClubBanners = async (): Promise<TAdminClubBanner[]> => {
  await delay();
  return structuredClone([...store.banners].sort((a, b) => a.order - b.order));
};

export const saveAdminClubBanner = async ({
  bannerId,
  body,
}: {
  bannerId: number | null;
  body: TAdminClubBannerSave;
}): Promise<void> => {
  await delay();
  if (bannerId === null) {
    const order = Math.max(0, ...store.banners.map((banner) => banner.order)) + 1;
    store.banners.push({ ...body, id: issueId(), order });
    return;
  }
  const banner = store.banners.find(({ id }) => id === bannerId);
  if (!banner) throw new Error('배너를 찾을 수 없어요.');
  Object.assign(banner, body);
};

export const deleteAdminClubBanner = async (bannerId: number): Promise<void> => {
  await delay();
  store.banners = store.banners.filter(({ id }) => id !== bannerId);
};

// 노출 순서를 한 칸 앞(-1)·뒤(+1)로.
export const moveAdminClubBanner = async ({ bannerId, offset }: { bannerId: number; offset: -1 | 1 }) => {
  await delay();
  const ordered = [...store.banners].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex(({ id }) => id === bannerId);
  const target = ordered[index + offset];
  const current = ordered[index];
  if (!current || !target) return;
  [current.order, target.order] = [target.order, current.order];
};
