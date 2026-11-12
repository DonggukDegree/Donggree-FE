/**
 * [동글맵] 장소 핀
 * 레벨 3 이하는 카테고리 이모지 + 이름 라벨 핀, 4~6은 카테고리 아이콘 핀이며 가까운 핀은 개수 묶음(클러스터)으로 보여준다.
 * 핀 아래 꼬리(화살표)는 본체 밑 레이어로 겹쳐, 본체 테두리가 꼬리 위를 덮도록 한다.
 * 라벨 핀은 리뷰가 있으면 이름 뒤에 평균 별점을 붙인다.
 * 가까운 핀이 겹치면 커서를 올리거나(키보드 포커스 포함) 선택한 핀을 맨 위로 올려 가려진 핀도 고를 수 있게 한다.
 * 최대로 확대해도 겹칠 만큼 가까운 장소(5m 이내)는 라벨 레벨에서 개수 핀 하나로 묶고, 누르면 핀 위 목록에서 고른다.
 */
import { useState } from 'react';
import { CustomOverlayMap, MarkerClusterer } from 'react-kakao-maps-sdk';

import { MAP_LABEL_MAX_LEVEL, PLACE_CATEGORY_BY_VALUE, PLACE_OVERLAP_GROUP_METERS } from '@/constants/place';
import type { TPlaceSummary } from '@/types/place/TPlace';
import { groupNearbyPlaces, placeMarkerZIndex, shouldShowPlaceLabel, type TPlaceGroup } from '@/utils/place/place';
import { formatAverageRating } from '@/utils/place/placeReview';

interface IPlaceMarkersProps {
  places: TPlaceSummary[];
  level: number;
  selectedId: number | null;
  onSelect: (place: TPlaceSummary) => void;
  openGroupKey: number | null; // 목록을 펼친 묶음 핀(기준 장소 ID)
  onToggleGroup: (groupKey: number | null) => void;
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

export default function PlaceMarkers({
  places,
  level,
  selectedId,
  onSelect,
  openGroupKey,
  onToggleGroup,
}: IPlaceMarkersProps) {
  const showLabel = shouldShowPlaceLabel(level);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const hover = {
    enter: (key: number) => setHoveredId(key),
    leave: (key: number) => setHoveredId((current) => (current === key ? null : current)),
  };
  // 아이콘 레벨(4~6)은 카카오 클러스터러가 묶으므로 장소마다 핀을 둔다.
  const groups: TPlaceGroup<TPlaceSummary>[] = showLabel
    ? groupNearbyPlaces(places, PLACE_OVERLAP_GROUP_METERS)
    : places.map((place) => ({ key: place.id, anchor: place, places: [place] }));

  return (
    <MarkerClusterer averageCenter minLevel={MAP_LABEL_MAX_LEVEL + 1} gridSize={60} styles={CLUSTER_STYLES}>
      {groups.map((group) =>
        group.places.length > 1 ? (
          <GroupPin
            key={`group-${group.key}`}
            group={group}
            isOpen={openGroupKey === group.key}
            hasSelected={group.places.some((place) => place.id === selectedId)}
            isHovered={hoveredId === group.key}
            hover={hover}
            onToggle={() => onToggleGroup(openGroupKey === group.key ? null : group.key)}
            onSelect={(place) => {
              onToggleGroup(null);
              onSelect(place);
            }}
          />
        ) : (
          <PlacePin
            key={group.key}
            place={group.anchor}
            showLabel={showLabel}
            isSelected={group.anchor.id === selectedId}
            zIndex={placeMarkerZIndex(group.anchor.id, selectedId, hoveredId)}
            hover={hover}
            onSelect={onSelect}
          />
        ),
      )}
    </MarkerClusterer>
  );
}

type THover = { enter: (key: number) => void; leave: (key: number) => void };

function PlacePin({
  place,
  showLabel,
  isSelected,
  zIndex,
  hover,
  onSelect,
}: {
  place: TPlaceSummary;
  showLabel: boolean;
  isSelected: boolean;
  zIndex: number;
  hover: THover;
  onSelect: (place: TPlaceSummary) => void;
}) {
  const category = PLACE_CATEGORY_BY_VALUE[place.category];
  return (
    <CustomOverlayMap position={{ lat: place.latitude, lng: place.longitude }} yAnchor={1} zIndex={zIndex} clickable>
      <button
        type="button"
        aria-label={`${place.name} 장소 정보 보기`}
        aria-pressed={isSelected}
        onClick={() => onSelect(place)}
        onMouseEnter={() => hover.enter(place.id)}
        onMouseLeave={() => hover.leave(place.id)}
        onFocus={() => hover.enter(place.id)}
        onBlur={() => hover.leave(place.id)}
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
}

// 최대로 확대해도 겹치는 장소 묶음. 개수를 보여주고, 누르면 핀 위에 이모지·이름·별점 목록을 펼친다.
function GroupPin({
  group,
  isOpen,
  hasSelected,
  isHovered,
  hover,
  onToggle,
  onSelect,
}: {
  group: TPlaceGroup<TPlaceSummary>;
  isOpen: boolean;
  hasSelected: boolean;
  isHovered: boolean;
  hover: THover;
  onToggle: () => void;
  onSelect: (place: TPlaceSummary) => void;
}) {
  const listId = `place-group-${group.key}`;
  return (
    <CustomOverlayMap
      position={{ lat: group.anchor.latitude, lng: group.anchor.longitude }}
      yAnchor={1}
      zIndex={isOpen ? 40 : isHovered ? 30 : hasSelected ? 20 : 1}
      clickable
    >
      <div className="relative flex flex-col items-center">
        {isOpen && (
          <ul
            id={listId}
            aria-label="겹친 장소 목록"
            className="absolute bottom-full left-1/2 mb-2 flex max-h-60 w-56 -translate-x-1/2 flex-col overflow-y-auto rounded-xl border border-coolgray-20 bg-white py-1 shadow-lg"
          >
            {group.places.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => onSelect(place)}
                  className="flex w-full cursor-pointer items-center gap-1.5 px-3 py-2 text-left text-body-s text-coolgray-90 hover:bg-coolgray-10"
                >
                  <span aria-hidden="true" className="shrink-0">
                    {PLACE_CATEGORY_BY_VALUE[place.category].emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{place.name}</span>
                  {place.averageRating !== null && (
                    <span className="shrink-0 text-primary-60">★{formatAverageRating(place.averageRating)}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          aria-label={`겹친 장소 ${group.places.length}곳 목록 ${isOpen ? '닫기' : '보기'}`}
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={onToggle}
          onMouseEnter={() => hover.enter(group.key)}
          onMouseLeave={() => hover.leave(group.key)}
          onFocus={() => hover.enter(group.key)}
          onBlur={() => hover.leave(group.key)}
          className="flex cursor-pointer flex-col items-center"
        >
          <span
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-primary-60/90 text-body-m font-bold text-white shadow-md transition-transform ${
              isOpen || hasSelected ? 'scale-110 border-primary-60 ring-2 ring-white' : 'border-white'
            }`}
          >
            {group.places.length}
          </span>
          <span
            aria-hidden="true"
            className="relative z-0 -mt-1 h-0 w-0 border-x-[6px] border-t-[9px] border-x-transparent border-t-primary-60"
          />
        </button>
      </div>
    </CustomOverlayMap>
  );
}
