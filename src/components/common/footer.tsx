import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import Github from '@/assets/github.svg?react';
import Logo from '@/assets/logo.svg?react';
import { KAKAO_CHAT_URL, PRIVACY_POLICY_URL, READY_MESSAGE, TERMS_OF_SERVICE_URL } from '@/constants/links';

// 항목별 동작 구분: 실제 페이지(link), 외부 링크(external), 미개발 안내(toast).
const NAV_ITEMS = [
  { name: '졸업 판정', type: 'link', path: '/graduation' },
  { name: '커리큘럼', type: 'toast' },
  { name: '고객지원', type: 'external', href: KAKAO_CHAT_URL },
  { name: '동그리 소개', type: 'toast' },
  { name: '자주 묻는 질문', type: 'toast' },
  { name: '개인정보처리방침', type: 'external', href: PRIVACY_POLICY_URL },
  { name: '서비스이용약관', type: 'external', href: TERMS_OF_SERVICE_URL },
] as const;

// 모든 항목이 공유하는 스타일.
const ITEM_CLASS = 'px-2 py-3 hover:text-primary-60 hover:cursor-pointer';

export default function Footer() {
  return (
    <footer className="w-full pt-6 pb-14 px-16 flex flex-col items-center gap-6">
      <div className="w-full flex items-center justify-between">
        <Link to="/">
          <Logo className="hover:cursor-pointer w-40 h-auto" />
        </Link>
        <a href="https://github.com/DonggukDegree" target="_blank" rel="noreferrer" className="hover:cursor-pointer">
          <Github className="w-8 h-8" />
        </a>
      </div>
      <div className="w-full flex items-center justify-center text-button-m text-coolgray-60 gap-5 border-t border-b border-coolgray-30 py-9">
        {NAV_ITEMS.map((item) => {
          // 실제 페이지로 연결.
          if (item.type === 'link') {
            return (
              <Link key={item.name} to={item.path} className={ITEM_CLASS}>
                {item.name}
              </Link>
            );
          }
          // 외부 링크(고객지원 카카오 채팅).
          if (item.type === 'external') {
            return (
              <a key={item.name} href={item.href} target="_blank" rel="noreferrer" className={ITEM_CLASS}>
                {item.name}
              </a>
            );
          }
          // 미개발 기능: 토스트로 준비 중임을 안내.
          return (
            <button key={item.name} type="button" onClick={() => toast(READY_MESSAGE)} className={ITEM_CLASS}>
              {item.name}
            </button>
          );
        })}
      </div>
      <p className="text-body-xs text-coolgray-60">Copyright 2026. Donggree All rights reserved.</p>
    </footer>
  );
}
