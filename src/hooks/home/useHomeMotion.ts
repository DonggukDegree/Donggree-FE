/** [홈 > 모션] 페이지 스크롤 연출 */
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function useHomeMotion(container: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;
      const media = gsap.matchMedia();
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          gsap
            .timeline({ defaults: { duration: 0.8, ease: 'power3.out' } })
            .from('[data-hero-enter]', { autoAlpha: 0, y: 24, stagger: 0.1 })
            .from('.home-orbit-visual', { autoAlpha: 0, scale: 0.9, duration: 1 }, 0.2);
          gsap.utils.toArray<HTMLElement>('[data-home-reveal]', root).forEach((element) => {
            gsap.from(element, {
              y: 35,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: { trigger: element, start: 'top 92%', once: true },
            });
          });
          gsap.to('.home-orbit-parallax', {
            y: 55,
            ease: 'none',
            scrollTrigger: { trigger: root.querySelector('.home-hero'), start: 'top top', end: 'bottom top', scrub: 1 },
          });
        },
        root,
      );

      // 콘텐츠 높이가 바뀌면 스크롤 위치를 다시 계산한다.
      let refreshFrame = 0;
      let disposed = false;
      const refresh = () => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      const observer = new ResizeObserver(refresh);
      observer.observe(root);
      void document.fonts.ready.then(() => {
        if (!disposed) refresh();
      });
      return () => {
        disposed = true;
        observer.disconnect();
        cancelAnimationFrame(refreshFrame);
        media.revert();
      };
    },
    { scope: container },
  );
}
