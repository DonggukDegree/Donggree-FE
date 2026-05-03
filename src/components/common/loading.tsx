export default function Loading() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-20">
      <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" className="stroke-primary-30" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r="36"
          className="stroke-primary-60"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="80 226"
        />
      </svg>
      <p className="text-heading-2 text-primary-60">Loading...</p>
    </div>
  );
}
