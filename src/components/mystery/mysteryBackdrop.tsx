/** [정각원의 비밀] 콘텐츠 가장자리 뒤에서 천천히 부유하는 금빛 배경. 입력에는 반응하지 않는다. */
import type { CSSProperties } from 'react';

export default function MysteryBackdrop() {
  return (
    <div className="mystery-backdrop" aria-hidden="true">
      {Array.from({ length: 16 }, (_, index) => (
        <span
          key={index}
          className="mystery-backdrop-mote"
          style={
            {
              '--mote-inset': `${0.2 + (index % 4) * 0.2}`,
              '--mote-top': `${8 + Math.floor(index / 2) * 12}%`,
              '--mote-size': `${index % 3 === 0 ? 4 : 2}px`,
              '--mote-duration': `${22 + (index % 5) * 4}s`,
              '--mote-delay': `${-index * 3}s`,
              [index % 2 === 0 ? 'left' : 'right']: 'calc(var(--mystery-edge-width) * var(--mote-inset))',
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
