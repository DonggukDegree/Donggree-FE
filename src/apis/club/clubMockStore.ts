/**
 * [동아리] 모의 데이터 저장소
 * 공개 API(club.ts)와 관리자 API(clubAdmin.ts)가 같은 메모리 데이터를 함께 쓴다.
 * 관리자가 승인하면 공개 화면에도 바로 반영되고, 새로고침하면 처음 상태로 돌아간다. BE API가 생기면 이 파일은 없앤다.
 */
import { at, MOCK_CLUB_BANNERS, MOCK_CLUBS } from '@/apis/club/clubMock';
import type {
  TClubDetail,
  TClubRecruitment,
  TClubRecruitmentSaveRequest,
  TClubRequestType,
  TClubSaveRequest,
} from '@/types/club/TClub';
import type { TAdminClubEditor, TAdminClubRequest, TAdminClubRequester } from '@/types/club/TClubAdmin';
import { getRecruitmentStatus } from '@/utils/club/club';

// 지금 로그인한 회원(모의). 내 요청 내역과 바로 수정 권한 판단에 쓴다.
export const CURRENT_MEMBER = { memberId: 1, name: '김동글' };

type TMockRequest = TAdminClubRequest & { mine: boolean };

export const store = {
  clubs: structuredClone(MOCK_CLUBS) as TClubDetail[],
  editors: new Map<number, TAdminClubEditor[]>(),
  requests: [] as TMockRequest[],
  banners: structuredClone(MOCK_CLUB_BANNERS),
  nextId: 1000,
};

export const issueId = () => ++store.nextId;

export const findClub = (clubId: number) => {
  const club = store.clubs.find(({ id }) => id === clubId);
  if (!club) throw new Error('동아리를 찾을 수 없어요.');
  return club;
};

export const getEditors = (clubId: number) => store.editors.get(clubId) ?? [];
export const canCurrentMemberEdit = (clubId: number) =>
  getEditors(clubId).some((editor) => editor.memberId === CURRENT_MEMBER.memberId);

export const addEditor = (clubId: number, member: { memberId: number; name: string }) => {
  const editors = getEditors(clubId);
  if (editors.some((editor) => editor.memberId === member.memberId)) return;
  store.editors.set(clubId, [...editors, { ...member, grantedAt: new Date().toISOString() }]);
};

export const toClubSave = (club: TClubDetail): TClubSaveRequest => ({
  name: club.name,
  affiliation: club.affiliation,
  fields: [...club.fields],
  description: club.description,
  generation: club.generation,
  activityStartDate: club.activityStartDate,
  activityEndDate: club.activityEndDate,
  roomLocation: club.roomLocation,
  generationMemberCount: club.generationMemberCount,
  totalMemberCount: club.totalMemberCount,
  foundedDate: club.foundedDate,
  officers: structuredClone(club.officers),
  links: structuredClone(club.links),
  imageCount: club.images.length,
  requesterContact: null,
  requesterRole: null,
});

export const toRecruitmentSave = (recruitment: TClubRecruitment): TClubRecruitmentSaveRequest => ({
  generation: recruitment.generation,
  alwaysOpen: recruitment.alwaysOpen,
  startsAt: recruitment.startsAt,
  endsAt: recruitment.endsAt,
  closedEarly: recruitment.closedEarly,
  links: structuredClone(recruitment.links),
  notice: recruitment.notice,
  requesterContact: null,
  requesterRole: null,
});

export const applyClubSave = (club: TClubDetail, body: TClubSaveRequest) => {
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
};

// 진행 중·예정 모집은 고쳐 쓰고, 마감된 모집 뒤에 올리면 새 모집 건으로 둔다.
export const applyRecruitmentSave = (club: TClubDetail, body: TClubRecruitmentSaveRequest) => {
  const ongoing = club.recruitment && getRecruitmentStatus(club.recruitment, new Date()) !== 'CLOSED';
  if (club.recruitment && !ongoing) club.previousRecruitment = club.recruitment;
  club.recruitment = {
    id: ongoing && club.recruitment ? club.recruitment.id : issueId(),
    generation: body.generation,
    alwaysOpen: body.alwaysOpen,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    closedEarly: body.closedEarly,
    links: body.links,
    notice: body.notice,
  };
  club.updatedAt = new Date().toISOString();
};

// 새 동아리(신규 등록 승인·관리자 임시 등록). 사진은 업로드 API 전이라 비워 둔다.
export const createClub = (body: TClubSaveRequest, registration: TClubDetail['registration']): TClubDetail => {
  const club: TClubDetail = {
    ...body,
    id: issueId(),
    registration,
    activityConfirmed: true,
    images: [],
    representativeImageId: null,
    recruitment: null,
    previousRecruitment: null,
    canEditDirectly: false,
    firstRegistrationRewardAvailable: registration === 'PROVISIONAL',
    updatedAt: new Date().toISOString(),
  };
  store.clubs.push(club);
  return club;
};

export const addRequest = (
  request:
    | { type: 'REGISTER' | 'EDIT'; before: TClubSaveRequest | null; after: TClubSaveRequest }
    | {
        type: 'RECRUITMENT';
        before: TClubRecruitmentSaveRequest | null;
        after: TClubRecruitmentSaveRequest;
      },
  clubId: number | null,
  clubName: string,
  requester: TAdminClubRequester,
  mine: boolean,
) => {
  store.requests.unshift({
    ...request,
    id: issueId(),
    clubId,
    clubName,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
    processedAt: null,
    rejectReason: null,
    requester,
    mine,
  });
};

