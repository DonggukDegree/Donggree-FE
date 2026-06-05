import { useCallback, useRef, useState } from 'react';

// 요소가 뷰포트에 들어오면 isInView를 true로 만든다. (스크롤 진입 애니메이션용)
// 콜백 ref를 사용해, 로딩 화면을 먼저 그렸다가 데이터 도착 후 콘텐츠가 뒤늦게 마운트되는 경우에도
// ref가 실제로 붙는 시점에 옵저버를 설치한다. (effect 한 번만 실행되어 옵저버를 놓치는 문제 방지)
export default function useInView(threshold = 0.2) {
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (element: HTMLDivElement | null) => {
      // 이전 요소에 대한 관찰을 정리한다. (재마운트·threshold 변경 대응)
      observerRef.current?.disconnect();
      if (!element) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        },
        { threshold },
      );
      observerRef.current.observe(element);
    },
    [threshold],
  );

  return [ref, isInView] as const;
}
