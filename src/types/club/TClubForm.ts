/**
 * [동아리] 등록·수정·모집 폼 모델
 * 입력 중에는 숫자·날짜도 문자열로 들고 있다가 저장할 때 요청 타입으로 바꾼다.
 */
import type { TClubAffiliation, TClubField, TClubRequesterRole } from '@/types/club/TClub';

export type TClubOfficerRow = { key: string; role: string; department: string; name: string };

// 사진 한 장. 고르면 바로 올리며, 올리는 중에는 existingId가 null이고 올리기가 끝나면 받은 사진 ID가 들어간다.
// url은 미리보기(blob:) 또는 서버 사진 경로(/api/clubs/images/...)다.
export type TClubImageDraft = { key: string; url: string; file: File | null; existingId: number | null };

export type TClubForm = {
  name: string;
  affiliation: TClubAffiliation | null;
  fields: TClubField[];
  description: string;
  // 창립일. 모르면 foundedUnknown을 체크하고 '모름'으로 저장한다.
  foundedDate: string;
  foundedUnknown: boolean;
  hasGeneration: boolean;
  generation: string;
  activityStartDate: string;
  activityEndDate: string;
  roomLocation: string;
  // 동아리방이 없으면 체크. 위치 입력 대신 '없음'으로 저장한다.
  noRoom: boolean;
  generationMemberCount: string;
  totalMemberCount: string;
  officers: TClubOfficerRow[];
  links: TClubLinkRow[];
  images: TClubImageDraft[];
  representativeImageKey: string | null;
  requesterRole: TClubRequesterRole | null;
  contact: string;
  consent: boolean;
};

export type TClubFormErrorKey =
  | 'name'
  | 'affiliation'
  | 'fields'
  | 'description'
  | 'foundedDate'
  | 'generation'
  | 'activityPeriod'
  | 'roomLocation'
  | 'memberCount'
  | 'officers'
  | 'links'
  | 'images'
  | 'requesterRole'
  | 'contact'
  | 'consent';

export type TClubFormErrors = Partial<Record<TClubFormErrorKey, string>>;

export type TClubLinkRow = { key: string; label: string; url: string };

export type TClubRecruitmentForm = {
  generation: string;
  alwaysOpen: boolean;
  startsAt: string;
  endsAt: string;
  closedEarly: boolean;
  links: TClubLinkRow[];
  notice: string;
  requesterRole: TClubRequesterRole | null;
  contact: string;
  consent: boolean;
};

export type TClubRecruitmentFormErrorKey = 'generation' | 'period' | 'links' | 'requesterRole' | 'contact' | 'consent';

export type TClubRecruitmentFormErrors = Partial<Record<TClubRecruitmentFormErrorKey, string>>;
