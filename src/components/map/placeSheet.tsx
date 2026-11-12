/**
 * [동글맵] 장소 정보 시트
 * 모바일은 지도 위 2단계 바텀시트(기본 약 40% / 펼침), lg 이상은 지도 왼쪽 고정 패널로 보여준다.
 * 손잡이(시트 상단 줄 전체)를 위로 끌거나 누르면 펼치고, 아래로 끌면 접거나 닫는다. 외부 라이브러리 없이 지도 전용으로 둔다.
 * 모바일에서 손가락으로 잡기 쉽게 손잡이 영역을 닫기 버튼 앞까지 넓히고, 본문 스크롤이 지도로 새지 않게 막는다.
 */
import { useEffect, useRef, useState } from 'react';

import Loading from '@/components/common/feedback/loading';
import PlaceDetailContent from '@/components/map/placeDetailContent';
import usePlaceDetail from '@/hooks/place/usePlaceDetail';
import type { TPlaceDetail } from '@/types/place/TPlace';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { getErrorStatus } from '@/utils/error';

const DRAG_THRESHOLD_PX = 40;

interface IPlaceSheetProps {
  placeId: number;
  onClose: () => void;
  onEdit: (place: TPlaceDetail) => void;
}

export default function PlaceSheet({ placeId, onClose, onEdit }: IPlaceSheetProps) {
  const { data: place, isPending, isError, error } = usePlaceDetail(placeId);
  const [expanded, setExpanded] = useState(false);
  const dragStartY = useRef<number | null>(null);

  useEffect(() => {
    if (isError) trackErrorShown('donggle_map', error, true);
  }, [isError, error]);

  const handleDragEnd = (clientY: number) => {
    if (dragStartY.current === null) return;
    const delta = clientY - dragStartY.current;
    dragStartY.current = null;
    if (Math.abs(delta) < DRAG_THRESHOLD_PX) {
      setExpanded((value) => !value);
    } else if (delta < 0) {
      setExpanded(true);
    } else if (expanded) {
      setExpanded(false);
    } else {
      onClose();
    }
  };

  return (
    <section
      aria-label="장소 정보"
      className={`absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transition-[height] duration-200 lg:inset-y-0 lg:left-0 lg:right-auto lg:h-full lg:w-100 lg:rounded-none lg:shadow-[4px_0_16px_rgba(0,0,0,0.08)] ${
        expanded ? 'h-[88%]' : 'h-[42%]'
      }`}
    >
      <div className="relative flex shrink-0 items-center justify-center pt-1 lg:justify-end lg:px-4 lg:pt-4">
        <button
          type="button"
          aria-label={expanded ? '장소 정보 접기' : '장소 정보 펼치기'}
          aria-expanded={expanded}
          className="flex h-9 w-full cursor-grab touch-none items-center justify-center pr-12 pl-12 lg:hidden"
          onPointerDown={(event) => {
            dragStartY.current = event.clientY;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => handleDragEnd(event.clientY)}
          onPointerCancel={() => {
            dragStartY.current = null;
          }}
        >
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-coolgray-30" />
        </button>
        <button
          type="button"
          aria-label="장소 정보 닫기"
          onClick={onClose}
          className="absolute right-3 top-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-heading-6 text-coolgray-60 hover:bg-coolgray-10 lg:static"
        >
          ×
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-14 lg:px-6">
        {isPending ? (
          <Loading variant="inline" />
        ) : isError || !place ? (
          <p className="py-10 text-center text-body-s text-coolgray-60">
            {getErrorStatus(error) === 404 ? '장소를 찾을 수 없어요.' : '장소 정보를 불러오지 못했어요.'}
          </p>
        ) : (
          <PlaceDetailContent place={place} onEdit={() => onEdit(place)} />
        )}
      </div>
    </section>
  );
}
