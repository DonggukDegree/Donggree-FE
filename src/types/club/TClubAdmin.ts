/**
 * [관리자 > 동아리 관리] 화면·API 타입
 * 요청 승인·반려, 동아리 임시 등록·직접 수정 권한, 목록 상단 배너를 다룬다. 현재는 모의 데이터가 이 모양을 따른다.
 */
import type {
  TClubBanner,
  TClubRecruitmentSaveRequest,
  TClubRequest,
  TClubRequesterRole,
  TClubSaveRequest,
  TClubSummary,
} from '@/types/club/TClub';

// 요청자(실명·회원 ID). 연락처·신분은 관리자 확인·추적용이며 공개 화면에는 내려가지 않는다.
export type TAdminClubRequester = {
  memberId: number;
  name: string;
  contact: string;
  role: TClubRequesterRole;
};

// 등록·수정 요청은 동아리 정보, 모집 요청은 모집 정보를 바꾸기 전(before)·요청(after)으로 담는다. 신규 등록은 before가 없다.
type TClubInfoChange = { type: 'REGISTER' | 'EDIT'; before: TClubSaveRequest | null; after: TClubSaveRequest };
type TRecruitmentChange = {
  type: 'RECRUITMENT';
  before: TClubRecruitmentSaveRequest | null;
  after: TClubRecruitmentSaveRequest;
};

export type TAdminClubRequest = Omit<TClubRequest, 'type'> &
  (TClubInfoChange | TRecruitmentChange) & { requester: TAdminClubRequester };

// 승인 없이 바로 수정할 수 있는 회원(이 동아리의 요청이 한 번이라도 승인된 회원). 관리자가 회수할 수 있다.
export type TAdminClubEditor = {
  memberId: number;
  name: string;
  grantedAt: string;
};

export type TAdminClub = TClubSummary & {
  editors: TAdminClubEditor[];
  updatedAt: string;
};

// 관리자 배너. 꺼져 있거나 노출 기간 밖이면 공개 목록에 내려가지 않는다. order가 작을수록 먼저 보인다.
export type TAdminClubBanner = TClubBanner & {
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  order: number;
};

export type TAdminClubBannerSave = Omit<TAdminClubBanner, 'id' | 'order'>;

export type TAdminBannerStatus = 'LIVE' | 'SCHEDULED' | 'ENDED' | 'OFF';

// 배너 입력 폼. 글자 배너는 라벨·제목·설명·배경색, 이미지 배너는 PC(필수)·모바일 이미지와 대체 텍스트(제목)를 쓴다.
export type TClubBannerForm = {
  mode: 'TEXT' | 'IMAGE';
  eyebrow: string;
  title: string;
  description: string;
  background: string;
  imageUrl: string;
  mobileImageUrl: string;
  link: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

export type TClubBannerFormErrors = Partial<
  Record<'title' | 'eyebrow' | 'description' | 'image' | 'link' | 'period', string>
>;
