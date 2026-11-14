/**
 * [동글맵] 페이지 (/map)
 * 로그인 회원 누구나 캠퍼스 주변 장소를 지도에서 본다. 장소 선택은 ?place={id}로 주소창에 남겨
 * 링크로 공유할 수 있고, 뒤로 가기로 시트를 닫는다.
 *
 * 카카오 지도는 표시용으로만 쓰고, 장소 데이터는 동그리 서버에서 받는다.
 * 장소 추가(주황 + 버튼)는 인증 학생만 진행하며, 지도 중심 핀으로 위치를 정한 뒤 입력 폼으로 넘어간다.
 * 장소 정보 시트의 정보 수정·신고도 인증 학생만 진행한다. 수정 폼을 닫으면 같은 장소 시트로 돌아오고,
 * 신고 모달은 시트 위에 띄운다.
 * 레이아웃은 /map에서만 폭 제한·푸터를 풀고 헤더 아래 화면 전체를 지도로 쓴다.
 * 이 브라우저에서 튜토리얼을 끝까지 본 적이 없으면 처음 들어올 때 4단계 튜토리얼 모달을 띄운다.
 */
import { useEffect, useRef, useState } from 'react';
import { Map as KakaoMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import Plus from '@/assets/icons/plus.svg?react';
import School from '@/assets/icons/school.svg?react';
import Loading from '@/components/common/feedback/loading';
import PlaceCategoryChips from '@/components/map/placeCategoryChips';
import PlaceInfoEditForm from '@/components/map/placeInfoEditForm';
import PlaceMarkers from '@/components/map/placeMarkers';
import PlaceRegisterForm from '@/components/map/placeRegisterForm';
import PlaceRegisterLocator from '@/components/map/placeRegisterLocator';
import PlaceReportDialog from '@/components/map/placeReportDialog';
import PlaceSheet from '@/components/map/placeSheet';
import { CAMPUS_CENTER, MAP_INITIAL_LEVEL, MAP_MAX_LEVEL, MAP_MIN_LEVEL } from '@/constants/place';
import usePlaces from '@/hooks/place/usePlaces';
import useUserInfo from '@/hooks/user/useUserInfo';
import { useModalStore } from '@/stores/modalStore';
import type { TPlaceCategory, TPlaceDetail, TPlaceSubCategory, TPlaceSummary, TPlaceTag } from '@/types/place/TPlace';
import type { TLatLng } from '@/types/place/TPlaceForm';
import { trackEvent } from '@/utils/analytics/analytics';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { hasSeenMapOnboarding } from '@/utils/place/mapOnboarding';
import {
  ALL_PLACES_FILTER,
  filterPlaces,
  parsePlaceIdParam,
  selectCategoryFilter,
  toggleHiddenGemFilter,
  toggleSubCategoryFilter,
  toggleTagFilter,
  type TPlaceFilter,
} from '@/utils/place/place';
import { canWritePlace } from '@/utils/place/placeForm';

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
type TMapMode = 'browse' | 'locate' | 'form' | 'edit';
const MAP_ZOOM_BUTTON_CLASS =
  'flex h-12 w-12 cursor-pointer items-center justify-center text-heading-5 text-coolgray-90 hover:text-primary-60 disabled:cursor-default disabled:text-coolgray-30';

export default function DonggleMap() {
  // 키가 없으면 SDK를 부르지 않는다. (로더 훅은 조건부로 호출할 수 없어 화면을 나눈다)
  if (!KAKAO_MAP_KEY) return <MapUnavailable />;
  return <DonggleMapView appKey={KAKAO_MAP_KEY} />;
}

function DonggleMapView({ appKey }: { appKey: string }) {
  const [isSdkLoading, sdkError] = useKakaoLoader({ appkey: appKey, libraries: ['services', 'clusterer'] });
  if (sdkError) return <MapUnavailable />;
  if (isSdkLoading) return <Loading />;
  return <DonggleMapCanvas />;
}

function DonggleMapCanvas() {
  const { data: places, isError, error, refetch } = usePlaces();
  const { data: user } = useUserInfo();
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  const [filter, setFilter] = useState<TPlaceFilter>(ALL_PLACES_FILTER);
  const [level, setLevel] = useState(MAP_INITIAL_LEVEL);
  // 등록 흐름: browse(둘러보기) → locate(핀 위치 지정) → form(입력). 등록 위치는 locate 확정 시점에 고정한다.
  const [mode, setMode] = useState<TMapMode>('browse');
  const [center, setCenter] = useState<TLatLng>(CAMPUS_CENTER);
  const [registerPoint, setRegisterPoint] = useState<TLatLng | null>(null);
  // 수정 폼은 시트에서 본 장소 값과 버전으로 채운다. 선택 장소(?place=)는 그대로 두어 닫으면 시트로 돌아온다.
  const [editingPlace, setEditingPlace] = useState<TPlaceDetail | null>(null);
  const [reportingPlace, setReportingPlace] = useState<TPlaceDetail | null>(null);
  // 겹친 장소 묶음 핀의 목록. 지도를 누르거나 확대·축소하면 닫는다.
  const [openGroupKey, setOpenGroupKey] = useState<number | null>(null);
  const mapRef = useRef<kakao.maps.Map>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedId = parsePlaceIdParam(searchParams.get('place'));
  const visiblePlaces = filterPlaces(places ?? [], filter);
  // 세부 칩 줄이 열리면 안내 문구를 그 아래로 내린다.
  const hasSubChipRow = filter.mode === 'hiddenGem' || filter.category !== null;
  const bannerTop = hasSubChipRow ? 'top-26' : 'top-16';
  const isBrowsing = mode === 'browse';

  useEffect(() => {
    if (isError) trackErrorShown('donggle_map', error, true);
  }, [isError, error]);

  // 튜토리얼은 전역 모달이라, 뒤로 가기 등으로 지도를 떠나면 다른 화면에 남지 않도록 닫는다.
  useEffect(() => {
    if (!hasSeenMapOnboarding()) useModalStore.getState().openMapOnboarding();
    return () => {
      if (useModalStore.getState().type === 'mapOnboarding') useModalStore.getState().closeModal();
    };
  }, []);

  // 링크로 바로 들어온 경우에도 선택한 장소가 화면에 보이도록 옮긴다.
  useEffect(() => {
    const target = places?.find((place) => place.id === selectedId);
    if (target) mapRef.current?.panTo(new kakao.maps.LatLng(target.latitude, target.longitude));
  }, [places, selectedId]);

  // 시트를 처음 열 때만 기록을 쌓아 뒤로 가기로 닫히게 하고, 열린 상태에서 다른 장소를 고르면 교체한다.
  const showPlace = (placeId: number) =>
    setSearchParams({ place: String(placeId) }, { replace: selectedId !== null, state: { placeOpened: true } });

  const openPlace = (place: TPlaceSummary) => {
    trackEvent('place_select', { place_category: place.category });
    showPlace(place.id);
  };

  const closePlace = () => {
    if ((location.state as { placeOpened?: boolean } | null)?.placeOpened) navigate(-1);
    else setSearchParams({}, { replace: true });
  };

  // 칩을 바꾸면 펼쳐 둔 겹친 장소 목록은 닫는다.
  const changeFilter = (next: TPlaceFilter) => {
    setFilter(next);
    setOpenGroupKey(null);
  };

  const selectCategory = (next: TPlaceCategory | null) => {
    trackEvent('place_category_select', { place_category: next ?? 'ALL' });
    changeFilter(selectCategoryFilter(filter, next));
  };

  const toggleHiddenGem = () => {
    if (filter.mode !== 'hiddenGem') trackEvent('place_category_select', { place_category: 'HIDDEN_GEM' });
    changeFilter(toggleHiddenGemFilter(filter));
  };

  const toggleSubCategory = (subCategory: TPlaceSubCategory) => {
    trackEvent('place_sub_filter_select', { place_filter: subCategory });
    changeFilter(toggleSubCategoryFilter(filter, subCategory));
  };

  const toggleTag = (tag: TPlaceTag) => {
    trackEvent('place_sub_filter_select', { place_filter: tag });
    changeFilter(toggleTagFilter(filter, tag));
  };

  // 지도 레벨은 숫자가 작을수록 확대. 레벨 변경은 onZoomChanged로 상태에 다시 반영된다.
  const zoomBy = (delta: number) => {
    const next = Math.min(MAP_MAX_LEVEL, Math.max(MAP_MIN_LEVEL, level + delta));
    if (next !== level) mapRef.current?.setLevel(next, { animate: true });
  };

  const moveToCampus = () => {
    mapRef.current?.setLevel(MAP_INITIAL_LEVEL);
    mapRef.current?.panTo(new kakao.maps.LatLng(CAMPUS_CENTER.lat, CAMPUS_CENTER.lng));
  };

  // 미인증 회원은 버튼은 보되 누르면 인증 안내를 받는다. 서버도 쓰기 요청마다 다시 검증한다.
  const startRegister = () => {
    if (!canWritePlace(user)) {
      openStudentVerification();
      return;
    }
    trackEvent('place_register_start');
    if (selectedId !== null) setSearchParams({}, { replace: true });
    setMode('locate');
  };

  const startEdit = (place: TPlaceDetail) => {
    if (!canWritePlace(user)) {
      openStudentVerification();
      return;
    }
    trackEvent('place_edit_start', { place_category: place.category });
    setEditingPlace(place);
    setMode('edit');
  };

  const startReport = (place: TPlaceDetail) => {
    if (!canWritePlace(user)) {
      openStudentVerification();
      return;
    }
    trackEvent('place_report_start', { place_category: place.category });
    setReportingPlace(place);
  };

  const finishEdit = () => {
    setMode('browse');
    setEditingPlace(null);
  };

  const confirmLocation = () => {
    setRegisterPoint(center);
    setMode('form');
  };

  const finishRegister = (placeId: number) => {
    setMode('browse');
    setRegisterPoint(null);
    setFilter(ALL_PLACES_FILTER);
    showPlace(placeId);
  };

  return (
    <div className="relative min-h-0 w-full flex-1 overflow-hidden">
      <KakaoMap
        ref={mapRef}
        center={CAMPUS_CENTER}
        level={MAP_INITIAL_LEVEL}
        // react-kakao-maps-sdk의 minLevel은 카카오 setMaxLevel(가장 넓게 보는 레벨)에 대응한다. 이름이 반대라 주의.
        minLevel={MAP_MAX_LEVEL}
        className="h-full w-full"
        onZoomChanged={(map) => {
          setLevel(map.getLevel());
          setOpenGroupKey(null);
        }}
        onClick={() => setOpenGroupKey(null)}
        onIdle={(map) => {
          const next = map.getCenter();
          setCenter({ lat: next.getLat(), lng: next.getLng() });
        }}
      >
        {isBrowsing && (
          <PlaceMarkers
            places={visiblePlaces}
            level={level}
            selectedId={selectedId}
            onSelect={openPlace}
            openGroupKey={openGroupKey}
            onToggleGroup={setOpenGroupKey}
            hiddenGemMode={filter.mode === 'hiddenGem'}
          />
        )}
      </KakaoMap>

      {isBrowsing && (
        <div className={`absolute inset-x-0 top-3 z-20 ${selectedId !== null ? 'lg:left-100' : ''}`}>
          <PlaceCategoryChips
            filter={filter}
            onSelectCategory={selectCategory}
            onToggleHiddenGem={toggleHiddenGem}
            onToggleSubCategory={toggleSubCategory}
            onToggleTag={toggleTag}
          />
        </div>
      )}

      {isBrowsing && isError && (
        <div className={`absolute inset-x-0 ${bannerTop} z-20 flex justify-center px-4`}>
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer rounded-full bg-coolgray-90 px-4 py-2 text-body-s text-white shadow-md"
          >
            장소를 불러오지 못했어요. 다시 시도
          </button>
        </div>
      )}
      {isBrowsing && places && visiblePlaces.length === 0 && (
        <p
          className={`absolute inset-x-0 ${bannerTop} z-20 mx-auto w-fit rounded-full bg-white px-4 py-2 text-body-s text-coolgray-60 shadow-md`}
        >
          {places.length === 0
            ? '아직 등록된 장소가 없어요. 첫 장소를 등록해보세요.'
            : filter.mode === 'hiddenGem'
              ? '아직 이 조건의 숨은 맛집이 없어요.'
              : '이 조건에 맞는 장소가 없어요.'}
        </p>
      )}

      {(mode === 'browse' || mode === 'locate') && (
        <div
          className={`absolute right-4 z-20 flex flex-col items-center gap-3 transition-[bottom] duration-200 ${
            mode === 'locate'
              ? 'bottom-56 lg:bottom-6'
              : selectedId !== null
                ? 'bottom-[calc(42%+16px)] lg:bottom-6'
                : 'bottom-6'
          }`}
        >
          <div className="flex flex-col overflow-hidden rounded-full bg-white shadow-md">
            <button
              type="button"
              aria-label="지도 확대"
              onClick={() => zoomBy(-1)}
              disabled={level <= MAP_MIN_LEVEL}
              className={MAP_ZOOM_BUTTON_CLASS}
            >
              <span aria-hidden="true">+</span>
            </button>
            <span aria-hidden="true" className="mx-3 h-px bg-coolgray-10" />
            <button
              type="button"
              aria-label="지도 축소"
              onClick={() => zoomBy(1)}
              disabled={level >= MAP_MAX_LEVEL}
              className={MAP_ZOOM_BUTTON_CLASS}
            >
              <span aria-hidden="true">−</span>
            </button>
          </div>
          <button
            type="button"
            aria-label="학교로 이동"
            onClick={moveToCampus}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-coolgray-90 shadow-md hover:text-primary-60"
          >
            <School aria-hidden="true" className="h-6 w-6" />
          </button>
          {/* 확대(+)와 헷갈리지 않도록 장소 추가는 주황 채움 원으로 구분한다. */}
          {isBrowsing && (
            <button
              type="button"
              aria-label="장소 추가"
              onClick={startRegister}
              className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary-60 text-white shadow-lg hover:opacity-90"
            >
              <Plus aria-hidden="true" className="h-7 w-7" />
            </button>
          )}
        </div>
      )}

      {isBrowsing && selectedId !== null && (
        <PlaceSheet
          key={selectedId}
          placeId={selectedId}
          onClose={closePlace}
          onEdit={startEdit}
          onReport={startReport}
        />
      )}
      {mode === 'edit' && editingPlace && <PlaceInfoEditForm place={editingPlace} onClose={finishEdit} />}
      {isBrowsing && reportingPlace && reportingPlace.id === selectedId && (
        <PlaceReportDialog place={reportingPlace} onClose={() => setReportingPlace(null)} />
      )}
      {mode === 'locate' && (
        <PlaceRegisterLocator center={center} onConfirm={confirmLocation} onCancel={() => setMode('browse')} />
      )}
      {mode === 'form' && registerPoint && (
        <PlaceRegisterForm
          point={registerPoint}
          onBack={() => setMode('locate')}
          onRegistered={finishRegister}
          onSelectExisting={(placeId) => {
            setMode('browse');
            setRegisterPoint(null);
            showPlace(placeId);
          }}
        />
      )}
    </div>
  );
}

function MapUnavailable() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <p className="text-center text-body-m text-coolgray-60">
        지도를 불러오지 못했어요.
        <br />
        잠시 후 다시 시도해주세요.
      </p>
    </div>
  );
}
