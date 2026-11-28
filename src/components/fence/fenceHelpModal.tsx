/** [울타리치기] 규칙·조작·힌트·기록 기준을 안내하는 게임 방법 모달. */
import '@/pages/fence/fence.css';

import useFenceDialog from '@/hooks/fence/useFenceDialog';
import { useModalStore } from '@/stores/modalStore';

// 2×2 예시: 숫자만큼 둘레에 울타리가 있고 전체가 하나의 고리를 이룬다.
function Example() {
  return (
    <svg className="fence-help-example" viewBox="-35 -35 270 270" aria-hidden="true">
      <polygon points="0,0 100,0 100,100 200,100 200,200 0,200" className="fence-help-fill" />
      <path d="M0 0H100V100H200V200H0Z" className="fence-line" pathLength={1} />
      <text x="50" y="50" className="fence-clue is-done" textAnchor="middle" dominantBaseline="central">
        3
      </text>
      <text x="150" y="50" className="fence-clue is-done" textAnchor="middle" dominantBaseline="central">
        1
      </text>
      <text x="150" y="150" className="fence-clue is-done" textAnchor="middle" dominantBaseline="central">
        2
      </text>
      {[0, 1, 2].flatMap((y) =>
        [0, 1, 2].map((x) => (
          <circle
            key={`${x}${y}`}
            className={`fence-dot ${x === 2 && y === 0 ? '' : 'is-lit'}`}
            cx={x * 100}
            cy={y * 100}
            r={7}
          />
        )),
      )}
    </svg>
  );
}

export default function FenceHelpModal() {
  const close = useModalStore((s) => s.closeModal);
  const dialog = useFenceDialog();
  return (
    <dialog
      ref={dialog}
      aria-labelledby="fence-help-title"
      className="fence-dialog font-pretendard text-body-s backdrop:bg-overlay"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="fence-dialog-content">
        <header className="fence-dialog-heading">
          <h2 id="fence-help-title" className="text-heading-5">
            게임 방법
          </h2>
          <button type="button" className="fence-dialog-close" aria-label="게임 방법 닫기" onClick={close}>
            ×
          </button>
        </header>
        <Example />
        <ul className="fence-help-list text-coolgray-60">
          <li>점과 점 사이를 이어 끊기지 않는 하나의 울타리 고리를 만드세요.</li>
          <li>숫자는 그 칸을 둘러싼 울타리 개수예요. 빈칸은 몇 개여도 괜찮아요.</li>
          <li>울타리는 갈라지거나 겹치지 않아요. 한 점에는 울타리가 0개 또는 2개만 닿아요.</li>
          <li>한 번 누르면 울타리, 한 번 더 누르면 X, 한 번 더 누르면 비워져요. 누른 채 쭉 그어도 돼요.</li>
          <li>규칙에 어긋나면 빨갛게 표시돼요. 힌트는 판마다 3번 쓸 수 있어요.</li>
          <li>로그인하면 스트릭과 크기별 최고 기록이 쌓이고, 하루 첫 완성마다 10P가 적립돼요.</li>
        </ul>
      </div>
    </dialog>
  );
}
