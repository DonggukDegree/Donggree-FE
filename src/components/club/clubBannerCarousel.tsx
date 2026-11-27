/**
 * [동아리] 목록 상단 광고 배너
 * 쇼핑몰 메인 배너처럼 4초마다 옆으로 넘어가고, 마우스를 올리거나 포커스가 있으면 멈춘다.
 * 오른쪽 아래 '현재/전체' 표시, PC는 좌우 화살표, 모바일은 밀어서 넘긴다. 줄어든 움직임 설정이면 자동으로 넘기지 않는다.
 * 배너에 이미지가 있으면 이미지만(PC·모바일 따로 가능), 없으면 색 배경 위에 글자를 그린다. FE 수정 없이 데이터로 고른다.
 */
import { useRef, useState } from 'react';

import useAutoRotate from '@/hooks/club/useAutoRotate';
import type { TClubBanner } from '@/types/club/TClub';
import { toAssetUrl } from '@/utils/club/clubImage';

const BANNER_INTERVAL_MS = 4000;
const SWIPE_THRESHOLD = 40;

interface IClubBannerCarouselProps {
  banners: TClubBanner[];
  onSelect: (banner: TClubBanner) => void;
}

const ARROW_CLASS =
  'absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-heading-5 text-coolgray-90 shadow-md opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 lg:flex';

export default function ClubBannerCarousel({ banners, onSelect }: IClubBannerCarouselProps) {
  const [paused, setPaused] = useState(false);
  const { index, go } = useAutoRotate(banners.length, BANNER_INTERVAL_MS, paused);
  const touchStartX = useRef<number | null>(null);

  if (banners.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="동아리 광고 배너"
      className="group relative w-full overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (startX === null || endX === undefined || Math.abs(endX - startX) < SWIPE_THRESHOLD) return;
        go(endX < startX ? index + 1 : index - 1);
      }}
    >
      <ul
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((banner, order) => (
          <li
            key={banner.id}
            className="w-full shrink-0"
            aria-roledescription="slide"
            aria-label={`${order + 1} / ${banners.length}`}
            aria-hidden={order !== index}
          >
            <button
              type="button"
              tabIndex={order === index ? 0 : -1}
              onClick={() => onSelect(banner)}
              style={banner.imageUrl ? undefined : { background: banner.background ?? undefined }}
              className="relative flex h-44 w-full cursor-pointer flex-col justify-center gap-2 overflow-hidden bg-coolgray-10 px-6 text-left text-white sm:h-52 lg:h-64 lg:px-14"
            >
              {banner.imageUrl ? (
                <picture className="absolute inset-0">
                  {banner.mobileImageUrl && (
                    <source media="(max-width: 639px)" srcSet={toAssetUrl(banner.mobileImageUrl)} />
                  )}
                  <img src={toAssetUrl(banner.imageUrl)} alt={banner.title} className="h-full w-full object-cover" />
                </picture>
              ) : (
                <>
                  {banner.eyebrow && (
                    <span className="w-fit rounded-[3px] bg-white/20 px-2 py-0.5 text-body-xs font-semibold tracking-wide lg:text-body-s">
                      {banner.eyebrow}
                    </span>
                  )}
                  <span className="whitespace-pre-line text-heading-5 leading-snug lg:text-heading-2">
                    {banner.title}
                  </span>
                  {banner.description && (
                    <span className="break-keep text-body-xs text-white/85 lg:text-body-m">{banner.description}</span>
                  )}
                </>
              )}
            </button>
          </li>
        ))}
      </ul>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 배너"
            onClick={() => go(index - 1)}
            className={`${ARROW_CLASS} left-4`}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="다음 배너"
            onClick={() => go(index + 1)}
            className={`${ARROW_CLASS} right-4`}
          >
            ›
          </button>
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/35 px-2.5 py-0.5 text-body-xs text-white lg:bottom-4 lg:right-4">
            {index + 1} / {banners.length}
          </span>
        </>
      )}
    </section>
  );
}
