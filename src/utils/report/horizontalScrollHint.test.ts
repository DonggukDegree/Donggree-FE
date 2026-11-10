/** [학업 리포트] 스크롤 끝·크기/내용 변경·요소 해제에 따른 흐림 표시 검증 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import horizontalScrollHintRef from '@/utils/report/horizontalScrollHint';

const resize = { observe: vi.fn(), disconnect: vi.fn() };
const mutation = { observe: vi.fn(), disconnect: vi.fn() };
let onResize: () => void;
let onMutation: () => void;

function scrollArea() {
  const element = Object.assign(new EventTarget(), {
    scrollWidth: 600,
    clientWidth: 320,
    scrollLeft: 0,
    dataset: {} as Record<string, string>,
    children: [{}],
  });
  const cleanup = horizontalScrollHintRef(element as unknown as HTMLDivElement);
  return { element, cleanup };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        onResize = callback;
        return resize;
      }
    },
  );
  vi.stubGlobal(
    'MutationObserver',
    class {
      constructor(callback: () => void) {
        onMutation = callback;
        return mutation;
      }
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

describe('가로 스크롤 안내', () => {
  it('오른쪽 내용이 가려진 상태로 시작하고 끝의 소수점 오차는 무시', () => {
    const { element, cleanup } = scrollArea();
    expect(element.dataset.overflowRight).toBe('true');
    element.scrollLeft = 279.5;
    element.dispatchEvent(new Event('scroll'));
    expect(element.dataset.overflowRight).toBe('false');
    element.scrollLeft = 100;
    element.dispatchEvent(new Event('scroll'));
    expect(element.dataset.overflowRight).toBe('true');
    cleanup?.();
  });

  it('뷰포트가 넓어지면 흐림 해제, 내용이 커지면 다시 표시', () => {
    const { element, cleanup } = scrollArea();
    element.clientWidth = 600;
    onResize();
    expect(element.dataset.overflowRight).toBe('false');
    element.scrollWidth = 800;
    onResize();
    expect(element.dataset.overflowRight).toBe('true');
    cleanup?.();
  });

  it('카드가 추가되면 새 카드의 크기도 관찰하고 범위 재계산', () => {
    const { element, cleanup } = scrollArea();
    const nextCard = {};
    element.children.push(nextCard);
    element.scrollWidth = 320;
    onMutation();
    expect(resize.observe).toHaveBeenCalledWith(nextCard);
    expect(element.dataset.overflowRight).toBe('false');
    cleanup?.();
  });

  it('탭 교체·페이지 이탈 후 관찰과 스크롤 이벤트 해제', () => {
    const { element, cleanup } = scrollArea();
    const disconnected = resize.disconnect.mock.calls.length;
    cleanup?.();
    expect(resize.disconnect).toHaveBeenCalledTimes(disconnected + 1);
    expect(mutation.disconnect).toHaveBeenCalledOnce();
    element.scrollLeft = 280;
    element.dispatchEvent(new Event('scroll'));
    expect(element.dataset.overflowRight).toBe('true');
  });

  it('요소가 없으면 관찰을 시작하지 않음', () => {
    expect(horizontalScrollHintRef(null)).toBeUndefined();
    expect(resize.observe).not.toHaveBeenCalled();
  });
});
