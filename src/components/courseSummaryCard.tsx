import { useEffect, useState } from 'react';

import { COURSE_LABEL, type TCourseName } from '@/types/course';

interface ICourseSummaryCardProps {
  courseName: TCourseName;
  progress: number;
  remainingCredits: number;
  status: 'PASS' | 'FAIL';
  isVisible?: boolean;
}

export default function CourseSummaryCard({
  courseName,
  progress,
  remainingCredits,
  status,
  isVisible = true,
}: ICourseSummaryCardProps) {
  const clampedProgress = Math.round(Math.min(100, Math.max(0, progress)));
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setAnimatedProgress(clampedProgress), 100);
    return () => clearTimeout(timer);
  }, [clampedProgress, isVisible]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const filledLength = arcLength * (animatedProgress / 100);
  const gradientId = `highlight-${courseName}`;

  return (
    <div className="border border-primary-60 p-4 flex flex-col gap-4 text-coolgray-90 rounded-sm">
      <p className="text-heading-5">{COURSE_LABEL[courseName]}</p>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 100 100" className="w-50 h-50">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--color-primary-90)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className="stroke-primary-30"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{ transform: 'rotate(135deg)', transformOrigin: '50% 50%' }}
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className="stroke-primary-60"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${circumference}`}
            style={{
              transform: 'rotate(135deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dasharray 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${circumference}`}
            style={{
              transform: 'rotate(135deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dasharray 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
          <text
            x="50"
            y="80"
            textAnchor="middle"
            style={{ fontSize: '12px', fontWeight: 700, fill: 'var(--color-primary-60)' }}
          >
            {animatedProgress}%
          </text>
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="text-heading-5">잔여 학점</span>
          <span className="text-heading-5 text-primary-60">{remainingCredits}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-heading-5">충족 여부</span>
          <span className={`text-heading-5 font-bold ${status === 'PASS' ? 'text-primary-60' : 'text-coolgray-30'}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
