/**
 * [졸업 판정] 달성률 진행 바
 * 학업 리포트 요약에서 졸업까지의 달성률(%)을 보여 준다. 스크롤로 화면에 들어올 때 채워지는 연출을 위해
 * animate 플래그를 부모(화면)에서 받는다.
 */
interface IProgressBarProps {
  progress: number;
  animate?: boolean;
}

export default function ProgressBar({ progress, animate = true }: IProgressBarProps) {
  const clampedProgress = Math.round(Math.min(100, Math.max(0, progress)));

  // max-w-full은 모바일 대응. 부모가 600px보다 넓은 PC에서는 그대로 w-150이다.
  return (
    <div className="w-150 max-w-full bg-primary-30 rounded-full h-7 relative overflow-hidden">
      <div
        className="h-7 rounded-full"
        style={{
          width: animate ? `${clampedProgress}%` : '0%',
          background: `linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%, rgba(255,113,36,0.3) 100%), var(--color-primary-60)`,
          transition: 'width 1s ease-out',
        }}
      />
    </div>
  );
}
