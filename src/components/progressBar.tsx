interface IProgressBarProps {
  progress: number;
  animate?: boolean;
}

export default function ProgressBar({ progress, animate = true }: IProgressBarProps) {
  const clampedProgress = Math.round(Math.min(100, Math.max(0, progress)));

  return (
    <div className="w-150 bg-primary-30 rounded-full h-4">
      <div
        className="bg-primary-60 h-4 rounded-full transition-[width] duration-1000 ease-out"
        style={{ width: animate ? `${clampedProgress}%` : '0%' }}
      />
    </div>
  );
}
