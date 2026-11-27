/**
 * [동아리] 찜 하트 버튼
 * 사진 오른쪽 아래에 얹는 하트. 찜 전에는 속이 빈 흰 테두리, 누르면 빨갛게 채워지며 톡 튀어 오른다.
 * 카드·상세가 같은 서버 찜 목록(useFavoriteClubIds)을 쓴다.
 */
import { useState } from 'react';

import { useFavoriteClubIds, useToggleClubFavorite } from '@/hooks/club/useClubFavorites';
import { trackEvent } from '@/utils/analytics/analytics';

export const HEART_PATH =
  'M12 20.3s-7.3-4.4-9.2-9.2C1.6 8 3.4 4.5 6.9 4.2c2.1-.2 3.9 1 5.1 2.7 1.2-1.7 3-2.9 5.1-2.7 3.5.3 5.3 3.8 4.1 6.9-1.9 4.8-9.2 9.2-9.2 9.2Z';

export default function ClubFavoriteButton({ clubId, className = '' }: { clubId: number; className?: string }) {
  const isFavorite = useFavoriteClubIds().includes(clubId);
  const toggle = useToggleClubFavorite();
  // 누를 때마다 key를 바꿔 튀어 오르는 애니메이션을 다시 재생한다.
  const [popCount, setPopCount] = useState(0);

  return (
    <button
      type="button"
      aria-label={isFavorite ? '찜 해제' : '찜하기'}
      aria-pressed={isFavorite}
      onClick={(event) => {
        event.stopPropagation();
        trackEvent('club_favorite_toggle');
        toggle(clubId, !isFavorite);
        setPopCount((prev) => prev + 1);
      }}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center ${className}`}
    >
      <svg
        key={popCount}
        viewBox="0 0 24 24"
        aria-hidden
        className={`h-6 w-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] ${popCount > 0 ? 'animate-heart-pop motion-reduce:animate-none' : ''}`}
      >
        <path
          d={HEART_PATH}
          fill={isFavorite ? '#FF3B5C' : 'none'}
          stroke={isFavorite ? '#FF3B5C' : 'white'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
