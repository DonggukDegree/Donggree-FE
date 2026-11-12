/**
 * [동글맵] 장소 핀
 * 레벨 3 이하는 카테고리 이모지 + 이름 라벨 핀, 4~6은 카테고리 아이콘 핀이며 가까운 핀은 개수 묶음(클러스터)으로 보여준다.
 * 핀 아래 꼬리(화살표)는 본체 밑 레이어로 겹쳐, 본체 테두리가 꼬리 위를 덮도록 한다.
 * 라벨 핀은 리뷰가 있으면 이름 뒤에 평균 별점을 붙인다.
 * 가까운 핀이 겹치면 커서를 올리거나(키보드 포커스 포함) 선택한 핀을 맨 위로 올려 가려진 핀도 고를 수 있게 한다.
 */
import { useState } from 'react';
import { CustomOverlayMap, MarkerClusterer } from 'react-kakao-maps-sdk';

import { MAP_LABEL_MAX_LEVEL, PLACE_CATEGORY_BY_VALUE } from '@/constants/place';
import type { TPlaceSummary } from '@/types/place/TPlace';
import { placeMarkerZIndex, shouldShowPlaceLabel } from '@/utils/place/place';
import { formatAverageRating } from '@/utils/place/placeReview';

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
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const leave = (placeId: number) => setHoveredId((current) => (current === placeId ? null : current));

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
            zIndex={placeMarkerZIndex(place.id, selectedId, hoveredId)}
            clickable
          >
            <button
              type="button"
              aria-label={`${place.name} 장소 정보 보기`}
              aria-pressed={isSelected}
              onClick={() => onSelect(place)}
              onMouseEnter={() => setHoveredId(place.id)}
              onMouseLeave={() => leave(place.id)}
              onFocus={() => setHoveredId(place.id)}
              onBlur={() => leave(place.id)}
              className="flex cursor-pointer flex-col items-center"
            >
              {showLabel ? (
                <span
                  className={`relative z-10 flex max-w-40 items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-body-s font-semibold text-coolgray-90 shadow-md transition-transform ${
                    isSelected ? 'scale-110 border-primary-60' : 'border-coolgray-20'
                  }`}
                >
                  <span aria-hidden="true" className="shrink-0">
                    {category.emoji}
                  </span>
                  <span className="truncate">{place.name}</span>
                  {place.averageRating !== null && (
                    <span className="shrink-0 text-primary-60">★{formatAverageRating(place.averageRating)}</span>
                  )}
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-body-s shadow-md transition-transform ${
                    isSelected ? 'scale-125 border-primary-60' : 'border-white'
                  }`}
                  style={{ background: category.color }}
                >
                  {category.emoji}
                </span>
              )}
              <span
                aria-hidden="true"
                className="relative z-0 -mt-1 h-0 w-0 border-x-[6px] border-t-[9px] border-x-transparent"
                style={{ borderTopColor: showLabel ? '#ffffff' : category.color }}
              />
            </button>
          </CustomOverlayMap>
        );
      })}
    </MarkerClusterer>
  );
}
