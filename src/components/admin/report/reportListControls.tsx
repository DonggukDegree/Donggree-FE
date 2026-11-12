/**
 * [관리자 > 신고 관리] 상태 필터·검색·페이지 이동
 * 신고 목록은 기본으로 대기 신고만 본다. 목록은 서버가 최신순 20개씩 보낸다.
 */
import { useState } from 'react';

import { ADMIN_COMPACT_INPUT_CLASS } from '@/constants/inputStyles';
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
  return <FilterChips label="신고 상태" value={value} options={STATUS_OPTIONS} onChange={onChange} />;
}

// 한 값만 고르는 상태 칩 묶음. 눌린 칩은 aria-pressed로 표시한다.
export function FilterChips<T extends string | boolean | null>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-2">
      {options.map((option) => (
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

// 검색어는 입력 중이 아니라 [검색]을 누를 때 보낸다.
export function KeywordSearch({
  label,
  placeholder,
  onSearch,
}: {
  label: string;
  placeholder: string;
  onSearch: (keyword: string) => void;
}) {
  const [input, setInput] = useState('');
  return (
    // 졸업 요건 관리 필터처럼 작은 입력칸과 가로로 긴 둥근 버튼을 한 줄에 둔다.
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(input);
      }}
    >
      <input
        aria-label={label}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={placeholder}
        className={`${ADMIN_COMPACT_INPUT_CLASS} w-60`}
      />
      <button
        type="submit"
        className="shrink-0 cursor-pointer whitespace-nowrap rounded-full bg-primary-60 px-5 py-1.5 text-button-s text-white hover:opacity-90"
      >
        검색
      </button>
    </form>
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
