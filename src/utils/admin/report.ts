import { PLACE_REPORT_REASONS, PLACE_TAG_LABELS, REVIEW_REPORT_REASONS } from '@/constants/place';
import type { TAdminInfoSnapshot, TAdminMember, TReportStatus } from '@/types/admin/TAdminReport';
import type { TPlaceReportReason, TReviewReportReason } from '@/types/place/TPlace';

// [관리자 > 신고 관리] 표시용 순수 함수.

export const REPORT_STATUS_LABELS: Record<TReportStatus, string> = {
  PENDING: '대기',
  RESOLVED: '처리 완료',
  REJECTED: '기각',
};

export const REPORT_REASON_LABELS: Record<TPlaceReportReason | TReviewReportReason, string> = Object.fromEntries(
  [...PLACE_REPORT_REASONS, ...REVIEW_REPORT_REASONS].map(({ value, label }) => [value, label]),
) as Record<TPlaceReportReason | TReviewReportReason, string>;

const pad = (value: number) => String(value).padStart(2, '0');

export const formatAdminDateTime = (iso: string | null) => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// 회원 행 한 줄: "이름(닉네임) · 학번 · 단과대 학과". 탈퇴했으면 "탈퇴한 회원".
export const formatAdminMember = (member: TAdminMember | null) => {
  if (!member) return '탈퇴한 회원';
  const name = member.name ?? '이름 없음';
  const nickname = member.nickname && member.nickname !== member.name ? `(${member.nickname})` : '';
  const affiliation = [member.collegeName, member.departmentName].filter(Boolean).join(' ') || '학과 정보 없음';
  return `${name}${nickname} · ${member.studentId ?? '학번 없음'} · ${affiliation}`;
};

export const isSuspendedNow = (member: TAdminMember | null, now = new Date()) =>
  Boolean(member?.suspendedUntil && new Date(member.suspendedUntil).getTime() > now.getTime());

// 수정 전후 값 요약. 바뀐 항목만 보여준다.
export const describeInfoChanges = (before: TAdminInfoSnapshot, after: TAdminInfoSnapshot) => {
  const changes: string[] = [];
  if (before.businessHours !== after.businessHours)
    changes.push(`영업시간: ${before.businessHours ?? '없음'} → ${after.businessHours ?? '없음'}`);
  if (before.description !== after.description)
    changes.push(`설명: ${before.description ?? '없음'} → ${after.description ?? '없음'}`);
  const menus = (snapshot: TAdminInfoSnapshot) => snapshot.menus.map((menu) => menu.name).join(', ') || '없음';
  if (menus(before) !== menus(after) || JSON.stringify(before.menus) !== JSON.stringify(after.menus))
    changes.push(`메뉴: ${menus(before)} → ${menus(after)}`);
  const tags = (snapshot: TAdminInfoSnapshot) => snapshot.tags.map((tag) => PLACE_TAG_LABELS[tag]).join(', ') || '없음';
  if (tags(before) !== tags(after)) changes.push(`숨은 맛집: ${tags(before)} → ${tags(after)}`);
  return changes;
};

// 정지 일수 입력 검증. 1일 이상 정수, 업무 상한 없음(서버가 날짜 범위만 다시 막는다).
export const parseSuspensionDays = (value: string) => {
  if (!/^\d+$/.test(value.trim())) return null;
  const days = Number(value.trim());
  return Number.isSafeInteger(days) && days >= 1 ? days : null;
};

// 신고 상태 배지 색.
export const STATUS_BADGE_CLASS: Record<TReportStatus, string> = {
  PENDING: 'bg-primary-30 text-primary-90',
  RESOLVED: 'bg-coolgray-10 text-coolgray-90',
  REJECTED: 'bg-coolgray-10 text-coolgray-60',
};

// 장소·리뷰 숨김/해제 확인 모달 문구. 신고 상세와 하단 목록이 같은 문구를 쓴다.
export const placeVisibilityConfirm = (name: string, hide: boolean) =>
  hide
    ? {
        action: `${name}을 지도에서 숨길까요?`,
        description: '숨기면 지도·장소 정보에서 사라지고, 이 장소의 처리 대기 신고는 처리 완료돼요.',
        confirmText: '숨기기',
        danger: true,
      }
    : {
        action: `${name}을 다시 지도에 보이게 할까요?`,
        description: '이 장소의 처리 대기 신고는 기각돼요.',
        confirmText: '숨김 해제',
      };

export const reviewVisibilityConfirm = (hide: boolean) =>
  hide
    ? {
        action: '이 리뷰를 숨길까요?',
        description:
          '숨기면 평균 별점에서 빠지고, 목록에는 "신고되어 숨겨진 리뷰입니다."로 보여요. 이 리뷰의 처리 대기 신고는 처리 완료돼요.',
        confirmText: '숨기기',
        danger: true,
      }
    : {
        action: '이 리뷰를 다시 보이게 할까요?',
        description: '이 리뷰의 처리 대기 신고는 기각돼요.',
        confirmText: '숨김 해제',
      };

export const PLACE_STATUS_LABELS: Record<'VISIBLE' | 'HIDDEN', string> = { VISIBLE: '보임', HIDDEN: '숨김' };

// 관리자 리뷰 목록의 상태. 작성자 삭제가 숨김보다 우선한다.
export const adminReviewStateLabel = (review: { status: 'VISIBLE' | 'HIDDEN'; deleted: boolean }) =>
  review.deleted ? '작성자 삭제' : review.status === 'HIDDEN' ? '숨김' : '보임';
