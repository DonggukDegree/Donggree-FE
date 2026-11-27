/**
 * [관리자 > 동아리 관리] 페이지 (/admin/clubs)
 * 요청 관리(등록·수정·모집 승인/반려), 동아리(임시 등록·정보 수정·직접 수정 권한 회수), 배너(목록 상단 광고) 탭.
 * 탭은 주소의 ?tab=requests|clubs|banners로 기억해, 임시 등록·정보 수정을 마치고 돌아오면 같은 탭이 열린다.
 * 승인·임시 등록·배너 저장은 동아리 쇼핑 공개 화면에 바로 반영된다.
 */
import { useSearchParams } from 'react-router-dom';

import ClubBannerPanel from '@/components/admin/club/clubBannerPanel';
import ClubManagePanel from '@/components/admin/club/clubManagePanel';
import ClubRequestPanel from '@/components/admin/club/clubRequestPanel';

type TTab = 'requests' | 'clubs' | 'banners';

const TABS: { value: TTab; label: string }[] = [
  { value: 'requests', label: '요청 관리' },
  { value: 'clubs', label: '동아리' },
  { value: 'banners', label: '배너' },
];

const isTab = (value: string | null): value is TTab => TABS.some((tab) => tab.value === value);

export default function AdminClubs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get('tab');
  const tab: TTab = isTab(param) ? param : 'requests';

  return (
    <main className="flex-1 bg-primary-30/30 px-6 pt-10 pb-24 xl:px-10 xl:pt-12">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-3 text-coolgray-90">동아리 관리</h1>
          <p className="break-keep text-body-m text-coolgray-90">
            회원의 동아리 등록·정보 수정·모집 등록 요청을 확인해 승인하거나 반려합니다. 승인하면 동아리 쇼핑에 바로
            반영되고 요청자에게 그 동아리의 직접 수정 권한이 생겨요. 동아리 탭에서 임시 등록·정보 수정·권한 회수를, 배너
            탭에서 목록 상단 광고 배너를 관리해요.
          </p>
        </div>
        <div role="tablist" aria-label="동아리 관리" className="flex gap-2">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              onClick={() => setSearchParams({ tab: item.value }, { replace: true })}
              className={`cursor-pointer rounded-lg px-5 py-2.5 text-button-m ${
                tab === item.value ? 'bg-primary-60 text-white' : 'bg-white text-coolgray-90 hover:text-primary-90'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === 'requests' && <ClubRequestPanel />}
        {tab === 'clubs' && <ClubManagePanel />}
        {tab === 'banners' && <ClubBannerPanel />}
      </div>
    </main>
  );
}
