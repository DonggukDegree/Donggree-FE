/**
 * [마이페이지] 페이지 (/my-page)
 * 프로필 관리 · 내 학업 정보 관리로 가는 갈림길 화면이자 로그아웃 자리.
 * 제목 아래 내 포인트 카드를 눌러 포인트 적립 내역(/my-page/points)으로 간다.
 */
import { Link } from 'react-router-dom';

import Edit from '@/assets/icons/edit.svg?react';
import Setting from '@/assets/icons/setting.svg?react';
import User from '@/assets/icons/user.svg?react';
import Button from '@/components/common/inputs/button';
import useLogout from '@/hooks/auth/useLogout';
import usePointSummary from '@/hooks/point/usePointSummary';
import useInView from '@/hooks/useInView';
import { formatPoints } from '@/utils/point/point';

export default function MyPage() {
  const [ref, isInView] = useInView();
  const { mutate: logout, isPending } = useLogout();
  const { data: pointSummary } = usePointSummary();

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center gap-10 lg:gap-15 p-6 lg:p-20 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-8 lg:gap-12">
        <Setting className="w-10 h-10 lg:w-20 lg:h-20 shrink-0" />
        <p className="text-heading-4 lg:text-heading-2 text-coolgray-90">마이페이지</p>
      </div>
      {/* 포인트는 불러오는 중이거나 실패하면 숫자 대신 "-"로 두고, 눌러서 내역에서 다시 확인하게 한다. */}
      <Link
        to="/my-page/points"
        className="flex w-full max-w-100 items-center justify-between gap-4 rounded-2xl bg-primary-30 px-6 py-4 hover:brightness-97"
      >
        <span className="text-body-m text-coolgray-90">내 포인트</span>
        <span className="flex items-center gap-2">
          <span className="text-heading-5 text-primary-60">
            {pointSummary ? formatPoints(pointSummary.totalPoints) : '-'}
          </span>
          <span aria-hidden="true" className="text-body-m text-coolgray-60">
            ›
          </span>
        </span>
      </Link>
      {/* 두 갈림길은 모바일에서 좌우로 나누기엔 좁아 위아래로 쌓고, 구분선도 가로로 눕힌다. */}
      <div className="w-full flex flex-col lg:flex-row items-center justify-center">
        <Link
          className="w-full lg:w-auto flex-1 flex flex-col items-center gap-6 lg:gap-10 px-6 lg:px-20 py-4 cursor-pointer"
          to="/my-page/profile"
        >
          <User className="w-8 h-8 lg:w-16 lg:h-16 shrink-0" />
          <p className="text-heading-6 lg:text-heading-3 text-coolgray-90">프로필 관리</p>
        </Link>
        <div className="w-full border-b lg:w-auto lg:h-50 lg:border-b-0 lg:border-r border-coolgray-20" />
        <Link
          className="w-full lg:w-auto flex-1 flex flex-col items-center gap-6 lg:gap-10 px-6 lg:px-20 py-4 cursor-pointer"
          to="/my-page/academic-records"
        >
          <Edit className="w-8 h-8 lg:w-16 lg:h-16 shrink-0" />
          <p className="text-heading-6 lg:text-heading-3 text-coolgray-90">내 학업 정보 관리</p>
        </Link>
      </div>
      {/* 마이페이지 하단 중앙 로그아웃 버튼 (탈퇴하기 버튼과 동일한 양식) */}
      <Button variant="alert" className="w-40 max-w-full" onClick={() => logout()} disabled={isPending}>
        로그아웃
      </Button>
    </div>
  );
}
