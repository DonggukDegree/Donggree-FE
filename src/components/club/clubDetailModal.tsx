/**
 * [동아리] 상세 모달
 * 카드를 누르면 열린다. 주소에 ?club=ID가 붙어 링크로 바로 열 수 있다.
 * 사진 아래 모집 상태 배지와 오른쪽 원형 버튼(수정 펜·모집 등록 +), 이름·소속·분야, 그 아래 '동아리 정보'·'모집 정보' 탭.
 * 동아리 정보는 기본 정보 목록(동아리 관련 링크 포함) → 소개 → 운영진, 모집 정보는 상태 안내 박스 → 모집 기수·기간·관련 링크 → 모집 안내.
 * 승인 이력이 있는 회원은 바로 반영, 그 외 회원은 관리자 승인 요청이라 버튼 이름(정보 수정/수정 요청)이 달라진다.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Pencil from '@/assets/icons/pencil.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import { ClubShield, ClubTagChips, RecruitmentBadge } from '@/components/club/clubBadges';
import { ClubImageFallback } from '@/components/club/clubCard';
import ClubFavoriteButton from '@/components/club/clubFavoriteButton';
import Loading from '@/components/common/feedback/loading';
import { CLUB_POINTS } from '@/constants/club';
import { useClubDetail } from '@/hooks/club/useClubQueries';
import type { TClubDetail, TClubLink } from '@/types/club/TClub';
import { trackEvent } from '@/utils/analytics/analytics';
import {
  formatClubDate,
  getRecruitmentStatus,
  getRecruitmentStatusLabel,
  getRecruitmentTone,
  type TRecruitmentTone,
} from '@/utils/club/club';
import { formatDateTime } from '@/utils/date';

interface IClubDetailModalProps {
  clubId: number;
  now: Date;
  onClose: () => void;
}

function ImageGallery({ club }: { club: TClubDetail }) {
  // 대표 사진을 첫 장으로 보여준다.
  const ordered = [...club.images].sort(
    (a, b) => Number(b.id === club.representativeImageId) - Number(a.id === club.representativeImageId),
  );
  const [index, setIndex] = useState(0);

  if (ordered.length === 0)
    return (
      <div className="relative">
        <ClubImageFallback className="aspect-[4/3] w-full" />
        <ClubFavoriteButton clubId={club.id} className="absolute bottom-2 right-2" />
      </div>
    );

  const move = (delta: number) => setIndex((prev) => (prev + delta + ordered.length) % ordered.length);

  // 사진을 가로로 이어 붙인 띠를 옮겨, 버튼을 눌러도 옆으로 미끄러지듯 넘어간다.
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-coolgray-10">
      <div
        className="flex h-full transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {ordered.map((image, order) => (
          <img
            key={image.id}
            src={image.url}
            alt={`${club.name} 사진 ${order + 1}`}
            aria-hidden={order !== index}
            className="h-full w-full shrink-0 object-contain"
          />
        ))}
      </div>
      {ordered.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 사진"
            onClick={() => move(-1)}
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-coolgray-90 shadow"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="다음 사진"
            onClick={() => move(1)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-coolgray-90 shadow"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {ordered.map((image, dotIndex) => (
              <span
                key={image.id}
                className={`h-1.5 w-1.5 rounded-full ${dotIndex === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
      <ClubFavoriteButton clubId={club.id} className="absolute bottom-2 right-2" />
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-body-s lg:text-body-m">
      <dt className="w-24 shrink-0 text-coolgray-60">{label}</dt>
      <dd className="min-w-0 break-keep text-coolgray-90">{children}</dd>
    </div>
  );
}

// 관련 링크 칩(입력한 이름 ↗). 동아리 정보 탭은 링크가 없으면 줄째 숨기고, 모집 정보 탭은 '미확인'으로 보여준다.
function LinkChips({ links }: { links: TClubLink[] }) {
  if (links.length === 0) return <span className="text-coolgray-60">미확인</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('club_apply_link_click')}
          className="inline-flex items-center gap-1 rounded-full border border-coolgray-30 px-3 py-1 text-body-s text-coolgray-90 hover:border-primary-60 hover:text-primary-60"
        >
          {link.label} ↗
        </a>
      ))}
    </span>
  );
}

type TDetailTab = 'INFO' | 'RECRUITMENT';

const DETAIL_TABS: { value: TDetailTab; label: string }[] = [
  { value: 'INFO', label: '동아리 정보' },
  { value: 'RECRUITMENT', label: '모집 정보' },
];

// 쇼핑몰 상품 상세처럼 칸을 나눈 탭바. 고른 탭은 굵은 글자와 아래 검은 선.
function DetailTabBar({ selected, onSelect }: { selected: TDetailTab; onSelect: (tab: TDetailTab) => void }) {
  return (
    <div role="tablist" className="grid grid-cols-2 border-b border-coolgray-20">
      {DETAIL_TABS.map(({ value, label }) => {
        const isSelected = value === selected;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(value)}
            className={`-mb-px cursor-pointer border-b-2 py-3 text-button-m lg:text-button-l ${
              isSelected ? 'border-coolgray-90 text-coolgray-90' : 'border-transparent text-coolgray-60'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

const unknown = <span className="text-coolgray-60">미확인</span>;
const countText = (label: string, count: number | null) => (count === null ? `${label} 미확인` : `${label} ${count}명`);

function ClubInfoTab({ club }: { club: TClubDetail }) {
  const hasMembers = club.generationMemberCount !== null || club.totalMemberCount !== null;
  return (
    <div className="flex flex-col gap-6">
      <dl className="flex flex-col gap-2">
        <InfoRow label="창립일자">{club.foundedDate ? formatClubDate(club.foundedDate) : unknown}</InfoRow>
        <InfoRow label="활동 기간">
          {club.generation !== null
            ? `${club.generation}기 / ${formatClubDate(club.activityStartDate)} ~ ${formatClubDate(club.activityEndDate)}`
            : '기수 없이 활동 / 매년 3월·9월 활동 확인'}
        </InfoRow>
        <InfoRow label="인원">
          {hasMembers ? (
            <>
              {countText('한 기수', club.generationMemberCount)} / {countText('전체', club.totalMemberCount)}(OB 포함)
              <span className="text-coolgray-60"> ({formatClubDate(club.updatedAt)} 기준)</span>
            </>
          ) : (
            unknown
          )}
        </InfoRow>
        <InfoRow label="동아리방">{club.roomLocation ?? (club.registration === 'OFFICIAL' ? '없음' : unknown)}</InfoRow>
        <InfoRow label="현재 활동 상태">
          {club.activityConfirmed ? '현재 활동 중' : <span className="text-coolgray-60">현재 활동 미확인</span>}
        </InfoRow>
        {club.links.length > 0 && (
          <InfoRow label="관련 링크">
            <LinkChips links={club.links} />
          </InfoRow>
        )}
      </dl>

      <p className="whitespace-pre-line break-keep text-body-m text-coolgray-90">{club.description}</p>

      {club.officers.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-heading-6 text-coolgray-90">{club.generation ? `${club.generation}기 ` : ''}운영진</h3>
          <ul className="flex flex-col gap-1">
            {club.officers.map((officer) => (
              <li key={`${officer.role}-${officer.name}`} className="text-body-s text-coolgray-90">
                <span className="text-coolgray-60">{officer.role}</span> {officer.name}
                {officer.department && <span className="text-coolgray-60"> · {officer.department}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {club.registration === 'PROVISIONAL' && (
        <p className="break-keep rounded-xl bg-primary-30 p-4 text-body-s text-primary-90">
          관리자가 임시로 등록한 동아리예요. 정보를 보완해 주시면 확인 후 정식 등록으로 바뀌어요.
          {club.firstRegistrationRewardAvailable && ` 처음 승인받으면 ${CLUB_POINTS.FIRST_REGISTRATION}P를 드려요.`}
        </p>
      )}
    </div>
  );
}

// 모집 정보 탭 맨 위 상태 안내 박스. 배지와 같은 색 계열의 옅은 바탕.
const STATUS_BOX_STYLES: Record<TRecruitmentTone, string> = {
  OPEN: 'bg-alert/10 text-alert',
  ALWAYS: 'bg-primary-30 text-primary-90',
  BEFORE: 'bg-[#7B61FF]/10 text-[#5B3FD9]',
  CLOSED: 'bg-coolgray-10 text-coolgray-60',
};

// 모집 상태 박스 아래에는 현재 모집 건을, 없으면 가장 최근의 지난 모집을 그대로 보여준다.
// 모집 정보가 한 번도 올라오지 않은 동아리도 '모집 전이에요.' 보라 박스를 띄우고, 그 아래 가운데 '모집 정보가 없어요.'를 보여준다.
function RecruitmentTab({ club, now }: { club: TClubDetail; now: Date }) {
  const recruitment = club.recruitment ?? club.previousRecruitment;
  const isPast = club.recruitment === null || getRecruitmentStatus(club.recruitment, now) === 'CLOSED';
  const statusBox = (
    <p
      className={`break-keep rounded-xl p-4 text-button-m ${STATUS_BOX_STYLES[getRecruitmentTone(club.recruitment, now)]}`}
    >
      {getRecruitmentStatusLabel(club.recruitment, now)}
    </p>
  );
  if (!recruitment)
    return (
      <div className="flex flex-col gap-6">
        {statusBox}
        <p className="py-8 text-center text-body-m text-coolgray-60">모집 정보가 없어요.</p>
      </div>
    );
  return (
    <div className="flex flex-col gap-6">
      {statusBox}
      {isPast && <p className="-mb-3 text-body-s text-coolgray-60">지난 모집 정보</p>}
      <dl className="flex flex-col gap-2">
        <InfoRow label="모집 기수">{recruitment.generation ? `${recruitment.generation}기` : unknown}</InfoRow>
        <InfoRow label="모집 기간">
          {recruitment.alwaysOpen
            ? '상시모집'
            : `${formatDateTime(recruitment.startsAt ?? '')} ~ ${formatDateTime(recruitment.endsAt ?? '')}`}
          {recruitment.closedEarly && <span className="text-coolgray-60"> (조기 마감)</span>}
        </InfoRow>
        <InfoRow label="관련 링크">
          <LinkChips links={recruitment.links} />
        </InfoRow>
      </dl>
      {recruitment.notice && (
        <p className="whitespace-pre-line break-keep text-body-m text-coolgray-90">{recruitment.notice}</p>
      )}
    </div>
  );
}

// 원형 테두리 아이콘 버튼. 마우스를 올리거나 키보드로 포커스하면 아래에 말풍선으로 이름을 보여준다.
function TooltipIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <span className="group/tip relative inline-flex">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-coolgray-30 bg-white text-coolgray-90 hover:border-primary-60 hover:text-primary-60 lg:h-10 lg:w-10"
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-coolgray-90 px-2 py-1 text-body-xs text-white shadow-md group-hover/tip:block group-focus-within/tip:block"
      >
        {label}
      </span>
    </span>
  );
}

// 페이지를 옮기면 모달은 목록 화면과 함께 내려가므로 따로 닫지 않는다.
function DetailBody({ club, now }: { club: TClubDetail; now: Date }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TDetailTab>('INFO');
  const hasOpenRecruitment = club.recruitment !== null && getRecruitmentStatus(club.recruitment, now) !== 'CLOSED';
  const editLabel = club.canEditDirectly ? '정보 수정' : '수정 요청';
  const recruitmentLabel = hasOpenRecruitment ? '모집 수정' : '모집 등록';

  return (
    <>
      <ImageGallery club={club} />
      <div className="flex flex-col gap-5 p-5 lg:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <RecruitmentBadge recruitment={club.recruitment} now={now} size="lg" />
            <div className="flex gap-2">
              <TooltipIconButton label={editLabel} onClick={() => navigate(`/clubs/edit?club=${club.id}`)}>
                <Pencil className="h-4 w-4 lg:h-5 lg:w-5" />
              </TooltipIconButton>
              <TooltipIconButton
                label={recruitmentLabel}
                onClick={() => navigate(`/clubs/recruitment?club=${club.id}`)}
              >
                <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
              </TooltipIconButton>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <h2 id="club-detail-title" className="text-heading-4 lg:text-heading-3 text-coolgray-90">
              {club.name}
            </h2>
            <ClubShield
              registration={club.registration}
              activityConfirmed={club.activityConfirmed}
              className="h-5 w-5 lg:h-6 lg:w-6"
            />
          </div>
          <ClubTagChips affiliation={club.affiliation} fields={club.fields} size="lg" />
        </div>

        <DetailTabBar selected={tab} onSelect={setTab} />

        {tab === 'INFO' ? <ClubInfoTab club={club} /> : <RecruitmentTab club={club} now={now} />}
      </div>
    </>
  );
}

export default function ClubDetailModal({ clubId, now, onClose }: IClubDetailModalProps) {
  const { data: club, isLoading, isError } = useClubDetail(clubId);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay lg:items-center lg:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="club-detail-title"
        className="relative max-h-[92dvh] w-full max-w-[640px] overflow-y-auto rounded-t-2xl bg-white lg:rounded-2xl"
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-heading-6 text-coolgray-90 shadow"
        >
          ×
        </button>
        {isLoading && (
          <div className="py-20">
            <Loading variant="inline" />
          </div>
        )}
        {isError && <p className="py-20 text-center text-body-s text-coolgray-60">동아리 정보를 불러오지 못했어요.</p>}
        {club && <DetailBody club={club} now={now} />}
      </div>
    </div>
  );
}
