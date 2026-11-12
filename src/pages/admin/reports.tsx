/**
 * [관리자 > 신고 관리] 페이지 (/admin/reports)
 * 장소 신고·리뷰 신고·회원을 탭으로 나눠 처리하는 통합 신고 대시보드. 신고 안의 회원 행을 누르면 회원 탭에서
 * 그 회원 상세(받은 신고·정지 이력)로 넘어간다. 신고 접수 알림은 디스코드로 온다.
 */
import { useState } from 'react';

import MemberPanel from '@/components/admin/report/memberPanel';
import PlaceReportPanel from '@/components/admin/report/placeReportPanel';
import ReviewReportPanel from '@/components/admin/report/reviewReportPanel';

type TTab = 'places' | 'reviews' | 'members';

const TABS: { value: TTab; label: string }[] = [
  { value: 'places', label: '장소 신고' },
  { value: 'reviews', label: '리뷰 신고' },
  { value: 'members', label: '회원' },
];

export default function AdminReports() {
  const [tab, setTab] = useState<TTab>('places');
  const [memberId, setMemberId] = useState<number | null>(null);
  const openMember = (id: number) => {
    setMemberId(id);
    setTab('members');
  };

  return (
    <main className="flex-1 bg-primary-30/30 px-10 py-12">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-3 text-coolgray-90">신고 관리</h1>
          <p className="text-body-m text-coolgray-90">
            동글맵 장소·리뷰 신고를 확인해 숨김·되돌리기·처리 완료·기각하고, 필요하면 회원을 정지합니다. 서로 다른 회원
            3명이 신고한 장소·리뷰는 자동으로 숨겨져 있어요.
          </p>
        </div>
        <div role="tablist" aria-label="신고 관리" className="flex gap-2">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              onClick={() => setTab(item.value)}
              className={`cursor-pointer rounded-lg px-5 py-2.5 text-button-m ${
                tab === item.value ? 'bg-primary-60 text-white' : 'bg-white text-coolgray-90 hover:text-primary-90'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === 'places' && <PlaceReportPanel onSelectMember={openMember} />}
        {tab === 'reviews' && <ReviewReportPanel onSelectMember={openMember} />}
        {tab === 'members' && <MemberPanel selectedId={memberId} onSelect={setMemberId} />}
      </div>
    </main>
  );
}
