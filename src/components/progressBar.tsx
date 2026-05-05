export default function ProgressBar({ progress }: { progress: number }) {
  const clampedProgress = Math.round(Math.min(100, Math.max(0, progress)));

  return (
    <div className="w-150 bg-primary-30 rounded-full h-4">
      <div className="bg-primary-60 h-4 rounded-full" style={{ width: `${clampedProgress}%` }} />
    </div>
  );
}