// ── 처음 상태 ──
// 바로 수정 권한: 내가 승인받은 동아리(소리마루·연꽃모임)와 다른 회원들.
for (const club of store.clubs) {
  if (club.canEditDirectly) store.editors.set(club.id, [{ ...CURRENT_MEMBER, grantedAt: at(-19, 10) }]);
}
addEditor(2, { memberId: 7, name: '정하늘' });
addEditor(3, { memberId: 8, name: '윤다온' });
addEditor(3, { memberId: 9, name: '서지우' });

const seedRequest = (
  id: number,
  type: TClubRequestType,
  clubId: number | null,
  clubName: string,
  status: TAdminClubRequest['status'],
  requestedDays: number,
  requester: TAdminClubRequester,
  mine: boolean,
  change: Pick<TAdminClubRequest, 'before' | 'after'>,
  rejectReason: string | null = null,
) =>
  ({
    id,
    type,
    clubId,
    clubName,
    status,
    requestedAt: at(requestedDays, 14),
    processedAt: status === 'PENDING' ? null : at(requestedDays + 1, 10),
    rejectReason,
    requester,
    mine,
    before: change.before,
    // 보낸 입력값에는 요청자 연락처·신분이 함께 담긴다(다시 요청할 때 그대로 채운다).
    after: { ...change.after, requesterContact: requester.contact, requesterRole: requester.role },
  }) as TMockRequest;

const me: TAdminClubRequester = { ...CURRENT_MEMBER, contact: 'dongle@dgu.ac.kr', role: 'STAFF' };
const club = (id: number) => toClubSave(findClub(id));
const newClubPayload = (name: string, description: string): TClubSaveRequest => ({
  ...club(1),
  name,
  affiliation: 'CENTRAL',
  fields: ['CULTURE_HOBBY'],
  description,
  generation: 1,
  roomLocation: null,
  generationMemberCount: 10,
  totalMemberCount: 10,
  foundedDate: '2025-03-02',
  officers: [],
  links: [],
  imageCount: 0,
});
const bookmark = findClub(7);

store.requests.push(
  seedRequest(
    6,
    'EDIT',
    7,
    '책갈피',
    'PENDING',
    -1,
    { memberId: 12, name: '박서연', contact: '010-1234-5678', role: 'PRESIDENT' },
    false,
    {
      before: club(7),
      after: {
        ...club(7),
        description: `${bookmark.description}\n매달 함께 읽을 책은 투표로 정해요.`,
        roomLocation: '학생회관 2층 207호',
        generation: 5,
        activityStartDate: at(-60, 0).slice(0, 10),
        activityEndDate: at(120, 0).slice(0, 10),
        foundedDate: '2019-03-04',
        totalMemberCount: 40,
        links: [{ label: '인스타그램', url: 'https://www.instagram.com/example' }],
      },
    },
  ),
  seedRequest(
    5,
    'RECRUITMENT',
    14,
    '한수바둑',
    'PENDING',
    -2,
    { memberId: 13, name: '이준호', contact: 'baduk@dgu.ac.kr', role: 'STAFF' },
    false,
    {
      before: null,
      after: {
        generation: null,
        alwaysOpen: true,
        startsAt: null,
        endsAt: null,
        closedEarly: false,
        links: [{ label: '오픈채팅', url: 'https://open.kakao.com/o/example' }],
        notice: '바둑을 몰라도 괜찮아요. 매주 목요일 저녁에 모여요.',
        requesterContact: 'baduk@dgu.ac.kr',
        requesterRole: 'STAFF',
      },
    },
  ),
  seedRequest(
    4,
    'REGISTER',
    null,
    '별자리 탐험대',
    'PENDING',
    -2,
    { memberId: 14, name: '최별', contact: 'star@dgu.ac.kr', role: 'MEMBER' },
    false,
    {
      before: null,
      after: newClubPayload(
        '별자리 탐험대',
        '맑은 날 밤에 모여 별자리를 관측하고 사진으로 기록하는 모임이에요. 망원경 사용법부터 천체 사진 편집까지 함께 배워요. 처음이어도 괜찮아요!',
      ),
    },
  ),
  seedRequest(3, 'EDIT', 2, '코드나무', 'PENDING', -1, me, true, {
    before: club(2),
    after: { ...club(2), roomLocation: '신공학관 5층 5147호', totalMemberCount: 110 },
  }),
  seedRequest(
    2,
    'REGISTER',
    null,
    '보드게임 공작소',
    'REJECTED',
    -6,
    me,
    true,
    {
      before: null,
      after: newClubPayload(
        '보드게임 공작소',
        '매주 금요일 저녁에 모여 보드게임을 하고, 학기마다 직접 만든 보드게임을 소개하는 동아리예요. 규칙을 몰라도 친절하게 알려드려요!',
      ),
    },
    '활동 사실을 확인할 수 없었어요. 동아리 SNS나 활동 사진을 함께 보내주시면 다시 확인할게요.',
  ),
  seedRequest(1, 'REGISTER', 1, '소리마루', 'APPROVED', -20, me, true, { before: null, after: club(1) }),
);
