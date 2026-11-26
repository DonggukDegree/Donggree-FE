/**
 * [공용] 목록 끝 자동 불러오기
 * 목록 맨 아래 빈 표식(ref)이 화면 가까이(기본 300px 전) 오면 onLoadMore를 부른다. '더보기' 버튼 대신 쓴다.
 * 불러오는 중이거나 더 받을 게 없으면 멈추고, 받은 개수(itemCount)가 바뀌면 다시 살핀다.
 * 짧은 목록이라 표식이 계속 보이는 경우에도 새로 살필 때 바로 다음 묶음을 이어 받는다.
 */
import { useEffect, useRef } from 'react';

interface ILoadMoreTriggerOptions {
  canLoadMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  itemCount: number;
  rootMargin?: string;
}

export default function useLoadMoreTrigger({
  canLoadMore,
  isLoading,
  onLoadMore,
  itemCount,
  rootMargin = '300px',
}: ILoadMoreTriggerOptions) {
  const targetRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !canLoadMore || isLoading || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current();
      },
      { rootMargin },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [canLoadMore, isLoading, itemCount, rootMargin]);

  return targetRef;
}
