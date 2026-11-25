/**
 * [동아리] 분류·상태·입력 제한 상수
 * 소속 분류 4개·활동 분야 18개는 기획 확정 목록이다. 순서가 곧 화면 표시 순서다.
 */
import type {
  TClubAffiliation,
  TClubField,
  TClubRecruitmentStatus,
  TClubRequestStatus,
  TClubRequestType,
  TClubSort,
} from '@/types/club/TClub';

export const CLUB_AFFILIATIONS: { value: TClubAffiliation; label: string }[] = [
  { value: 'CENTRAL', label: '교내 중앙동아리' },
  { value: 'DEPARTMENT', label: '학과 소모임' },
  { value: 'UNION', label: '연합 동아리' },
  { value: 'CAMPUS_ORG', label: '교내 조직' },
];

export const CLUB_FIELDS: { value: TClubField; label: string }[] = [
  { value: 'PERFORMANCE', label: '공연' },
  { value: 'ACADEMIC', label: '학술/연구' },
  { value: 'VOLUNTEER', label: '봉사' },
  { value: 'SOCIAL_RELIGION', label: '사회/종교' },
  { value: 'CULTURE_HOBBY', label: '문화생활/취미' },
  { value: 'ART_CREATIVE', label: '예술/창작' },
  { value: 'SPORTS_LEISURE', label: '스포츠/레저' },
  { value: 'STARTUP_GROWTH', label: '창업/자기계발' },
  { value: 'SCIENCE_IT', label: '과학/공학/IT' },
  { value: 'BUSINESS_MARKETING', label: '경영/마케팅' },
  { value: 'POLITICS_LAW', label: '정치/법률' },
  { value: 'MEDICAL_HEALTH', label: '의료/보건' },
  { value: 'BEAUTY', label: '뷰티/미용' },
  { value: 'COOKING_FOOD', label: '요리/식품' },
  { value: 'ENVIRONMENT_ENERGY', label: '환경/에너지' },
  { value: 'CONTENT_MEDIA', label: '콘텐츠/언론/미디어' },
  { value: 'EDUCATION', label: '교육' },
  { value: 'STUDENT_COUNCIL', label: '학생자치기구' },
];

export const CLUB_RECRUITMENT_STATUSES: { value: TClubRecruitmentStatus; label: string }[] = [
  { value: 'OPEN', label: '현재 모집 중' },
  { value: 'BEFORE', label: '모집 전' },
  { value: 'CLOSED', label: '모집 마감' },
];

export const CLUB_SORTS: { value: TClubSort; label: string }[] = [
  { value: 'NAME', label: '이름순' },
  { value: 'DEADLINE', label: '마감 임박순' },
  { value: 'MEMBERS', label: '인원 많은 순' },
  { value: 'OLDEST', label: '오래된 순' },
];

export const CLUB_REQUEST_TYPE_LABELS: Record<TClubRequestType, string> = {
  REGISTER: '신규 등록',
  EDIT: '정보 수정',
  RECRUITMENT: '모집 등록',
};

export const CLUB_REQUEST_STATUS_LABELS: Record<TClubRequestStatus, string> = {
  PENDING: '검토 중',
  APPROVED: '승인',
  REJECTED: '반려',
};

export const CLUB_AFFILIATION_LABELS = Object.fromEntries(
  CLUB_AFFILIATIONS.map(({ value, label }) => [value, label]),
) as Record<TClubAffiliation, string>;

export const CLUB_FIELD_LABELS = Object.fromEntries(CLUB_FIELDS.map(({ value, label }) => [value, label])) as Record<
  TClubField,
  string
>;

// 활동 분야 칩은 값마다 같은 색 계열의 테두리·글자색을 준다. Tailwind가 찾을 수 있게 클래스 문자열을 통째로 둔다.
const OUTLINE_COLORS = {
  gray: 'border-[#C9C9C6] text-[#4A4945]',
  brown: 'border-[#D6BBAE] text-[#6B4130]',
  orange: 'border-[#EDBE96] text-[#8A4A14]',
  yellow: 'border-[#E6CF95] text-[#735510]',
  green: 'border-[#A9D0AB] text-[#2C6B3A]',
  blue: 'border-[#9DC1DA] text-[#1F5A85]',
  purple: 'border-[#C9B3DA] text-[#5B3A7A]',
  pink: 'border-[#E8B4CB] text-[#8C2F5D]',
  red: 'border-[#EFB1AA] text-[#9B2C22]',
} as const;

export const CLUB_FIELD_CHIP_COLORS: Record<TClubField, string> = {
  PERFORMANCE: OUTLINE_COLORS.pink,
  ACADEMIC: OUTLINE_COLORS.blue,
  VOLUNTEER: OUTLINE_COLORS.green,
  SOCIAL_RELIGION: OUTLINE_COLORS.brown,
  CULTURE_HOBBY: OUTLINE_COLORS.yellow,
  ART_CREATIVE: OUTLINE_COLORS.purple,
  SPORTS_LEISURE: OUTLINE_COLORS.orange,
  STARTUP_GROWTH: OUTLINE_COLORS.red,
  SCIENCE_IT: OUTLINE_COLORS.gray,
  BUSINESS_MARKETING: OUTLINE_COLORS.yellow,
  POLITICS_LAW: OUTLINE_COLORS.brown,
  MEDICAL_HEALTH: OUTLINE_COLORS.red,
  BEAUTY: OUTLINE_COLORS.pink,
  COOKING_FOOD: OUTLINE_COLORS.orange,
  ENVIRONMENT_ENERGY: OUTLINE_COLORS.green,
  CONTENT_MEDIA: OUTLINE_COLORS.purple,
  EDUCATION: OUTLINE_COLORS.blue,
  STUDENT_COUNCIL: OUTLINE_COLORS.gray,
};

// 목록을 한 번에 받는 개수(PC 4열 기준 3줄). 목록 끝에 가까워지면 다음 12개를 자동으로 이어 받는다.
export const CLUB_LIST_PAGE_SIZE = 12;

export const CLUB_LIMITS = {
  NAME_MAX: 30,
  DESCRIPTION_MIN: 100,
  DESCRIPTION_MAX: 1000,
  FIELDS_MAX: 3,
  ROOM_MAX: 50,
  OFFICERS_MAX: 5,
  OFFICER_TEXT_MAX: 20,
  IMAGES_MAX: 3,
  IMAGE_BYTES_MAX: 5 * 1024 * 1024,
  // 브라우저에서 바로 미리보기 되는 형식만 받는다(HEIC 등은 제외).
  IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  NOTICE_MAX: 1000,
  LINKS_MAX: 3,
  LINK_LABEL_MAX: 10,
  CONTACT_MAX: 100,
} as const;

export const CLUB_POINTS = {
  FIRST_REGISTRATION: 500,
  RECRUITMENT: 100,
  GENERATION_UPDATE: 100,
} as const;
