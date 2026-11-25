/**
 * [동아리] 목록 카드
 * 쇼핑몰 상품 카드처럼 4:3 사진 위 왼쪽에 모집 상태 태그를 얹고, 아래에 이름(방패 배지)·소속 분류·활동 분야를 둔다.
 * 사진이 2장 이상이면 대표 사진부터 2초마다 넘어간다(아래 가운데 도트). 사진 오른쪽 아래 하트로 찜한다.
 * 기본으로 옅은 그림자를 주고, 마우스를 올리면 그림자가 짙어지며 둥실 떠오른다.
 * 사진이 없으면 동그리 기본 이미지(assets/brand/common.svg, 4:3 벡터)를 보여준다.
 */
import defaultClubImage from '@/assets/brand/common.svg';
import { ClubShield, ClubTagChips, RecruitmentBadge } from '@/components/club/clubBadges';
import ClubFavoriteButton from '@/components/club/clubFavoriteButton';
import Skeleton from '@/components/common/feedback/skeleton';
import useAutoRotate from '@/hooks/club/useAutoRotate';
import type { TClubSummary } from '@/types/club/TClub';

interface IClubCardProps {
  club: TClubSummary;
  now: Date;
  onSelect: (clubId: number) => void;
}

// 사진이 없는 동아리의 기본 이미지(동그리 로고, 4:3)
export function ClubImageFallback({ className = '' }: { className?: string }) {
  return <img src={defaultClubImage} alt="" className={`object-cover ${className}`} />;
}

const PHOTO_INTERVAL_MS = 2000;

function CardPhotos({ urls }: { urls: string[] }) {
  const { index } = useAutoRotate(urls.length, PHOTO_INTERVAL_MS);
  if (urls.length === 0) return <ClubImageFallback className="h-full w-full" />;
  return (
    <>
      {urls.map((url, order) => (
        <img
          key={url}
          src={url}
          alt=""
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            order === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {urls.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1" aria-hidden>
          {urls.map((url, order) => (
            <span
              key={url}
              className={`h-1.5 rounded-full bg-white transition-all ${order === index ? 'w-3' : 'w-1.5 opacity-60'}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

// 카드 전체는 상세를 여는 버튼이고, 찜 하트는 버튼 안에 둘 수 없어 사진 칸 위에 따로 겹친다.
export default function ClubCard({ club, now, onSelect }: IClubCardProps) {
  return (
    <div className="group relative h-full hover:animate-float motion-reduce:hover:animate-none">
      <button
        type="button"
        onClick={() => onSelect(club.id)}
        className="flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-coolgray-20 bg-white text-left shadow-[0_2px_10px_rgba(17,24,39,0.06)] transition-shadow duration-300 group-hover:shadow-[0_14px_28px_rgba(17,24,39,0.14)] focus-visible:outline-2 focus-visible:outline-primary-60"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-coolgray-10">
          <CardPhotos urls={club.imageUrls} />
          <div className="absolute left-2 top-2">
            <RecruitmentBadge recruitment={club.recruitment} now={now} />
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3">
          <div className="flex min-w-0 items-center gap-1">
            <p className="truncate text-button-m text-coolgray-90">{club.name}</p>
            <ClubShield registration={club.registration} activityConfirmed={club.activityConfirmed} />
          </div>
          <ClubTagChips affiliation={club.affiliation} fields={club.fields} />
        </div>
      </button>
      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/3]">
        <ClubFavoriteButton clubId={club.id} className="pointer-events-auto absolute bottom-1 right-1" />
      </div>
    </div>
  );
}

// 목록을 불러오는 동안 카드 자리에 보여주는 깜빡이는 뼈대
export function ClubCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-coolgray-20 bg-white">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-3/4 rounded-full" />
      </div>
    </div>
  );
}
