/**
 * [동아리] 화면·API 타입
 * 현재는 UI 확인용 모의 데이터가 이 모양을 따른다. BE API가 생기면 실제 응답 계약에 맞춰 다시 대조한다.
 */

// 소속 분류(동아리당 1개).
export type TClubAffiliation = 'CENTRAL' | 'DEPARTMENT' | 'UNION' | 'CAMPUS_ORG';

// 활동 분야(동아리당 1~3개).
export type TClubField =
  | 'PERFORMANCE'
  | 'ACADEMIC'
  | 'VOLUNTEER'
  | 'SOCIAL_RELIGION'
  | 'CULTURE_HOBBY'
  | 'ART_CREATIVE'
  | 'SPORTS_LEISURE'
  | 'STARTUP_GROWTH'
  | 'SCIENCE_IT'
  | 'BUSINESS_MARKETING'
  | 'POLITICS_LAW'
  | 'MEDICAL_HEALTH'
  | 'BEAUTY'
  | 'COOKING_FOOD'
  | 'ENVIRONMENT_ENERGY'
  | 'CONTENT_MEDIA'
  | 'EDUCATION'
  | 'STUDENT_COUNCIL';

// 화면에 보여주는 모집 상태. 상시모집은 OPEN에 alwaysOpen 표시를 더한다.
export type TClubRecruitmentStatus = 'BEFORE' | 'OPEN' | 'CLOSED';

// 관리자 임시 등록(PROVISIONAL)과 회원 요청 승인을 거친 정식 등록(OFFICIAL).
export type TClubRegistration = 'PROVISIONAL' | 'OFFICIAL';

// 이름순(기본)·마감 임박순·인원 많은 순(전체 활동 인원)·오래된 순(창립일, 모르면 맨 뒤).
export type TClubSort = 'NAME' | 'DEADLINE' | 'MEMBERS' | 'OLDEST';

// 관련 링크. 화면에 보일 이름(1~10자, 예: 인스타그램·공식 홈페이지)을 직접 입력하고 주소는 https만 받는다.
export type TClubLink = {
  label: string;
  url: string;
};

// 기수별 모집 건. 기간 모집은 시작·마감 일시(한국시간), 상시모집은 기간 없이 수동 마감만 한다.
export type TClubRecruitment = {
  id: number;
  generation: number | null;
  alwaysOpen: boolean;
  startsAt: string | null;
  endsAt: string | null;
  closedEarly: boolean;
  // 관련 링크(https만, 최대 3개).
  links: TClubLink[];
  notice: string | null;
};

export type TClubImage = {
  id: number;
  url: string;
};

export type TClubOfficer = {
  role: string;
  department: string;
  name: string;
};

// 목록 카드에 필요한 정보. 사진은 대표 사진을 맨 앞에 둔 순서로 내려주고, 2장 이상이면 카드에서 돌아간다.
export type TClubSummary = {
  id: number;
  name: string;
  affiliation: TClubAffiliation;
  fields: TClubField[];
  registration: TClubRegistration;
  activityConfirmed: boolean;
  imageUrls: string[];
  // OB를 포함한 전체 활동 인원. 인원 많은 순 정렬에 쓴다.
  totalMemberCount: number | null;
  // 창립일(YYYY-MM-DD). 모르면 null이고 오래된 순에서 맨 뒤로 간다.
  foundedDate: string | null;
  // 현재 보여줄 모집 건. 지난 활동이 끝나고 다음 모집이 없으면 null(모집 전).
  recruitment: TClubRecruitment | null;
};

// 상세는 사진 URL 목록 대신 사진 목록과 대표 사진 ID를 받는다.
export type TClubDetail = Omit<TClubSummary, 'imageUrls'> & {
  description: string;
  generation: number | null;
  activityStartDate: string | null;
  activityEndDate: string | null;
  // null이면 동아리방 없음.
  roomLocation: string | null;
  // 한 기수에 선발하는 인원. 전체 활동 인원(totalMemberCount)과 함께 등록·수정일(updatedAt) 기준.
  generationMemberCount: number | null;
  images: TClubImage[];
  representativeImageId: number | null;
  // 현재 모집 건(recruitment)이 없을 때 모집 정보 탭에 보여줄 가장 최근의 지난 모집. 없으면 null.
  previousRecruitment: TClubRecruitment | null;
  officers: TClubOfficer[];
  // 동아리 관련 링크(인스타그램 등, 최대 3개). 모집 건의 링크와 따로 두고 상세 '동아리 정보' 탭에 보여준다.
  links: TClubLink[];
  // 이 동아리에 승인된 요청이 있는 회원이면 승인 없이 바로 반영한다.
  canEditDirectly: boolean;
  // 아직 회원 최초 등록자가 없는 동아리(관리자 임시 등록)면 첫 승인 시 500P.
  firstRegistrationRewardAvailable: boolean;
  updatedAt: string;
};

