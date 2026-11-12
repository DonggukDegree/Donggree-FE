/**
 * [관리자 > 신고 관리] 상태 필터·페이지 이동
 * 기본은 대기 신고만 본다. 목록은 서버가 최신순 20개씩 보낸다.
 */
import type { TReportStatus } from '@/types/admin/TAdminReport';
import { REPORT_STATUS_LABELS } from '@/utils/admin/report';

const STATUS_OPTIONS: { value: TReportStatus | null; label: string }[] = [
  { value: 'PENDING', label: REPORT_STATUS_LABELS.PENDING },
  { value: 'RESOLVED', label: REPORT_STATUS_LABELS.RESOLVED },
  { value: 'REJECTED', label: REPORT_STATUS_LABELS.REJECTED },
  { value: null, label: '전체' },
];

export function ReportStatusFilter({
  value,
  onChange,
}: {
  value: TReportStatus | null;
  onChange: (status: TReportStatus | null) => void;
}) {
  return (
    <div role="group" aria-label="신고 상태" className="flex gap-2">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-full border px-4 py-1.5 text-body-s ${
            value === option.value
              ? 'border-primary-60 bg-primary-60 text-white'
              : 'border-coolgray-30 bg-white text-coolgray-90 hover:border-primary-60'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function PageControls({
  page,
  size,
  totalCount,
  onChange,
}: {
  page: number;
  size: number;
  totalCount: number;
  onChange: (page: number) => void;
}) {
  const lastPage = Math.max(0, Math.ceil(totalCount / size) - 1);
  return (
    <div className="flex items-center justify-between text-body-s text-coolgray-60">
      <span>전체 {totalCount}건</span>
      <span className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onChange(page - 1)}
          className="cursor-pointer rounded border border-coolgray-30 px-3 py-1 disabled:cursor-default disabled:opacity-40"
        >
          이전
        </button>
        <span>
          {page + 1} / {lastPage + 1}
        </span>
        <button
          type="button"
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
          className="cursor-pointer rounded border border-coolgray-30 px-3 py-1 disabled:cursor-default disabled:opacity-40"
        >
          다음
        </button>
      </span>
    </div>
  );
}
