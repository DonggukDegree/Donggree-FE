/**
 * [동아리] UI 확인용 모의 데이터
 * BE API 연결 전까지 club.ts가 이 데이터를 돌려준다. 모든 상태(임시 등록·활동 확인 안 됨·기간/상시 모집·
 * 조기 마감·모집 전·사진 0~3장·바로 수정 가능 여부)를 한 화면에서 볼 수 있게 구성했다.
 * 날짜는 접속 시각 기준 상대값이라 언제 열어도 모집 상태가 섞여 보인다. 이름은 모두 가상이다.
 */
import type { TClubBanner, TClubDetail, TClubRecruitment, TClubRequest } from '@/types/club/TClub';

const DAY = 24 * 60 * 60 * 1000;
const at = (days: number, hour = 18) => {
  const date = new Date(Date.now() + days * DAY);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
const dateOnly = (days: number) => {
  const date = new Date(Date.now() + days * DAY);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// 실제 사진 대신 쓰는 그라데이션 SVG. 카드와 같은 4:3 비율로 만든다.
const mockImage = (from: string, to: string, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><text x="400" y="320" font-family="sans-serif" font-size="56" fill="rgba(255,255,255,0.85)" text-anchor="middle">${label}</text></svg>`,
  )}`;

const images = (key: string, colors: [string, string][]) =>
  colors.map(([from, to], index) => ({
    id: Number(`${key}${index + 1}`),
    url: mockImage(from, to, `사진 ${index + 1}`),
  }));

const period = (id: number, generation: number | null, startDays: number, endDays: number): TClubRecruitment => ({
  id,
  generation,
  alwaysOpen: false,
  startsAt: at(startDays, 9),
  endsAt: at(endDays),
  closedEarly: false,
  links: [
    { label: '지원폼', url: 'https://forms.gle/example' },
    { label: '인스타그램', url: 'https://www.instagram.com/example' },
  ],
  notice: '전공·학년 무관 누구나 지원할 수 있어요. 서류 합격자는 개별 연락드려요.',
});

const always = (id: number): TClubRecruitment => ({
  id,
  generation: null,
  alwaysOpen: true,
  startsAt: null,
  endsAt: null,
  closedEarly: false,
  links: [{ label: '오픈채팅', url: 'https://open.kakao.com/o/example' }],
  notice: '오픈채팅으로 언제든 문의해 주세요.',
});

const base = {
  registration: 'OFFICIAL' as const,
  activityConfirmed: true,
  roomLocation: null,
  generationMemberCount: null,
  totalMemberCount: null,
  foundedDate: null,
  previousRecruitment: null,
  officers: [],
  links: [],
  canEditDirectly: false,
  firstRegistrationRewardAvailable: false,
  updatedAt: at(-3),
};

export const MOCK_CLUBS: TClubDetail[] = [
  {
    ...base,
    id: 1,
    name: '소리마루',
    links: [{ label: '인스타그램', url: 'https://www.instagram.com/example' }],
    foundedDate: '1987-03-02',
    affiliation: 'CENTRAL',
    fields: ['PERFORMANCE', 'CULTURE_HOBBY'],
    description:
      '동국대 중앙 밴드 동아리예요. 매 학기 정기 공연과 축제 무대를 준비하고, 보컬·기타·베이스·드럼·키보드 세션별로 합주해요.\n악기를 처음 배우는 사람도 환영해요!\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    generation: 24,
    activityStartDate: dateOnly(-20),
    activityEndDate: dateOnly(150),
    roomLocation: '학생회관 3층 312호',
    generationMemberCount: 14,
    totalMemberCount: 126,
    images: images('1', [
      ['#ff8a5b', '#ffb36b'],
      ['#6b8cff', '#9db4ff'],
      ['#4dc4a1', '#9de3c9'],
    ]),
    representativeImageId: 11,
    officers: [
      { role: '회장', department: '경영학과', name: '김하늘' },
      { role: '부회장', department: '컴퓨터공학전공', name: '이바다' },
    ],
    recruitment: period(101, 24, -4, 3),
    canEditDirectly: true,
  },
  {
    ...base,
    id: 2,
    name: '코드나무',
    links: [
      { label: '인스타그램', url: 'https://www.instagram.com/example' },
      { label: '깃허브', url: 'https://github.com/example' },
    ],
    foundedDate: '2012-09-01',
    affiliation: 'CENTRAL',
    fields: ['SCIENCE_IT', 'ACADEMIC', 'STARTUP_GROWTH'],
    description:
      '웹·앱 프로젝트를 함께 만드는 개발 동아리예요. 학기마다 팀 프로젝트와 스터디를 운영해요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    generation: 9,
    activityStartDate: dateOnly(-10),
    activityEndDate: dateOnly(170),
    roomLocation: '신공학관 5층 5145호',
    generationMemberCount: 12,
    totalMemberCount: 105,
    images: images('2', [
      ['#3a7bd5', '#00d2ff'],
      ['#355c7d', '#6c5b7b'],
    ]),
    representativeImageId: 21,
    recruitment: period(201, 10, -2, 10),
  },
  {
    ...base,
    id: 3,
    name: '한빛봉사단',
    foundedDate: '1995-03-15',
    affiliation: 'CENTRAL',
    fields: ['VOLUNTEER'],
    description:
      '지역 아동센터 학습 멘토링과 연탄 나눔 봉사를 해요. 기수 없이 상시로 함께해요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    generation: null,
    activityStartDate: null,
    activityEndDate: null,
    generationMemberCount: 20,
    totalMemberCount: 180,
    images: images('3', [
      ['#f7971e', '#ffd200'],
      ['#43cea2', '#185a9d'],
    ]),
    representativeImageId: 31,
    recruitment: always(301),
  },
  {
    ...base,
    id: 4,
    name: '필름로그',
    foundedDate: '2009-03-01',
    affiliation: 'CENTRAL',
    fields: ['ART_CREATIVE', 'CULTURE_HOBBY'],
    description:
      '필름·디지털 사진을 찍고 매 학기 사진전을 열어요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    generation: 15,
    activityStartDate: dateOnly(-30),
    activityEndDate: dateOnly(120),
    roomLocation: '학생회관 2층 205호',
    generationMemberCount: 9,
    totalMemberCount: 84,
    images: images('4', [
      ['#434343', '#9a9a9a'],
      ['#c79081', '#dfa579'],
      ['#7f7fd5', '#91eae4'],
    ]),
    representativeImageId: 42,
    recruitment: { ...period(401, 15, -6, 8), closedEarly: true },
  },
  {
    ...base,
    id: 5,
    name: '동국 러너스',
    foundedDate: '2019-04-01',
    affiliation: 'CENTRAL',
    fields: ['SPORTS_LEISURE'],
    description:
      '남산 둘레길과 한강을 함께 달리는 러닝 크루예요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    generation: 6,
    activityStartDate: dateOnly(-200),
    activityEndDate: dateOnly(-5),
    activityConfirmed: false,
    images: images('5', [['#11998e', '#38ef7d']]),
    representativeImageId: 51,
    recruitment: period(501, 7, 14, 24),
  },
  {
    ...base,
    id: 6,
    name: '마케팅 랩',
    foundedDate: '2016-09-05',
    affiliation: 'UNION',
    fields: ['BUSINESS_MARKETING', 'STARTUP_GROWTH'],
    description:
      '서울권 대학 연합 마케팅 학회예요. 기업 연계 프로젝트와 공모전을 준비해요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    generation: 31,
    activityStartDate: dateOnly(-15),
    activityEndDate: dateOnly(160),
    generationMemberCount: 27,
    totalMemberCount: 240,
    images: images('6', [
      ['#ee0979', '#ff6a00'],
      ['#8e2de2', '#4a00e0'],
    ]),
    representativeImageId: 61,
    recruitment: period(601, 31, -7, 1),
  },
  {
    ...base,
    id: 7,
    name: '책갈피',
    affiliation: 'DEPARTMENT',
    fields: ['EDUCATION', 'CULTURE_HOBBY'],
    description:
      '한 달에 한 권 읽고 이야기하는 학과 독서 소모임이에요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    registration: 'PROVISIONAL',
    generation: null,
    activityStartDate: null,
    activityEndDate: null,
    images: [],
    representativeImageId: null,
    recruitment: null,
    firstRegistrationRewardAvailable: true,
  },
  {
    ...base,
    id: 8,
    name: '총학생회',
    foundedDate: '1960-03-01',
    affiliation: 'CAMPUS_ORG',
    fields: ['STUDENT_COUNCIL'],
    description:
      '학생 복지·학사 의견을 모으고 축제와 학생 행사를 운영해요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    generation: null,
    activityStartDate: null,
    activityEndDate: null,
    roomLocation: '학생회관 1층',
    images: images('8', [
      ['#f6d365', '#fda085'],
      ['#a1c4fd', '#c2e9fb'],
      ['#d4fc79', '#96e6a1'],
    ]),
    representativeImageId: 81,
    recruitment: null,
    previousRecruitment: period(801, 41, -220, -206),
  },
  {
    ...base,
    id: 9,
    name: '그린스텝',
    foundedDate: '2021-03-02',
    affiliation: 'UNION',
    fields: ['ENVIRONMENT_ENERGY', 'VOLUNTEER'],
    description:
      '플로깅과 캠퍼스 분리배출 캠페인을 하는 연합 환경 동아리예요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    generation: 4,
    activityStartDate: dateOnly(-60),
    activityEndDate: dateOnly(100),
    generationMemberCount: 8,
    totalMemberCount: 75,
    images: images('9', [['#56ab2f', '#a8e063']]),
    representativeImageId: 91,
    recruitment: period(901, 4, -30, -16),
  },
  {
    ...base,
    id: 10,
    name: '쿡앤톡',
    foundedDate: '2023-03-02',
    affiliation: 'CENTRAL',
    fields: ['COOKING_FOOD'],
    description:
      '매주 한 가지 요리를 함께 만들고 나눠 먹어요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    registration: 'PROVISIONAL',
    generation: 2,
    activityStartDate: dateOnly(-5),
    activityEndDate: dateOnly(110),
    images: images('10', [['#ff9a9e', '#fecfef']]),
    representativeImageId: 101,
    recruitment: period(1001, 2, -3, 5),
    firstRegistrationRewardAvailable: true,
  },
  {
    ...base,
    id: 11,
    name: '정론',
    affiliation: 'DEPARTMENT',
    fields: ['POLITICS_LAW', 'ACADEMIC'],
    description:
      '법·정책 이슈를 주제로 토론하는 학과 학회예요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요.',
    generation: null,
    activityStartDate: null,
    activityEndDate: null,
    activityConfirmed: false,
    images: [],
    representativeImageId: null,
    recruitment: null,
  },
  {
    ...base,
    id: 12,
    name: '연꽃모임',
    foundedDate: '1978-05-01',
    affiliation: 'CENTRAL',
    fields: ['SOCIAL_RELIGION'],
    description:
      '명상과 템플스테이를 함께하는 불교 동아리예요.\n학기 초에 신입 부원을 모집하고, 정기 모임과 MT로 선후배가 함께 어울려요. 궁금한 점은 모집 안내 링크로 편하게 문의해 주세요. 누구나 환영해요!',
    generation: null,
    activityStartDate: null,
    activityEndDate: null,
    roomLocation: '정각원 옆 동아리방',
    images: images('12', [
      ['#e0c3fc', '#8ec5fc'],
      ['#fbc2eb', '#a6c1ee'],
    ]),
    representativeImageId: 121,
    recruitment: always(1201),
    canEditDirectly: true,
  },
];

// 모집 정보가 한 번도 올라오지 않은 동아리(모집 전 기본값 예시). '더보기' 확인을 위해 12개를 넘기도록 더 둔다.
const noRecruitment = (
  id: number,
  name: string,
  affiliation: TClubDetail['affiliation'],
  fields: TClubDetail['fields'],
  colors: [string, string][],
): TClubDetail => ({
  ...base,
  id,
  name,
  affiliation,
  fields,
  description:
    '아직 모집 정보를 올리지 않은 동아리예요. 매주 정기 모임에서 함께 활동하고, 학기마다 작은 발표회와 교류전을 열어요. 궁금한 점은 동아리방으로 편하게 찾아와 주세요. 누구나 환영해요!',
  generation: null,
  activityStartDate: null,
  activityEndDate: null,
  roomLocation: '학생회관 4층',
  images: images(String(id), colors),
  representativeImageId: colors.length > 0 ? Number(`${id}1`) : null,
  recruitment: null,
});

MOCK_CLUBS.push(
  noRecruitment(13, '별빛천문회', 'CENTRAL', ['SCIENCE_IT', 'CULTURE_HOBBY'], [['#141e30', '#243b55']]),
  noRecruitment(14, '한수바둑', 'CENTRAL', ['CULTURE_HOBBY'], []),
  noRecruitment(15, '사진공방', 'DEPARTMENT', ['ART_CREATIVE'], [['#bdc3c7', '#2c3e50']]),
  noRecruitment(16, '무브 댄스크루', 'UNION', ['PERFORMANCE', 'SPORTS_LEISURE'], [['#8e2de2', '#4a00e0']]),
  noRecruitment(17, '논객 토론회', 'DEPARTMENT', ['ACADEMIC', 'POLITICS_LAW'], []),
  noRecruitment(18, '하모니 기타', 'CENTRAL', ['PERFORMANCE'], [['#f12711', '#f5af19']]),
);

export const MOCK_CLUB_REQUESTS: TClubRequest[] = [
  {
    id: 3,
    type: 'EDIT',
    clubId: 2,
    clubName: '코드나무',
    status: 'PENDING',
    requestedAt: at(-1, 14),
    processedAt: null,
    rejectReason: null,
  },
  {
    id: 2,
    type: 'REGISTER',
    clubId: null,
    clubName: '보드게임 공작소',
    status: 'REJECTED',
    requestedAt: at(-6, 11),
    processedAt: at(-5, 10),
    rejectReason: '활동 사실을 확인할 수 없었어요. 동아리 SNS나 활동 사진을 함께 보내주시면 다시 확인할게요.',
  },
  {
    id: 1,
    type: 'REGISTER',
    clubId: 1,
    clubName: '소리마루',
    status: 'APPROVED',
    requestedAt: at(-20, 16),
    processedAt: at(-19, 10),
    rejectReason: null,
  },
];

// 목록 상단 기본 배너 2개: 신규 동아리 등록 이벤트, 이 자리 광고 모집(고객지원 채팅으로 문의).
export const MOCK_CLUB_BANNERS: TClubBanner[] = [
  {
    id: 1,
    imageUrl: null,
    mobileImageUrl: null,
    eyebrow: 'EVENT · 포인트',
    title: '우리 동아리가 없나요?\n등록하면 500P',
    description: '처음 등록한 동아리가 승인되면 포인트를 드려요.',
    link: '/clubs/register',
    background: 'linear-gradient(120deg, #3a3fd9 0%, #5b6cff 55%, #8fa2ff 100%)',
  },
  {
    id: 2,
    imageUrl: null,
    mobileImageUrl: null,
    eyebrow: 'AD · 광고 모집',
    title: '이 자리에\n우리 동아리를 알려보세요',
    description: '모집 홍보 배너 광고를 받고 있어요. 고객지원으로 편하게 문의해 주세요.',
    // 고객지원 카카오 채널 채팅. 배너 외부 링크는 https만 열리므로 https 주소로 둔다.
    link: 'https://pf.kakao.com/_UxnFGX/chat',
    background: 'linear-gradient(120deg, #ff6a3d 0%, #ff952b 55%, #ffc46b 100%)',
  },
];
