import { Link } from 'react-router-dom';

import Edit from '@/assets/icons/edit.svg?react';
import Setting from '@/assets/icons/setting.svg?react';
import User from '@/assets/icons/user.svg?react';
import Button from '@/components/common/button';
import useLogout from '@/hooks/auth/useLogout';
import useInView from '@/hooks/useInView';

export default function MyPage() {
  const [ref, isInView] = useInView();
  const { mutate: logout, isPending } = useLogout();

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center gap-15 p-20 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-12">
        <Setting className="w-20 h-20" />
        <p className="text-heading-2 text-coolgray-90">마이페이지</p>
      </div>
      <div className="w-full flex items-center justify-center">
        <Link className="flex-1 flex flex-col items-center gap-10 px-20 py-4 cursor-pointer" to="/my-page/profile">
          <User className="w-16 h-16" />
          <p className="text-heading-3 text-coolgray-90">프로필 관리</p>
        </Link>
        <div className="h-50 border-r border-coolgray-20" />
        <Link
          className="flex-1 flex flex-col items-center gap-10 px-20 py-4 cursor-pointer"
          to="/my-page/academic-records"
        >
          <Edit className="w-16 h-16" />
          <p className="text-heading-3 text-coolgray-90">내 학업 정보 관리</p>
        </Link>
      </div>
      {/* 마이페이지 하단 중앙 로그아웃 버튼 (탈퇴하기 버튼과 동일한 양식) */}
      <Button variant="alert" className="w-40" onClick={() => logout()} disabled={isPending}>
        로그아웃
      </Button>
    </div>
  );
}
