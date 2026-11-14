/**
 * [동글맵 > 장소 등록] 위치 지정
 * 지도 가운데에 고정 핀을 띄우고, 지도를 움직였다 멈출 때마다 핀 위치의 주소를 실시간으로 보여준다.
 * 서비스 영역(캠퍼스 반경 1.5km) 밖이면 다음 단계로 넘어가지 못한다. 주소는 표시만 하고 저장하지 않는다.
 */
import Button from '@/components/common/inputs/button';
import usePlaceAddress from '@/hooks/place/usePlaceAddress';
import type { TLatLng } from '@/types/place/TPlaceForm';
import { isInsideCampusArea } from '@/utils/place/placeForm';

interface IPlaceRegisterLocatorProps {
  center: TLatLng;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PlaceRegisterLocator({ center, onConfirm, onCancel }: IPlaceRegisterLocatorProps) {
  const { address, isLoading } = usePlaceAddress(center.lat, center.lng);
  const inside = isInsideCampusArea(center);

  return (
    <>
      <p className="absolute inset-x-4 top-3 z-20 mx-auto w-fit rounded-full bg-coolgray-90 px-4 py-2 text-center text-body-s text-white shadow-md">
        지도를 움직여 핀을 장소 위치에 맞춰주세요
      </p>
      {/* 핀 끝이 지도 중심에 오도록 핀 높이만큼 위로 올린다. 지도 조작을 막지 않게 포인터를 통과시킨다. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-full"
      >
        <svg viewBox="0 0 32 44" className="h-11 w-8 drop-shadow-md">
          <path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 44 16 44s16-16.5 16-28.3C32 7 24.8 0 16 0Z" fill="#ff952b" />
          <circle cx="16" cy="15.5" r="6" fill="#ffffff" />
        </svg>
      </div>
      <section
        aria-label="장소 위치 지정"
        className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-4 rounded-t-2xl bg-white p-5 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] lg:inset-x-auto lg:bottom-6 lg:left-6 lg:w-100 lg:rounded-2xl lg:shadow-md"
      >
        <div className="flex flex-col gap-1">
          <p className="text-body-xs text-coolgray-60">핀 위치</p>
          <p className="break-keep text-body-m text-coolgray-90" aria-live="polite">
            {isLoading ? '주소를 불러오는 중이에요' : (address ?? '주소를 확인할 수 없어요')}
          </p>
          {!inside && (
            <p className="text-body-s text-alert">동글맵 지역(캠퍼스 반경 1.5km) 안에서만 등록할 수 있어요.</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" className="flex-1" onClick={onCancel}>
            취소
          </Button>
          <Button variant={inside ? 'primary' : 'disabled'} className="flex-2" onClick={onConfirm}>
            이 위치로 등록
          </Button>
        </div>
      </section>
    </>
  );
}
