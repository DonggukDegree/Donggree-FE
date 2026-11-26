/**
 * [동아리] 상태 배지·칩
 * - 모집 상태: 쇼핑몰 상품 태그처럼 테두리 없는 각진 박스. 기간 모집 중(마감 D-n·D-DAY)은 빨강, 상시모집은 주황,
 *   모집 전은 보라, 마감은 어두운 회색. 상세에서는 한 단계 크게 쓴다.
 * - 이름 옆 방패: 임시 등록은 주황, 활동 확인은 파랑(현재 활동 중), 미확인은 회색(현재 활동 미확인). 마우스를 올리면 말풍선.
 * - 소속 분류는 글자로, 활동 분야는 값마다 색이 다른 둥근 테두리형 칩으로 보여준다.
 */
import { CLUB_AFFILIATION_LABELS, CLUB_FIELD_CHIP_COLORS, CLUB_FIELD_LABELS } from '@/constants/club';
import type { TClubAffiliation, TClubField, TClubRecruitment, TClubRegistration } from '@/types/club/TClub';
import { getRecruitmentBadge, getRecruitmentTone, type TRecruitmentTone } from '@/utils/club/club';

type TBadgeSize = 'sm' | 'lg';

const RECRUITMENT_TONE_STYLES: Record<TRecruitmentTone, string> = {
  OPEN: 'bg-alert text-white',
  ALWAYS: 'bg-primary-60 text-white',
  BEFORE: 'bg-[#7B61FF] text-white',
  CLOSED: 'bg-coolgray-90/80 text-white',
};

const BADGE_SIZES: Record<TBadgeSize, string> = {
  sm: 'px-2 py-1 text-body-xs',
  lg: 'px-2.5 py-1.5 text-body-s',
};

export function RecruitmentBadge({
  recruitment,
  now,
  size = 'sm',
}: {
  recruitment: TClubRecruitment | null;
  now: Date;
  size?: TBadgeSize;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-[3px] font-semibold leading-none ${BADGE_SIZES[size]} ${
        RECRUITMENT_TONE_STYLES[getRecruitmentTone(recruitment, now)]
      }`}
    >
      {getRecruitmentBadge(recruitment, now)}
    </span>
  );
}

const SHIELD_STATES = {
  PROVISIONAL: { label: '임시 등록된 동아리', color: 'text-primary-60' },
  ACTIVE: { label: '현재 활동 중', color: 'text-[#0095F6]' },
  UNCONFIRMED: { label: '현재 활동 미확인', color: 'text-coolgray-30' },
} as const;

// 이름 오른쪽 방패. 임시 등록이 활동 확인보다 우선한다. 크기는 글자 크기에 맞춰 className으로 준다.
export function ClubShield({
  registration,
  activityConfirmed,
  className = 'h-4 w-4',
}: {
  registration: TClubRegistration;
  activityConfirmed: boolean;
  className?: string;
}) {
  const state =
    SHIELD_STATES[registration === 'PROVISIONAL' ? 'PROVISIONAL' : activityConfirmed ? 'ACTIVE' : 'UNCONFIRMED'];
  return (
    <span className="group/shield relative inline-flex shrink-0">
      <svg viewBox="0 0 24 24" role="img" aria-label={state.label} className={`${state.color} ${className}`}>
        <path
          fill="currentColor"
          d="M12 2.2 4.3 5.1a1 1 0 0 0-.6.9v5.6c0 4.8 3.3 8.9 7.9 10.2a1.4 1.4 0 0 0 .8 0c4.6-1.3 7.9-5.4 7.9-10.2V6a1 1 0 0 0-.6-.9L12 2.2Z"
        />
        <path
          d="m8.4 12.1 2.5 2.5 4.8-5"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-coolgray-90 px-2 py-1 text-body-xs text-white shadow-md group-hover/shield:block"
      >
        {state.label}
      </span>
    </span>
  );
}

const FIELD_CHIP_SIZES: Record<TBadgeSize, string> = {
  sm: 'px-2.5 py-0.5 text-body-xs',
  lg: 'px-3 py-1 text-body-s',
};

export function FieldChip({ field, size = 'sm' }: { field: TClubField; size?: TBadgeSize }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border bg-white font-medium ${FIELD_CHIP_SIZES[size]} ${CLUB_FIELD_CHIP_COLORS[field]}`}
    >
      {CLUB_FIELD_LABELS[field]}
    </span>
  );
}

// 소속 분류 글자 한 줄, 그 아래 활동 분야 칩 줄
export function ClubTagChips({
  affiliation,
  fields,
  size = 'sm',
}: {
  affiliation: TClubAffiliation;
  fields: TClubField[];
  size?: TBadgeSize;
}) {
  return (
    <div className={`flex flex-col ${size === 'lg' ? 'gap-2.5' : 'gap-1.5'}`}>
      <p className={`text-coolgray-90 ${size === 'lg' ? 'text-body-s lg:text-body-m' : 'text-body-xs'}`}>
        {CLUB_AFFILIATION_LABELS[affiliation]}
      </p>
      <div className={`flex flex-wrap ${size === 'lg' ? 'gap-1.5' : 'gap-1'}`}>
        {fields.map((field) => (
          <FieldChip key={field} field={field} size={size} />
        ))}
      </div>
    </div>
  );
}
