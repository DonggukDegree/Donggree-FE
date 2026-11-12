import type { TCommonResponse } from '@/types/common';
import type {
  TPlaceCategory,
  TPlaceMenu,
  TPlaceReportReason,
  TPlaceSubCategory,
  TPlaceTag,
  TReviewReportReason,
} from '@/types/place/TPlace';

// [관리자 > 신고 관리] BE 관리자 통합 신고 대시보드 응답. 회원 행이 null이면 탈퇴한 회원이다.

export type TReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

// 신고자·작성자·수정자 행. 단과대·학과는 성적표 주전공 기준이라 성적표가 없으면 null.
export type TAdminMember = {
  memberId: number;
  nickname: string | null;
  name: string | null;
  studentId: string | null;
  collegeName: string | null;
  departmentName: string | null;
  suspendedUntil: string | null; // 정지 중이면 종료 시각
};

export type TAdminPage<T> = { items: T[]; totalCount: number; page: number; size: number };

export type TAdminPlaceReport = {
  reportId: number;
  reason: TPlaceReportReason;
  description: string | null;
  status: TReportStatus;
  createdAt: string;
  processedAt: string | null;
  reporter: TAdminMember | null;
  placeId: number;
  placeName: string | null;
  category: TPlaceCategory | null;
  placeStatus: 'VISIBLE' | 'HIDDEN' | null;
  pendingCount: number;
};

export type TAdminReviewReport = {
  reportId: number;
  reason: TReviewReportReason;
  description: string | null;
  status: TReportStatus;
  createdAt: string;
  processedAt: string | null;
  reporter: TAdminMember | null;
  reviewId: number;
  rating: number;
  content: string | null;
  reviewStatus: 'VISIBLE' | 'HIDDEN' | null;
  reviewDeleted: boolean;
  author: TAdminMember | null;
  placeId: number | null;
  placeName: string | null;
  pendingCount: number;
};

export type TAdminInfoSnapshot = {
  businessHours: string | null;
  description: string | null;
  menus: TPlaceMenu[];
  tags: TPlaceTag[];
};

export type TAdminEditHistory = {
  historyId: number;
  editor: TAdminMember | null;
  editedAt: string;
  before: TAdminInfoSnapshot;
  after: TAdminInfoSnapshot;
};

export type TAdminPlaceReportDetail = {
  report: TAdminPlaceReport;
  place: TAdminInfoSnapshot & {
    id: number;
    name: string;
    category: TPlaceCategory;
    subCategory: TPlaceSubCategory;
    status: 'VISIBLE' | 'HIDDEN';
    createdAt: string;
    infoUpdatedAt: string;
  };
  registrant: TAdminMember | null;
  editHistories: TAdminEditHistory[];
  placeReports: TAdminPlaceReport[];
};

export type TAdminReviewReportDetail = { report: TAdminReviewReport; reviewReports: TAdminReviewReport[] };

export type TAdminSuspension = {
  id: number;
  days: number;
  source: 'REPORT' | 'ADMIN';
  reportType: 'PLACE' | 'REVIEW' | null;
  reportId: number | null;
  note: string | null;
  startsAt: string;
  endsAt: string;
  createdBy: number;
  liftedAt: string | null;
  liftedBy: number | null;
};

export type TAdminMemberRow = { member: TAdminMember; receivedReportCount: number };

export type TAdminMemberDetail = {
  member: TAdminMember;
  role: string;
  joinedAt: string;
  receivedReviewReportCount: number;
  placeReportSuspensionCount: number;
  receivedReportCount: number;
  suspensions: TAdminSuspension[];
};

// 정지 요청. memberId는 장소 신고로 정지할 때만(등록자·수정자 중 대상).
// 신고 관리 하단 전체 장소 목록 한 행. 등록자가 탈퇴했으면 registrant가 null.
export type TAdminPlaceRow = {
  placeId: number;
  name: string;
  category: TPlaceCategory;
  subCategory: TPlaceSubCategory;
  status: 'VISIBLE' | 'HIDDEN';
  pendingReportCount: number;
  registrant: TAdminMember | null;
  createdAt: string;
};

// 리뷰 목록 상태 필터. 숨김과 작성자 삭제는 따로 저장되지만 화면에서는 하나의 상태로 본다.
export type TAdminReviewState = 'VISIBLE' | 'HIDDEN' | 'DELETED';

// 신고 관리 하단 전체 리뷰 목록 한 행. 관리자는 숨긴·지운 리뷰도 본문까지 본다.
export type TAdminReviewRow = {
  reviewId: number;
  placeId: number;
  placeName: string | null;
  rating: number;
  content: string;
  status: 'VISIBLE' | 'HIDDEN';
  deleted: boolean;
  pendingReportCount: number;
  author: TAdminMember | null;
  createdAt: string;
};

export type TAdminSuspensionRequest = { memberId?: number; days: number; note: string | null };

export type TAdminResponse<T> = TCommonResponse<T>;
