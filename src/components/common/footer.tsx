import { useNavigate } from 'react-router-dom';

import Github from '@/assets/github.svg?react';
import Logo from '@/assets/logo.svg?react';

{
  /* TODO: 경로 수정 필요 */
}
const NAV_ITEMS = [
  { name: '졸업 판정', path: '/graduation' },
  { name: '커리큘럼', path: '/curriculum' },
  { name: '고객지원', path: '/' },
  { name: '동그리 소개', path: '/' },
  { name: '자주 묻는 질문', path: '/' },
  { name: '개인정보처리방침', path: '/' },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="w-full pt-6 pb-14 px-20 flex flex-col items-center gap-6">
      <div className="w-full flex items-center justify-between">
        <Logo onClick={() => navigate('/')} className="hover:cursor-pointer" />
        <button
          onClick={() => window.open('https://github.com/DonggukDegree', '_blank')}
          className="hover:cursor-pointer"
        >
          <Github />
        </button>
      </div>
      <div className="flex items-center text-button-m text-coolgray-60 gap-5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="px-2 py-3 hover:text-primary-60 hover:cursor-pointer"
          >
            {item.name}
          </button>
        ))}
      </div>
      <p className="text-body-xs text-coolgray-60">Copyright 2026. Donggree All rights reserved.</p>
    </footer>
  );
}
