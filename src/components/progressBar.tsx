interface IProgressBarProps {
  progress: number;
  animate?: boolean;
}

export default function ProgressBar({ progress, animate = true }: IProgressBarProps) {
  const clampedProgress = Math.round(Math.min(100, Math.max(0, progress)));

  return (
    <div className="w-150 bg-primary-30 rounded-full h-7 relative overflow-hidden">
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
