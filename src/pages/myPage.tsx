import { useNavigate } from 'react-router-dom';

import Edit from '@/assets/icons/edit.svg?react';
import Setting from '@/assets/icons/setting.svg?react';
import User from '@/assets/icons/user.svg?react';
import useInView from '@/hooks/useInView';

export default function MyPage() {
  const navigate = useNavigate();
  const [ref, isInView] = useInView();

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
        <button
          className="flex-1 flex flex-col items-center gap-10 px-20 py-4 cursor-pointer"
          onClick={() => navigate('/my-page/profile')}
        >
          <User className="w-16 h-16" />
          <p className="text-heading-3 text-coolgray-90">프로필 관리</p>
        </button>
        <div className="h-50 border-r border-coolgray-20" />
        <button
          className="flex-1 flex flex-col items-center gap-10 px-20 py-4 cursor-pointer"
          onClick={() => navigate('/my-page/academic-records')}
        >
          <Edit className="w-16 h-16" />
          <p className="text-heading-3 text-coolgray-90">내 학업 정보 관리</p>
        </button>
      </div>
    </div>
  );
}
