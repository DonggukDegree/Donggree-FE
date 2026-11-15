/**
 * [포인트] 적립 내역 목록
 * 한 줄에 적립 항목·날짜(왼쪽)와 적립액(오른쪽). 숨김으로 회수된 적립은 흐리게 취소선을 긋고 "회수됨"을 붙인다.
 */
import { POINT_REASON_LABELS } from '@/constants/point';
import type { TPointHistory } from '@/types/point/TPoint';
import { formatPointAmount, formatPointDate } from '@/utils/point/point';

export default function PointHistoryList({ histories }: { histories: TPointHistory[] }) {
  if (histories.length === 0) {
    return (
      <p className="w-full rounded-lg bg-coolgray-10 px-4 py-8 text-center text-body-s break-keep text-coolgray-60">
        아직 적립된 포인트가 없어요. 동글맵에 장소를 등록하거나 리뷰를 남겨 보세요!
      </p>
    );
  }
  return (
    <ul className="flex w-full flex-col divide-y divide-coolgray-10 border-y border-coolgray-10">
      {histories.map((history) => (
        <li key={history.historyId} className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className={`text-body-m break-keep ${history.revoked ? 'text-coolgray-30' : 'text-coolgray-90'}`}>
              {POINT_REASON_LABELS[history.reason]}
            </span>
            <span className="text-body-xs text-coolgray-60">
              {formatPointDate(history.createdAt)}
              {history.revoked && ' · 숨김 처리로 회수됨'}
            </span>
          </div>
          <span
            className={`shrink-0 text-button-m ${
              history.revoked ? 'text-coolgray-30 line-through' : 'font-semibold text-primary-60'
            }`}
          >
            {formatPointAmount(history.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}
