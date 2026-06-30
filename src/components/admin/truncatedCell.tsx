import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ITruncatedCellProps {
  // 한 줄로 축약해 보여줄 텍스트
  text: string;
  // 텍스트 span에 덧붙일 추가 클래스 (폰트 두께 등)
  className?: string;
}

// 좁은 셀에서 텍스트가 ...로 잘릴 때, 커서를 올리면 전체 내용을 툴팁으로 보여주는 셀.
// 테이블 컨테이너가 overflow-auto라 일반 absolute 툴팁은 잘리므로,
// portal + fixed 위치로 body에 띄워 잘림 없이 표시한다.
export default function TruncatedCell({ text, className = '' }: ITruncatedCellProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  // 툴팁이 떠야 할 화면 좌표. null이면 숨김.
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const handleMouseEnter = () => {
    const el = textRef.current;
    if (!el) return;
    // 실제로 잘린 경우(콘텐츠 너비 > 보이는 너비)에만 툴팁을 띄운다.
    if (el.scrollWidth <= el.clientWidth) return;
    const rect = el.getBoundingClientRect();
    // 셀 바로 아래에 툴팁을 띄운다.
    setTooltipPos({ top: rect.bottom + 6, left: rect.left });
  };

  const handleMouseLeave = () => setTooltipPos(null);

  return (
    <>
      <span
        ref={textRef}
        className={`block truncate ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </span>
      {tooltipPos &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[200] max-w-md whitespace-normal break-words rounded-lg bg-coolgray-90 px-3 py-2 text-body-xs text-white shadow-lg"
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
