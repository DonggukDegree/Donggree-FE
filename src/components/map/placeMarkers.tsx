/**
 * [동글맵] 장소 핀
 * 레벨 3 이하는 이름 라벨 핀, 4~6은 카테고리 아이콘 핀이며 가까운 핀은 개수 묶음(클러스터)으로 보여준다.
 * 별점은 리뷰 기능이 열린 뒤 라벨 옆에 붙인다.
 */
import { CustomOverlayMap, MarkerClusterer } from 'react-kakao-maps-sdk';

import { MAP_LABEL_MAX_LEVEL, PLACE_CATEGORY_BY_VALUE } from '@/constants/place';
import type { TPlaceSummary } from '@/types/place/TPlace';
import { shouldShowPlaceLabel } from '@/utils/place/place';

interface IPlaceMarkersProps {
  places: TPlaceSummary[];
  level: number;
  selectedId: number | null;
  onSelect: (place: TPlaceSummary) => void;
}

// 클러스터 원. 라이브러리가 인라인 스타일만 받는다.
const CLUSTER_STYLES = [
  {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 149, 43, 0.9)',
    borderRadius: '20px',
    border: '2px solid #ffffff',
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: '36px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  },
];

export default function PlaceMarkers({ places, level, selectedId, onSelect }: IPlaceMarkersProps) {
  const showLabel = shouldShowPlaceLabel(level);

  return (
    <MarkerClusterer averageCenter minLevel={MAP_LABEL_MAX_LEVEL + 1} gridSize={60} styles={CLUSTER_STYLES}>
      {places.map((place) => {
        const category = PLACE_CATEGORY_BY_VALUE[place.category];
        const isSelected = place.id === selectedId;
        return (
          <CustomOverlayMap
            key={place.id}
            position={{ lat: place.latitude, lng: place.longitude }}
            yAnchor={1}
            zIndex={isSelected ? 10 : 1}
            clickable
          >
            <button
              type="button"
              aria-label={`${place.name} 장소 정보 보기`}
              aria-pressed={isSelected}
              onClick={() => onSelect(place)}
              className="flex cursor-pointer flex-col items-center"
            >
              {showLabel ? (
                <span
                  className={`flex max-w-40 items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-body-s font-semibold text-coolgray-90 shadow-md transition-transform ${
                    isSelected ? 'scale-110 border-primary-60' : 'border-coolgray-20'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: category.color }}
                  />
                  <span className="truncate">{place.name}</span>
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-body-s shadow-md transition-transform ${
                    isSelected ? 'scale-125 border-primary-60' : 'border-white'
                  }`}
                  style={{ background: category.color }}
                >
                  {category.emoji}
                </span>
              )}
              <span
                aria-hidden="true"
                className="-mt-px h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent"
                style={{ borderTopColor: showLabel ? '#ffffff' : category.color }}
              />
            </button>
          </CustomOverlayMap>
        );
      })}
    </MarkerClusterer>
  );
}