export type TClubFilters = {
  affiliations: TClubAffiliation[];
  fields: TClubField[];
  recruitmentStatuses: TClubRecruitmentStatus[];
};

// 목록 조회 조건. 필터·정렬은 서버가 적용하고, 찜 모아보기는 찜한 동아리 ID로 좁힌다(찜 API 전까지).
export type TClubListParams = {
  filters: TClubFilters;
  sort: TClubSort;
  favoriteIds: number[] | null;
};

// 커서 기반 목록 한 묶음(12개). nextCursor가 null이면 마지막. 커서 값의 형식은 서버가 정하고 FE는 그대로 돌려준다.
export type TClubPage = {
  clubs: TClubSummary[];
  nextCursor: string | null;
  totalCount: number;
};

export type TClubRequestType = 'REGISTER' | 'EDIT' | 'RECRUITMENT';
// CANCELED: 검토 중에 수정해서 다시 요청하면 기존 요청은 취소되고 새 요청이 맨 뒤에 들어간다.
export type TClubRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

// 요청자가 이 동아리와 어떤 관계인지(승인 검토·추적용, 관리자만 본다).
export type TClubRequesterRole = 'PRESIDENT' | 'STAFF' | 'MEMBER' | 'OUTSIDER';

// 내 요청 내역. 승인 없이 바로 반영된 변경은 요청이 아니므로 여기에 없다.
export type TClubRequest = {
  id: number;
  type: TClubRequestType;
  clubId: number | null;
  clubName: string;
  status: TClubRequestStatus;
  requestedAt: string;
  processedAt: string | null;
  rejectReason: string | null;
};

// 등록·수정 요청 본문. 사진은 업로드 API 확정 전이라 화면에서만 다룬다.
export type TClubSaveRequest = {
  name: string;
  affiliation: TClubAffiliation;
  fields: TClubField[];
  description: string;
  generation: number | null;
  activityStartDate: string | null;
  activityEndDate: string | null;
  roomLocation: string | null;
  generationMemberCount: number | null;
  totalMemberCount: number | null;
  foundedDate: string | null;
  officers: TClubOfficer[];
  links: TClubLink[];
  imageCount: number;
  requesterContact: string | null;
  requesterRole: TClubRequesterRole | null;
};

export type TClubRecruitmentSaveRequest = {
  generation: number | null;
  alwaysOpen: boolean;
  startsAt: string | null;
  endsAt: string | null;
  closedEarly: boolean;
  // 관련 링크(https만, 최대 3개).
  links: TClubLink[];
  notice: string | null;
  requesterContact: string | null;
  requesterRole: TClubRequesterRole | null;
};

// 저장 결과. 승인 대기면 요청 내역에 추가되고, 바로 반영이면 상세가 바뀐다.
export type TClubSaveResult = { applied: 'DIRECT' | 'PENDING'; clubId: number | null };

// 목록 상단 광고 배너. 지금은 모의 데이터이고 관리자 등록·노출 기간은 API 단계에서 정한다.
// 이미지가 있으면 이미지 배너(글자는 이미지에 포함, title은 대체 텍스트), 없으면 색 배경 + 글자 배너로 그린다.
export type TClubBanner = {
  id: number;
  title: string;
  eyebrow: string | null;
  description: string | null;
  // PC용 가로형 이미지와 모바일용 이미지. 모바일 이미지가 없으면 PC 이미지를 같이 쓴다.
  imageUrl: string | null;
  mobileImageUrl: string | null;
  // 이미지가 없을 때 쓰는 CSS 배경(색·그라데이션).
  background: string | null;
  // 누르면 갈 곳. 서비스 안 경로(/clubs?…)는 같은 창에서, 외부 주소(https만, 예: 고객지원 채팅)는 새 창으로 연다.
  link: string;
};

// 내 요청 한 건(수정해서 다시 요청할 때 불러온다). 보냈던 입력값(after)에 연락처·신분이 함께 들어 있다.
export type TMyClubRequestDetail = TClubRequest &
  (
    | { type: 'REGISTER' | 'EDIT'; after: TClubSaveRequest }
    | { type: 'RECRUITMENT'; after: TClubRecruitmentSaveRequest }
  );
