import { useNavigate } from 'react-router-dom';

import Headset from '@/assets/headset.svg?react';
import Logo from '@/assets/logo.svg?react';
import UserThumb from '@/assets/userThumb.svg?react';

const NAV_ITEMS = [
  { name: '졸업 판정', path: '/graduation' },
  { name: '커리큘럼', path: '/curriculum' },
];

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 w-full bg-white text-button-m text-coolgray-90">
      <div className="flex items-center justify-between py-5 px-20">
        <div className="flex items-center gap-12">
          <Logo onClick={() => navigate('/')} className="hover:cursor-pointer" />
          <div className="flex items-center gap-2">
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
        </div>
        <div className="flex items-center gap-8">
          {/* TODO: 경로 수정 필요 */}
          <button className="flex items-center gap-2 py-3 hover:cursor-pointer" onClick={() => navigate('/')}>
            <Headset />
            <span>고객지원</span>
          </button>
          <button className="flex items-center gap-2 hover:cursor-pointer" onClick={() => navigate('/my-page')}>
            <UserThumb />
            <span>마이페이지</span>
          </button>
        </div>
      </div>
    </header>
  );
}
