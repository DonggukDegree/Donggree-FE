import { Link } from 'react-router-dom';

import Headset from '@/assets/headset.svg?react';
import Logo from '@/assets/logo.svg?react';
import UserThumb from '@/assets/userThumb.svg?react';

const NAV_ITEMS = [
  { name: '졸업 판정', path: '/graduation' },
  { name: '커리큘럼', path: '/curriculum' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white text-coolgray-90">
      <div className="flex items-center justify-between py-2 px-16">
        <div className="flex items-center gap-12">
          <Link to="/">
            <Logo className="hover:cursor-pointer w-40 h-auto" />
          </Link>
          <div className="flex items-center gap-2 text-button-m">
            {NAV_ITEMS.map((item) => (
              <Link key={item.name} to={item.path} className="px-2 py-3 hover:text-primary-60 hover:cursor-pointer">
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-8 text-body-m">
          {/* TODO: 경로 수정 필요 */}
          <Link to="/" className="flex items-center gap-2 py-3 hover:cursor-pointer">
            <Headset className="w-5 h-5" />
            <span>고객지원</span>
          </Link>
          <Link to="/my-page" className="flex items-center gap-2 hover:cursor-pointer">
            <UserThumb className="w-8 h-8" />
            <span>마이페이지</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
