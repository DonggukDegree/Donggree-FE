/**
 * [울타리치기] 판 좌표와 규칙 확인
 * 변 번호는 서버와 같다. 가로변(행 0..n × 열 0..n-1)을 먼저, 세로변(행 0..n-1 × 열 0..n)을 뒤에 둔다.
 * 점은 행 × (n+1) + 열, 좌표는 칸 한 변을 1로 둔 (열, 행)이다.
 *
 * 화면은 정답을 모르므로 규칙 위반(빨강)과 완성 여부만 숫자·울타리로 판단하고, 완성 판정은 서버가 정답과 다시 비교한다.
 */
import type { TFenceEdgeState, TFenceSize } from '@/types/fence/TFence';

export const FENCE_SIZES: TFenceSize[] = [5, 7, 10];

export const EMPTY: TFenceEdgeState = 0;
export const FENCE: TFenceEdgeState = 1;
export const CROSS: TFenceEdgeState = 2;

export type TFenceEdge = {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  vertices: [number, number];
  cells: number[];
};

export type TFencePoint = { id: number; x: number; y: number };

export type TFenceGeometry = {
  size: number;
  edgeCount: number;
  edges: TFenceEdge[];
  vertices: TFencePoint[]; // 점 번호와 좌표
  cells: TFencePoint[]; // 칸 번호와 가운데 좌표
  cellEdges: number[][];
  vertexEdges: number[][];
};

const cache = new Map<number, TFenceGeometry>();

// 번호로 꺼낸 값. 판 구성상 항상 있으므로 없으면 프로그램 오류로 본다.
function item<T>(list: readonly T[], index: number): T {
  const value = list[index];
  if (value === undefined) throw new RangeError(`잘못된 판 번호: ${index}`);
  return value;
}

export const fenceGeometry = (size: number): TFenceGeometry => {
  const cached = cache.get(size);
  if (cached) return cached;
  const horizontal = (size + 1) * size;
  const vertex = (r: number, c: number) => r * (size + 1) + c;
  const edges: TFenceEdge[] = [];
  for (let r = 0; r <= size; r++)
    for (let c = 0; c < size; c++)
      edges.push({
        id: edges.length,
        x1: c,
        y1: r,
        x2: c + 1,
        y2: r,
        vertices: [vertex(r, c), vertex(r, c + 1)],
        cells: [r > 0 ? (r - 1) * size + c : -1, r < size ? r * size + c : -1].filter((x) => x >= 0),
      });
  for (let r = 0; r < size; r++)
    for (let c = 0; c <= size; c++)
      edges.push({
        id: edges.length,
        x1: c,
        y1: r,
        x2: c,
        y2: r + 1,
        vertices: [vertex(r, c), vertex(r + 1, c)],
        cells: [c > 0 ? r * size + c - 1 : -1, c < size ? r * size + c : -1].filter((x) => x >= 0),
      });
  const cellEdges = Array.from({ length: size * size }, (_, i) => {
    const r = Math.floor(i / size);
    const c = i % size;
    return [r * size + c, (r + 1) * size + c, horizontal + r * (size + 1) + c, horizontal + r * (size + 1) + c + 1];
  });
  const vertexEdges: number[][] = Array.from({ length: (size + 1) * (size + 1) }, () => []);
  edges.forEach((edge, index) => edge.vertices.forEach((v) => item(vertexEdges, v).push(index)));
  const vertices = Array.from({ length: (size + 1) * (size + 1) }, (_, id) => ({
    id,
    x: id % (size + 1),
    y: Math.floor(id / (size + 1)),
  }));
  const cells = Array.from({ length: size * size }, (_, id) => ({
    id,
    x: (id % size) + 0.5,
    y: Math.floor(id / size) + 0.5,
  }));
  const geometry = { size, edgeCount: edges.length, edges, vertices, cells, cellEdges, vertexEdges };
  cache.set(size, geometry);
  return geometry;
};

export const emptyState = (size: number): TFenceEdgeState[] =>
  Array.from({ length: fenceGeometry(size).edgeCount }, () => EMPTY);

// 탭할 때마다 울타리 → X → 비움 순서로 바뀐다.
export const nextEdgeState = (state: TFenceEdgeState): TFenceEdgeState => ((state + 1) % 3) as TFenceEdgeState;

export const serializeState = (state: TFenceEdgeState[]) => state.join('');

/**
 * 판 위 좌표에서 가장 가까운 변. 칸 한 변 기준 maxDistance보다 멀면 -1.
 * middleOnly면 변 가운데 70% 구간만 본다. 끄는 중 점 근처를 지날 때 꺾이는 옆 변이 칠해지지 않게 한다.
 */
export const nearestEdge = (size: number, x: number, y: number, maxDistance = 0.5, middleOnly = false) => {
  const { edges } = fenceGeometry(size);
  let best = -1;
  let bestDistance = maxDistance;
  // 가까운 후보만 보도록 주변 칸의 변만 확인한다.
  const r = Math.min(size - 1, Math.max(0, Math.floor(y)));
  const c = Math.min(size - 1, Math.max(0, Math.floor(x)));
  const horizontal = (size + 1) * size;
  const candidates = new Set<number>();
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
      candidates.add(rr * size + cc);
      candidates.add((rr + 1) * size + cc);
      candidates.add(horizontal + rr * (size + 1) + cc);
      candidates.add(horizontal + rr * (size + 1) + cc + 1);
    }
  for (const index of candidates) {
    const e = item(edges, index);
    const px = Math.max(e.x1, Math.min(e.x2, x));
    const py = Math.max(e.y1, Math.min(e.y2, y));
    // 변 끝(점) 근처는 어느 변인지 모호하므로 가운데 쪽에 가중치를 둔다.
    const along = e.x1 === e.x2 ? Math.abs(y - (e.y1 + 0.5)) : Math.abs(x - (e.x1 + 0.5));
    if (middleOnly && along > 0.35) continue;
    const distance = Math.hypot(x - px, y - py) + Math.max(0, along - 0.35) * 0.6;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
};

