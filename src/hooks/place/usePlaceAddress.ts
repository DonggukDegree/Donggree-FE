import { useEffect, useState } from 'react';

type TAddressResult = { key: string; address: string | null };

/**
 * [동글맵] 좌표의 주소를 카카오 Geocoder로 실시간 조회한다.
 * 카카오 운영정책상 응답 저장이 금지라 쿼리 캐시에 넣지 않고 화면에 띄울 때마다 새로 조회한다.
 * 결과를 좌표 키와 함께 두어, 좌표가 바뀌면 이전 주소 대신 조회 중으로 보이게 한다.
 * 카카오 SDK(services)가 로드된 뒤에만 호출해야 한다.
 */
export default function usePlaceAddress(latitude: number | null, longitude: number | null) {
  const [result, setResult] = useState<TAddressResult | null>(null);
  const key = latitude === null || longitude === null ? null : `${latitude},${longitude}`;

  useEffect(() => {
    if (key === null || latitude === null || longitude === null) return;
    if (typeof kakao === 'undefined' || !kakao.maps.services) return;
    let cancelled = false;
    new kakao.maps.services.Geocoder().coord2Address(longitude, latitude, (addresses, status) => {
      if (cancelled) return;
      const first = status === kakao.maps.services.Status.OK ? addresses[0] : undefined;
      setResult({ key, address: first?.road_address?.address_name ?? first?.address?.address_name ?? null });
    });
    return () => {
      cancelled = true;
    };
  }, [key, latitude, longitude]);

  const isCurrent = key !== null && result?.key === key;
  return { address: isCurrent ? result.address : null, isLoading: key !== null && !isCurrent };
}
