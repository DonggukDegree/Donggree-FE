import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import Headset from '@/assets/headset.svg?react';
import Logo from '@/assets/logo.svg?react';
import UserThumb from '@/assets/userThumb.svg?react';
import { KAKAO_CHAT_URL, READY_MESSAGE } from '@/constants/links';

// 졸업 판정만 실제 페이지로 연결하고, 커리큘럼은 아직 미개발이라 토스트로 안내한다.
const NAV_ITEMS = [
  { name: '졸업 판정', type: 'link', path: '/graduation' },
  { name: '커리큘럼', type: 'toast' },
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white text-coolgray-90">
      <div className="flex items-center justify-between py-2 px-16">
        <div className="flex items-center gap-12">
          <Link to="/">
            <Logo className="hover:cursor-pointer w-40 h-auto" />
          </Link>
          <div className="flex items-center gap-2 text-button-m">
            {NAV_ITEMS.map((item) =>
              item.type === 'link' ? (
                <Link key={item.name} to={item.path} className="px-2 py-3 hover:text-primary-60 hover:cursor-pointer">
                  {item.name}
                </Link>
              ) : (
                // 미개발 기능: 토스트로 준비 중임을 안내한다.
                <button
                  key={item.name}
                  type="button"
                  onClick={() => toast(READY_MESSAGE)}
                  className="px-2 py-3 hover:text-primary-60 hover:cursor-pointer"
                >
                  {item.name}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="flex items-center gap-8 text-body-m">
          {/* 고객지원: 카카오 채널 채팅으로 연결 */}
          <a
            href={KAKAO_CHAT_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 py-3 hover:cursor-pointer"
          >
            <Headset className="w-5 h-5" />
            <span>고객지원</span>
          </a>
          <Link to="/my-page" className="flex items-center gap-2 hover:cursor-pointer">
            <UserThumb className="w-8 h-8" />
            <span>마이페이지</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
