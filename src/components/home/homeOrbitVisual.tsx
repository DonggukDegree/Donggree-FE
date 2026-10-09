/** [홈 > 브랜드 비주얼] 동그리 궤도 애니메이션 */
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef, useState } from 'react';

import Icon from '@/assets/icon.svg?react';
import Chart from '@/assets/icons/chart.svg?react';
import Inbox from '@/assets/icons/inbox.svg?react';
import Rocket from '@/assets/icons/rocket.svg?react';

gsap.registerPlugin(useGSAP);

// 렌더마다 별 위치가 유지되도록 고정 수열을 사용한다.
const STARS = Array.from({ length: 36 }, (_, index) => ({
  id: index,
  x: 30 + ((index * 137) % 500),
  y: 25 + ((index * 89) % 460),
  radius: index % 5 === 0 ? 2.5 : 1.3,
}));

export default function HomeOrbitVisual() {
  const scene = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  useGSAP(
    () => {
      const root = scene.current;
      if (!root || paused) return;
      const media = gsap.matchMedia();
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          const orbit = gsap.timeline({ repeat: -1, paused: true });
          orbit
            .to('.home-orbit-track', { rotation: 360, svgOrigin: '280 260', duration: 65, ease: 'none' }, 0)
            .to(
              '.home-star',
              { opacity: 0.2, duration: 2.5, stagger: { each: 0.08, repeat: 11, yoyo: true }, ease: 'sine.inOut' },
              0,
            );
          const float = gsap.to('.home-orbit-icon', {
            y: -12,
            rotation: 3,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            paused: true,
          });
          const cards = gsap.to('.home-orbit-card', {
            y: -7,
            duration: 2.6,
            stagger: 0.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            paused: true,
          });
          let visible = false;
          const sync = () => {
            const running = visible && !document.hidden;
            orbit.paused(!running);
            float.paused(!running);
            cards.paused(!running);
          };
          const observer = new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? false;
            sync();
          });
          observer.observe(root);
          document.addEventListener('visibilitychange', sync);
          return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', sync);
          };
        },
        root,
      );
      media.add(
        '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
        () => {
          const layer = root.querySelector('.home-orbit-pointer');
          if (!layer) return;
          const xTo = gsap.quickTo(layer, 'x', { duration: 0.8, ease: 'power3.out' });
          const yTo = gsap.quickTo(layer, 'y', { duration: 0.8, ease: 'power3.out' });
          const move = (event: PointerEvent) => {
            const bounds = root.getBoundingClientRect();
            xTo((event.clientX - bounds.left - bounds.width / 2) * 0.04);
            yTo((event.clientY - bounds.top - bounds.height / 2) * 0.04);
          };
          const reset = () => {
            xTo(0);
            yTo(0);
          };
          root.addEventListener('pointermove', move);
          root.addEventListener('pointerleave', reset);
          return () => {
            root.removeEventListener('pointermove', move);
            root.removeEventListener('pointerleave', reset);
          };
        },
        root,
      );
      return () => media.revert();
    },
    { scope: scene, dependencies: [paused], revertOnUpdate: true },
  );

  return (
    <div ref={scene} className="home-orbit-visual">
      <div className="home-orbit-parallax">
        <div className="home-orbit-pointer">
          <svg viewBox="0 0 560 520" className="home-starfield" fill="none" aria-hidden="true">
            <circle cx="280" cy="260" r="210" className="home-orbit-disc" />
            <ellipse cx="280" cy="260" rx="250" ry="157" transform="rotate(-25 280 260)" className="home-orbit-line" />
            <ellipse cx="280" cy="260" rx="240" ry="182" transform="rotate(32 280 260)" className="home-orbit-line" />
            <circle cx="280" cy="260" r="238" className="home-orbit-line home-orbit-dashed" />
            {STARS.map((star) => (
              <circle key={star.id} cx={star.x} cy={star.y} r={star.radius} className="home-star" />
            ))}
            <g className="home-orbit-track">
              <circle cx="280" cy="22" r="6" className="home-orbit-planet" />
              <circle cx="280" cy="498" r="3" className="home-orbit-planet" />
            </g>
            <path d="M465 125v18m-9-9h18M99 356v12m-6-6h12" className="home-orbit-spark" />
          </svg>
          <div className="home-orbit-brand">
            <Icon className="home-orbit-icon" role="img" aria-label="동그리 심볼" />
          </div>
          <div className="home-orbit-card home-orbit-upload">
            <Inbox aria-hidden="true" />
            <span className="text-heading-6">PDF 한 장</span>
          </div>
          <div className="home-orbit-card home-orbit-analyze">
            <Chart aria-hidden="true" />
            <span className="text-heading-6">자동 분석</span>
          </div>
          <div className="home-orbit-card home-orbit-result">
            <Rocket aria-hidden="true" />
            <span className="text-heading-6">나만의 졸업 계획</span>
          </div>
        </div>
      </div>
      <button
        className="home-motion-toggle text-body-xs text-coolgray-60"
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? '배경 재생' : '배경 일시정지'} <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
      </button>
    </div>
  );
}
