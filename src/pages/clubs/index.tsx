/**
 * [동아리] 목록 페이지 (/clubs)
 * 쇼핑몰 콘셉트. 자주 묻는 질문처럼 가운데 아이콘·제목, 그 아래 자동으로 넘어가는 광고 배너,
 * 필터 바로 위 오른쪽에 내 요청 내역·신규 동아리 등록, 필터(소속 분류·활동 분야·모집 상태)와 정렬(이름·마감 임박·인원 많은·오래된 순),
 * 그 아래 4:3 카드 갤러리(모바일 2열·태블릿 3열·PC 4열). 목록은 커서 기반으로 12개씩 받고, 목록 끝에 가까워지면 자동으로 이어 받는다(불러오는 동안 카드 뼈대). 카드를 누르면 ?club=ID로 상세 모달이 열려 뒤로가기로 닫힌다.
 * 오른쪽 아래 떠 있는 버튼: 맨 위로 가기, 그 아래 찜한 동아리만 모아보기(다시 누르면 전체).
 * 목록·배너·찜은 BE 동아리 API(apis/club/club.ts)에서 받는다.
 * 신규 동아리 등록 버튼은 누구에게나 보이고, 미인증 회원이 누르면 학생 인증 안내를 띄운다.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Users from '@/assets/icons/users.svg?react';
import ClubBannerCarousel from '@/components/club/clubBannerCarousel';
import ClubCard, { ClubCardSkeleton } from '@/components/club/clubCard';
import ClubDetailModal from '@/components/club/clubDetailModal';
import { HEART_PATH } from '@/components/club/clubFavoriteButton';
import ClubFilterBar from '@/components/club/clubFilterBar';
import ClubRequestsModal from '@/components/club/clubRequestsModal';
import { LoadMoreStatus } from '@/components/common/feedback/skeleton';
import ScrollToTopButton, {
  FLOATING_BUTTON_CLASS,
  FLOATING_BUTTON_IDLE_CLASS,
} from '@/components/common/inputs/scrollToTopButton';
import FloatingActionStack from '@/components/common/overlays/floatingActionStack';
import { CLUB_LIST_PAGE_SIZE } from '@/constants/club';
import { useFavoriteClubIds } from '@/hooks/club/useClubFavorites';
import { useClubBanners, useClubs } from '@/hooks/club/useClubQueries';
import useClubWriteGuard from '@/hooks/club/useClubWriteGuard';
import useInView from '@/hooks/useInView';
import useLoadMoreTrigger from '@/hooks/useLoadMoreTrigger';
import type { TClubBanner, TClubFilters, TClubSort } from '@/types/club/TClub';
import { trackEvent } from '@/utils/analytics/analytics';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { countActiveFilters, EMPTY_CLUB_FILTERS, parseClubIdParam } from '@/utils/club/club';

const PILL_BUTTON_CLASS =
  'shrink-0 cursor-pointer rounded-full border border-coolgray-30 bg-white px-4 py-2 text-button-s text-coolgray-90 hover:border-primary-60 hover:text-primary-60';
const TEXT_LINK_CLASS =
  'cursor-pointer text-body-s text-coolgray-60 underline underline-offset-2 hover:text-primary-60';

// GA 필터 그룹 이름(필터 상태 키 → 고정 코드)
const FILTER_GROUPS: Record<keyof TClubFilters, 'affiliation' | 'field' | 'recruitment_status'> = {
  affiliations: 'affiliation',
  fields: 'field',
  recruitmentStatuses: 'recruitment_status',
};

export default function Clubs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedClubId = parseClubIdParam(searchParams.get('club'));
  const [filters, setFilters] = useState<TClubFilters>(EMPTY_CLUB_FILTERS);
  const [sort, setSort] = useState<TClubSort>('NAME');
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  // 모집 상태·D-day 계산 기준 시각. 화면에 들어온 시점으로 고정한다.
  const [now] = useState(() => new Date());
  const favoriteIds = useFavoriteClubIds();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  // 조건(필터·정렬·찜 범위)이 바뀌면 처음 12개부터 다시 받는다.
  const { clubs, totalCount, isPending, isError, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useClubs({
    filters,
    sort,
    favoriteIds: favoritesOnly ? favoriteIds : null,
  });
  // 목록 끝이 화면 가까이 오면 다음 12개를 자동으로 이어 받는다.
  const loadMoreRef = useLoadMoreTrigger({
    canLoadMore: Boolean(hasNextPage),
    isLoading: isPending || isFetchingNextPage,
    onLoadMore: () => void fetchNextPage(),
    itemCount: clubs.length,
  });
  const { data: banners } = useClubBanners();
  const guardWrite = useClubWriteGuard();

  useEffect(() => {
    if (isError) trackErrorShown('club', error, true);
  }, [isError, error]);
  const [headerRef, headerInView] = useInView();
  const listTopRef = useRef<HTMLDivElement>(null);

  const scrollToList = () => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    listTopRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const toggleFavoritesOnly = () => {
    trackEvent('club_favorites_view', { club_favorites_only: !favoritesOnly });
    setFavoritesOnly((prev) => !prev);
    scrollToList();
  };

  const toggleFilter = <K extends keyof TClubFilters>(key: K, value: TClubFilters[K][number]) => {
    trackEvent('club_filter_select', {
      club_filter_group: FILTER_GROUPS[key],
      club_filter_value: value,
      club_filter_on: !(filters[key] as TClubFilters[K][number][]).includes(value),
    });
    setFilters((prev) => {
      const values = prev[key] as TClubFilters[K][number][];
      const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
      return { ...prev, [key]: next };
    });
  };

  const changeSort = (next: TClubSort) => {
    trackEvent('club_sort_select', { club_sort: next });
    setSort(next);
  };

  // 목록에서 연 모달은 뒤로가기로 닫고, 링크로 바로 들어온 모달은 주소만 정리한다.
  const openedFromList = useRef(false);

  const openClub = (clubId: number, entry: 'card' | 'banner' = 'card') => {
    trackEvent('club_select', { club_id: clubId, club_entry: entry });
    openedFromList.current = true;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('club', String(clubId));
      return next;
    });
  };

  const closeClub = () => {
    if (openedFromList.current) {
      openedFromList.current = false;
      navigate(-1);
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('club');
        return next;
      },
      { replace: true },
    );
  };

  // 동아리 홍보 배너(/clubs?club=ID)는 목록에서 카드를 누른 것처럼 상세를 열고, 서비스 안 다른 경로는 해당 화면으로,
  // 외부 주소(고객지원 채팅 등)는 https만 새 창으로 열고, 그 밖의 주소는 무시한다.
  const openBanner = (banner: TClubBanner) => {
    let url: URL;
    try {
      url = new URL(banner.link, window.location.origin);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) {
      if (url.protocol !== 'https:') return;
      trackEvent('club_banner_click', { club_banner_id: banner.id, club_banner_target: 'external' });
      window.open(url.href, '_blank', 'noopener,noreferrer');
      return;
    }
    const clubId = url.pathname === '/clubs' ? parseClubIdParam(url.searchParams.get('club')) : null;
    trackEvent('club_banner_click', {
      club_banner_id: banner.id,
      club_banner_target: clubId !== null ? 'club' : 'internal',
    });
    if (clubId !== null) openClub(clubId, 'banner');
    else navigate(`${url.pathname}${url.search}`);
  };

  const startRegister = () =>
    guardWrite(() => {
      trackEvent('club_register_start');
      navigate('/clubs/register');
    });

  const openRequests = () => {
    trackEvent('club_requests_open');
    setIsRequestsOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-8 lg:gap-8 lg:px-10 lg:py-16">
      <div
        ref={headerRef}
        className={`flex flex-col items-center gap-4 text-center lg:gap-6 ${headerInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <Users className="h-10 w-10 shrink-0 lg:h-20 lg:w-20" />
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-4 lg:text-heading-2 text-coolgray-90">동아리 쇼핑</h1>
          <p className="break-keep text-body-s lg:text-body-m text-coolgray-60">
            동국대생이 참여하는 동아리를 둘러보고, 모집 중인 곳에 바로 지원해보세요.
          </p>
        </div>
      </div>

      {banners && <ClubBannerCarousel banners={banners} onSelect={openBanner} />}

      <div ref={listTopRef} className="flex scroll-mt-24 flex-col gap-3">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={openRequests} className={PILL_BUTTON_CLASS}>
            내 요청 내역
          </button>
          <button type="button" onClick={startRegister} className={PILL_BUTTON_CLASS}>
            신규 동아리 등록
          </button>
        </div>
        <ClubFilterBar filters={filters} sort={sort} onToggle={toggleFilter} onSortChange={changeSort} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-body-s text-coolgray-60">
          {isPending ? '' : `${favoritesOnly ? '찜한' : '등록된'} 동아리 ${totalCount}개`}
        </p>
        {favoritesOnly && (
          <button type="button" onClick={toggleFavoritesOnly} className={TEXT_LINK_CLASS}>
            전체 보기
          </button>
        )}
        {countActiveFilters(filters) > 0 && (
          <button type="button" onClick={() => setFilters(EMPTY_CLUB_FILTERS)} className={TEXT_LINK_CLASS}>
            필터 초기화
          </button>
        )}
      </div>

      {isError && (
        <p className="py-10 text-center text-body-s lg:text-body-m text-coolgray-60">
          동아리 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}
      {!isPending && !isError && clubs.length === 0 && (
        <p className="py-10 text-center text-body-s lg:text-body-m text-coolgray-60">
          {favoritesOnly && favoriteIds.length === 0
            ? '아직 찜한 동아리가 없어요. 사진의 하트를 눌러 찜해보세요.'
            : countActiveFilters(filters) > 0 || favoritesOnly
              ? '조건에 맞는 동아리가 없어요.'
              : '아직 등록된 동아리가 없어요.'}
        </p>
      )}
      {(isPending || clubs.length > 0) && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {clubs.map((club) => (
            <li key={club.id}>
              <ClubCard club={club} now={now} onSelect={(clubId) => openClub(clubId)} />
            </li>
          ))}
          {/* 처음 불러올 때는 한 묶음(12개), 이어 받을 때는 한 줄(4개)만큼 뼈대를 깔아 둔다. */}
          {(isPending || isFetchingNextPage) &&
            Array.from({ length: isPending ? CLUB_LIST_PAGE_SIZE : 4 }, (_, index) => (
              <li key={`skeleton-${index}`}>
                <ClubCardSkeleton />
              </li>
            ))}
        </ul>
      )}
      <div ref={loadMoreRef} aria-hidden />
      <LoadMoreStatus isLoading={isFetchingNextPage} />

      {selectedClubId !== null && (
        <ClubDetailModal key={selectedClubId} clubId={selectedClubId} now={now} onClose={closeClub} />
      )}
      {isRequestsOpen && <ClubRequestsModal onClose={() => setIsRequestsOpen(false)} />}
      <FloatingActionStack>
        <ScrollToTopButton />
        <button
          type="button"
          aria-label={favoritesOnly ? '전체 동아리 보기' : '찜한 동아리 모아보기'}
          aria-pressed={favoritesOnly}
          onClick={toggleFavoritesOnly}
          className={`${FLOATING_BUTTON_CLASS} relative ${
            favoritesOnly ? 'border-[#FF3B5C] bg-[#FF3B5C]' : FLOATING_BUTTON_IDLE_CLASS
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 lg:h-6 lg:w-6" aria-hidden>
            <path d={HEART_PATH} fill={favoritesOnly ? 'white' : '#FF3B5C'} />
          </svg>
          {favoriteIds.length > 0 && !favoritesOnly && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coolgray-90 px-1 text-body-xs leading-none text-white">
              {favoriteIds.length}
            </span>
          )}
        </button>
      </FloatingActionStack>
    </div>
  );
}
