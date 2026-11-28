/**
 * [울타리치기] 게임판
 * 격자선 없이 점만 두고, 점 사이를 누르면 울타리 → X → 비움으로 바뀐다. 누른 채 끌면 지나가는 변을 같은 상태로 칠한다.
 * 울타리와 울타리가 닿은 점은 초록, 규칙 위반(한 점에 선 3개 이상·막다른 점·잘못 닫힌 고리)은 점과 선을 빨강으로 바꾼다.
 * 완성하면 고리 안쪽을 그라데이션으로 쓸어 채운다.
 */
import { type PointerEvent, useRef } from 'react';

import type { TFenceHintMark } from '@/hooks/fence/useFenceGame';
import type { TFenceEdgeState } from '@/types/fence/TFence';
import { CROSS, FENCE, fenceGeometry, nearestEdge, type TFenceAnalysis, vertexPoint } from '@/utils/fence/fenceGrid';

type TProps = {
  size: number;
  clues: (number | null)[];
  state: TFenceEdgeState[];
  analysis: TFenceAnalysis;
  hintMark: TFenceHintMark | null;
  solved: boolean;
  disabled: boolean;
  onBegin: (edge: number) => void;
  onContinue: (edge: number) => void;
  onEnd: () => void;
};

// 칸 한 변을 100으로 그린다. 1 단위로 그리면 일부 브라우저의 최소 글자 크기 설정에 숫자가 깨진다.
const U = 100;
// 판 바깥 여백(칸 한 변 기준). 테두리 점과 울타리가 잘리지 않게 둔다.
const PAD = 0.42;

export default function FenceBoard({
  size,
  clues,
  state,
  analysis,
  hintMark,
  solved,
  disabled,
  onBegin,
  onContinue,
  onEnd,
}: TProps) {
  const svg = useRef<SVGSVGElement>(null);
  const pressed = useRef(false);
  const lastEdge = useRef(-1);
  const { edges, vertices, cells } = fenceGeometry(size);
  const hintEdge = hintMark ? edges[hintMark.edge] : undefined;

  // 화면 좌표를 판 좌표(칸 한 변 = 1)로 바꾼다.
  const toBoard = (event: PointerEvent<SVGSVGElement>) => {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: point.x / U, y: point.y / U };
  };

  const handleDown = (event: PointerEvent<SVGSVGElement>) => {
    if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const point = toBoard(event);
    if (!point) return;
    const edge = nearestEdge(size, point.x, point.y, 0.5);
    if (edge < 0) return;
    event.preventDefault();
    svg.current?.setPointerCapture(event.pointerId);
    pressed.current = true;
    lastEdge.current = edge;
    onBegin(edge);
  };

  const handleMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!pressed.current) return;
    const point = toBoard(event);
    if (!point) return;
    // 끄는 중에는 변 가운데 가까이 지날 때만 칠해 옆 변이 잘못 칠해지지 않게 한다.
    const edge = nearestEdge(size, point.x, point.y, 0.32, true);
    if (edge < 0 || edge === lastEdge.current) return;
    lastEdge.current = edge;
    onContinue(edge);
  };

  const handleUp = () => {
    if (!pressed.current) return;
    pressed.current = false;
    lastEdge.current = -1;
    onEnd();
  };

  const loopPoints = analysis.loop
    ?.map((v) => vertexPoint(size, v))
    .map((p) => `${p.x * U},${p.y * U}`)
    .join(' ');

  return (
    <svg
      ref={svg}
      className={`fence-board ${solved ? 'is-solved' : ''} ${disabled ? 'is-disabled' : ''}`}
      viewBox={`${-PAD * U} ${-PAD * U} ${(size + PAD * 2) * U} ${(size + PAD * 2) * U}`}
      role="img"
      aria-label={`${size}×${size} 울타리치기 판`}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onLostPointerCapture={handleUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <defs>
        <linearGradient id="fence-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--fence-fill-from)" />
          <stop offset="100%" stopColor="var(--fence-fill-to)" />
        </linearGradient>
        <linearGradient id="fence-shine" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-1 0"
            to="1 0"
            dur="0.9s"
            begin="0.45s"
            fill="freeze"
          />
        </linearGradient>
      </defs>

      {/* 완성 연출: 고리 안쪽을 왼쪽에서 오른쪽으로 쓸어 채우고 빛이 한 번 지나간다. */}
      {loopPoints && (
        <g className="fence-fill" aria-hidden="true">
          <polygon points={loopPoints} fill="url(#fence-fill)" />
          <polygon points={loopPoints} fill="url(#fence-shine)" className="fence-fill-shine" />
        </g>
      )}

      {hintEdge && hintMark && (
        <line
          key={hintMark.key}
          className={`fence-hint-glow fence-hint-glow--${hintMark.kind.toLowerCase()}`}
          x1={hintEdge.x1 * U}
          y1={hintEdge.y1 * U}
          x2={hintEdge.x2 * U}
          y2={hintEdge.y2 * U}
          aria-hidden="true"
        />
      )}

      {edges.map((e) => {
        const index = e.id;
        const value = state[index];
        if (value === FENCE)
          return (
            <line
              // 상태가 바뀔 때마다 새로 그려 울타리가 쏙 올라오는 효과를 준다.
              key={`f${index}`}
              className={`fence-line ${analysis.badEdges.has(index) ? 'is-bad' : ''}`}
              x1={e.x1 * U}
              y1={e.y1 * U}
              x2={e.x2 * U}
              y2={e.y2 * U}
              pathLength={1}
            />
          );
        if (value === CROSS) {
          const cx = ((e.x1 + e.x2) / 2) * U;
          const cy = ((e.y1 + e.y2) / 2) * U;
          const d = 0.09 * U;
          return (
            <path
              key={`x${index}`}
              className="fence-cross"
              d={`M${cx - d} ${cy - d}L${cx + d} ${cy + d}M${cx + d} ${cy - d}L${cx - d} ${cy + d}`}
            />
          );
        }
        return null;
      })}

      {cells.map(({ id: cell, x, y }) => {
        const clue = clues[cell];
        if (clue === null || clue === undefined) return null;
        const tone = analysis.overCells.has(cell) ? 'is-bad' : analysis.doneCells.has(cell) ? 'is-done' : '';
        return (
          <text
            key={`c${cell}`}
            className={`fence-clue ${tone}`}
            x={x * U}
            y={y * U}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {clue}
          </text>
        );
      })}

      {vertices.map(({ id: vertex, ...p }) => {
        const tone = analysis.badVertices.has(vertex) ? 'is-bad' : analysis.litVertices.has(vertex) ? 'is-lit' : '';
        return <circle key={`v${vertex}`} className={`fence-dot ${tone}`} cx={p.x * U} cy={p.y * U} r={0.075 * U} />;
      })}
    </svg>
  );
}
