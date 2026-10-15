/** [학업 리포트] 오른쪽에 가려진 내용이 있을 때 모바일 스크롤 영역의 끝을 흐리게 표시 */
export const HORIZONTAL_SCROLL_HINT_CLASS =
  'max-lg:data-[overflow-right=true]:[mask-image:linear-gradient(to_right,#000_calc(100%_-_24px),transparent)]';

export default function horizontalScrollHintRef(element: HTMLDivElement | null) {
  if (!element) return;

  const update = () => {
    // 소수점 단위의 스크롤 오차로 끝에서도 흐림 효과가 남지 않도록 한다.
    element.dataset.overflowRight = String(element.scrollWidth - element.clientWidth - element.scrollLeft > 1);
  };
  const resizeObserver = new ResizeObserver(update);
  const observeSizes = () => {
    resizeObserver.disconnect();
    resizeObserver.observe(element);
    for (const child of element.children) resizeObserver.observe(child);
    update();
  };
  const mutationObserver = new MutationObserver(observeSizes);
  mutationObserver.observe(element, { childList: true });
  element.addEventListener('scroll', update, { passive: true });
  observeSizes();

  // React 19의 콜백 ref 정리: 탭 교체·페이지 이탈 시 관찰과 이벤트를 해제한다.
  return () => {
    resizeObserver.disconnect();
    mutationObserver.disconnect();
    element.removeEventListener('scroll', update);
  };
}