// 완성된 고리를 한 점에서 출발해 따라 돌며 점 순서를 모은다(안쪽 채우기용).
const walkLoop = (size: number, state: TFenceEdgeState[]) => {
  const { edges, vertexEdges } = fenceGeometry(size);
  const start = item(edges, state.indexOf(FENCE)).vertices[0];
  const order = [start];
  let previous = -1;
  let vertex = start;
  for (let guard = 0; guard < state.length; guard++) {
    const next = item(vertexEdges, vertex).find((e) => state[e] === FENCE && e !== previous);
    if (next === undefined) break;
    const [a, b] = item(edges, next).vertices;
    vertex = a === vertex ? b : a;
    previous = next;
    if (vertex === start) break;
    order.push(vertex);
  }
  return order;
};

export type TFenceAnalysis = {
  litVertices: Set<number>; // 울타리가 닿은 점(초록)
  badVertices: Set<number>; // 선이 3개 이상이거나 막다른 점(빨강)
  badEdges: Set<number>; // 빨강 점에 붙은 울타리, 다 풀지 못한 채 닫힌 고리
  overCells: Set<number>; // 숫자를 넘기거나 더 채울 수 없는 칸(빨강 숫자)
  doneCells: Set<number>; // 숫자만큼 찬 칸(흐린 숫자). 0은 둘레를 모두 X로 막았을 때
  solved: boolean;
  loop: number[] | null; // 완성 시 고리를 따라 도는 점 순서
};

/** 현재 표시를 규칙에 비춰 본다. 위반은 사용자가 바로 알아볼 수 있는 것만 표시한다. */
export const analyzeFence = (size: number, clues: (number | null)[], state: TFenceEdgeState[]): TFenceAnalysis => {
  const { edges, cellEdges, vertexEdges } = fenceGeometry(size);
  const litVertices = new Set<number>();
  const badVertices = new Set<number>();
  const badEdges = new Set<number>();
  const overCells = new Set<number>();
  const doneCells = new Set<number>();
  vertexEdges.forEach((list, vertex) => {
    const fences = list.filter((e) => state[e] === FENCE);
    const open = list.filter((e) => state[e] === EMPTY).length;
    if (fences.length > 0) litVertices.add(vertex);
    if (fences.length > 2 || (fences.length === 1 && open === 0)) {
      badVertices.add(vertex);
      fences.forEach((e) => badEdges.add(e));
    }
  });
  let cluesSatisfied = true;
  clues.forEach((clue, cell) => {
    if (clue === null) return;
    const fences = item(cellEdges, cell).filter((e) => state[e] === FENCE).length;
    const open = item(cellEdges, cell).filter((e) => state[e] === EMPTY).length;
    if (fences !== clue) cluesSatisfied = false;
    if (fences > clue || fences + open < clue) overCells.add(cell);
    // 0은 시작부터 충족이라 흐리게 하면 힌트가 사라져 보이므로, 둘레를 모두 X로 막았을 때만 흐리게 한다.
    else if (fences === clue && (clue > 0 || open === 0)) doneCells.add(cell);
  });

  // 울타리 덩어리마다 닫힌 고리인지 본다.
  const parent = Array.from({ length: vertexEdges.length }, (_, i) => i);
  const find = (start: number): number => {
    let v = start;
    while (item(parent, v) !== v) {
      parent[v] = item(parent, item(parent, v));
      v = item(parent, v);
    }
    return v;
  };
  const fenceEdges = state.flatMap((s, e) => (s === FENCE ? [e] : []));
  fenceEdges.forEach((e) => {
    const [a, b] = item(edges, e).vertices;
    parent[find(a)] = find(b);
  });
  const groups = new Map<number, number[]>();
  fenceEdges.forEach((e) => {
    const root = find(item(edges, e).vertices[0]);
    groups.set(root, [...(groups.get(root) ?? []), e]);
  });
  const closed = [...groups.values()].filter((group) => {
    const vertices = new Set(group.flatMap((e) => item(edges, e).vertices));
    return (
      vertices.size === group.length &&
      [...vertices].every((v) => item(vertexEdges, v).filter((e) => state[e] === FENCE).length === 2)
    );
  });
  const solved = closed.length === 1 && groups.size === 1 && badVertices.size === 0 && cluesSatisfied;
  // 닫힌 고리가 여러 개이거나, 다른 울타리가 남았거나, 숫자를 못 채운 채 닫혔으면 더 이어갈 수 없으므로 표시한다.
  if (!solved) closed.forEach((group) => group.forEach((e) => badEdges.add(e)));
  return {
    litVertices,
    badVertices,
    badEdges,
    overCells,
    doneCells,
    solved,
    loop: solved ? walkLoop(size, state) : null,
  };
};

export const vertexPoint = (size: number, vertex: number) => ({
  x: vertex % (size + 1),
  y: Math.floor(vertex / (size + 1)),
});

// 초를 m:ss(1시간 넘으면 h:mm:ss)로 보여준다.
export const formatFenceTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = String(safe % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};
