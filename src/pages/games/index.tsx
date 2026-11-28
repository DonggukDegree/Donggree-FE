/**
 * [미니 게임] 페이지 (/games)
 * 정각원의 비밀 · 울타리치기로 가는 갈림길 화면. 마이페이지처럼 두 갈래 사이에 구분선을 둔다.
 * 모바일은 위아래로 쌓고 구분선을 가로로 눕힌다.
 */
import { Link } from 'react-router-dom';

import FenceGameIcon from '@/assets/games/fenceGame.svg?react';
import MysteryGameIcon from '@/assets/games/mysteryGame.svg?react';
import useInView from '@/hooks/useInView';
import { trackEvent } from '@/utils/analytics/analytics';

const GAMES = [
  {
    name: 'mystery',
    path: '/mystery',
    title: '정각원의 비밀',
    description: '매일 한 문제, 연등을 가져간 범인을 추리해요',
    tag: '하루 한 문제',
    Icon: MysteryGameIcon,
  },
  {
    name: 'fence',
    path: '/slitherlink',
    title: '울타리치기',
    description: '점을 이어 하나의 울타리를 완성하는 슬리더링크 퍼즐',
    tag: '무한 랜덤',
    Icon: FenceGameIcon,
  },
] as const;

export default function Games() {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center gap-10 lg:gap-15 p-6 lg:p-20 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-heading-4 lg:text-heading-2 text-coolgray-90">미니 게임</p>
        <p className="text-body-s lg:text-body-m text-coolgray-60">잠깐 쉬어 가며 한 판 즐겨 보세요</p>
      </div>
      <div className="w-full flex flex-col lg:flex-row items-center justify-center">
        {GAMES.map((game, index) => (
          <div key={game.name} className="contents">
            {index > 0 && (
              <div className="w-full border-b lg:w-auto lg:h-60 lg:border-b-0 lg:border-r border-coolgray-20" />
            )}
            <Link
              to={game.path}
              onClick={() => trackEvent('game_select', { game_name: game.name })}
              className="group w-full lg:w-auto flex-1 flex flex-col items-center gap-4 lg:gap-6 px-6 lg:px-16 py-6 cursor-pointer"
            >
              <game.Icon className="w-24 h-24 lg:w-36 lg:h-36 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105" />
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-heading-6 lg:text-heading-3 text-coolgray-90">{game.title}</p>
                <p className="text-body-s text-coolgray-60 break-keep">{game.description}</p>
                <span className="rounded-full bg-coolgray-10 px-3 py-1 text-body-xs text-coolgray-60">{game.tag}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
