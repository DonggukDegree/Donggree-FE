import { describe, expect, it } from 'vitest';

import type { TFenceEdgeState } from '@/types/fence/TFence';
import {
  analyzeFence,
  CROSS,
  emptyState,
  FENCE,
  fenceGeometry,
  formatFenceTime,
  nearestEdge,
  nextEdgeState,
  serializeState,
} from '@/utils/fence/fenceGrid';

// 5×5 판에서 왼쪽 위 칸 하나를 두르는 울타리.
const h = (r: number, c: number) => r * 5 + c;
const v = (r: number, c: number) => 30 + r * 6 + c;
const square = (): TFenceEdgeState[] => {
  const state = emptyState(5);
  [h(0, 0), h(1, 0), v(0, 0), v(0, 1)].forEach((e) => (state[e] = FENCE));
  return state;
};
const clues = (values: Record<number, number>) => Array.from({ length: 25 }, (_, i) => values[i] ?? null);

describe('울타리치기 판 좌표', () => {
  it('변 번호는 서버와 같이 가로변 다음 세로변이고 길이는 2n(n+1)', () => {
    const g = fenceGeometry(5);
    expect(g.edgeCount).toBe(60);
    expect(g.edges[h(0, 0)]).toMatchObject({ x1: 0, y1: 0, x2: 1, y2: 0, cells: [0] });
    expect(g.edges[v(0, 1)]).toMatchObject({ x1: 1, y1: 0, x2: 1, y2: 1, cells: [0, 1] });
    expect(g.cellEdges[0]).toEqual([h(0, 0), h(1, 0), v(0, 0), v(0, 1)]);
    expect(fenceGeometry(10).edgeCount).toBe(220);
  });

  it('탭할 때마다 울타리 → X → 비움', () => {
    expect(nextEdgeState(0)).toBe(1);
    expect(nextEdgeState(1)).toBe(2);
    expect(nextEdgeState(2)).toBe(0);
    expect(serializeState([0, 1, 2])).toBe('012');
  });

  it('누른 위치에서 가장 가까운 변을 고르고 칸 한가운데는 고르지 않는다', () => {
    expect(nearestEdge(5, 0.5, 0.05)).toBe(h(0, 0));
    expect(nearestEdge(5, 1.02, 0.5)).toBe(v(0, 1));
    expect(nearestEdge(5, 0.5, 0.5, 0.35)).toBe(-1);
  });

  it('끄는 중에는 점 근처에서 옆 변을 고르지 않는다', () => {
    expect(nearestEdge(5, 1.02, 4, 0.32, true)).toBe(-1);
    expect(nearestEdge(5, 1.5, 4.02, 0.32, true)).toBe(h(4, 1));
  });

  it('숫자를 채운 하나의 고리면 완성이고 고리 점 순서를 돌려준다', () => {
    const result = analyzeFence(5, clues({ 0: 4, 1: 1 }), square());
    expect(result.solved).toBe(true);
    expect(result.loop).toHaveLength(4);
    expect(result.doneCells).toEqual(new Set([0, 1]));
    expect(result.badEdges.size).toBe(0);
  });

  it('숫자를 못 채운 채 닫힌 고리는 완성이 아니고 빨강으로 표시한다', () => {
    const result = analyzeFence(5, clues({ 0: 4, 2: 1 }), square());
    expect(result.solved).toBe(false);
    expect(result.badEdges.size).toBe(4);
  });

  it('0은 둘레를 모두 X로 막아야 흐려진다', () => {
    const state = emptyState(5);
    expect(analyzeFence(5, clues({ 0: 0 }), state).doneCells.has(0)).toBe(false);
    [h(0, 0), h(1, 0), v(0, 0), v(0, 1)].forEach((e) => (state[e] = CROSS));
    expect(analyzeFence(5, clues({ 0: 0 }), state).doneCells.has(0)).toBe(true);
  });

  it('한 점에 선이 셋이면 그 점과 붙은 울타리가 빨강이다', () => {
    const state = square();
    state[h(0, 1)] = FENCE;
    const result = analyzeFence(5, clues({}), state);
    expect(result.badVertices).toEqual(new Set([1]));
    expect(result.badEdges).toEqual(new Set([h(0, 0), v(0, 1), h(0, 1)]));
  });

  it('막다른 점과 숫자를 넘긴 칸도 위반이다', () => {
    const state = emptyState(5);
    state[h(0, 0)] = FENCE;
    state[v(0, 0)] = CROSS;
    const result = analyzeFence(5, clues({ 0: 0 }), state);
    expect(result.badVertices.has(0)).toBe(true);
    expect(result.overCells.has(0)).toBe(true);
    expect(result.litVertices).toEqual(new Set([0, 1]));
  });

  it('풀이 시간은 m:ss, 한 시간이 넘으면 h:mm:ss', () => {
    expect(formatFenceTime(0)).toBe('0:00');
    expect(formatFenceTime(75)).toBe('1:15');
    expect(formatFenceTime(3725)).toBe('1:02:05');
  });
});
