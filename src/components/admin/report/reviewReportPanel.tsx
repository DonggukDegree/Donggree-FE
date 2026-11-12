/**
 * [관리자 > 신고 관리 > 리뷰 신고]
 * 왼쪽 목록에서 신고를 고르면 오른쪽에 리뷰 본문·작성자·같은 리뷰 신고를 보여준다.
 * 처리: 리뷰 숨김·해제, 신고 처리 완료·기각, 작성자 정지(정지하면 신고 처리 완료).
 */
import { useState } from 'react';

import AdminMemberCell from '@/components/admin/report/adminMemberCell';
import { PageControls, ReportStatusFilter } from '@/components/admin/report/reportListControls';
import SuspensionDialog from '@/components/admin/report/suspensionDialog';
import Button from '@/components/common/inputs/button';
import { ReviewStars } from '@/components/map/reviewStars';
import {
  useAdminReportAction,
  useAdminReportSuspension,
  useAdminReviewVisibility,
} from '@/hooks/admin/mutations/useAdminReportActions';
import { useAdminReviewReport, useAdminReviewReports } from '@/hooks/admin/queries/useAdminReports';
import useAdminConfirm from '@/hooks/admin/useAdminConfirm';
import type { TAdminReviewReport, TReportStatus } from '@/types/admin/TAdminReport';
import {
  formatAdminDateTime,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  reviewVisibilityConfirm,
  STATUS_BADGE_CLASS,
} from '@/utils/admin/report';

const reviewState = (item: TAdminReviewReport) =>
  item.reviewDeleted ? '작성자 삭제' : item.reviewStatus === 'HIDDEN' ? '숨김' : null;

export default function ReviewReportPanel({ onSelectMember }: { onSelectMember: (memberId: number) => void }) {
  const [status, setStatus] = useState<TReportStatus | null>('PENDING');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: list, isPending } = useAdminReviewReports(status, page);

  return (
    <div className="grid grid-cols-5 gap-6">
      <section
        aria-label="리뷰 신고 목록"
        className="col-span-3 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <ReportStatusFilter
          value={status}
          onChange={(next) => {
            setStatus(next);
            setPage(0);
          }}
        />
        {isPending ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">불러오는 중이에요</p>
        ) : !list || list.items.length === 0 ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">신고가 없어요.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-coolgray-10">
            {list.items.map((item) => (
              <li key={item.reportId}>
                <button
                  type="button"
                  aria-pressed={selectedId === item.reportId}
                  onClick={() => setSelectedId(item.reportId)}
                  className={`flex w-full cursor-pointer flex-col gap-1 px-3 py-3 text-left hover:bg-primary-30/50 ${
                    selectedId === item.reportId ? 'bg-primary-30' : ''
                  }`}
                >
                  <span className="flex items-center gap-2 text-body-m text-coolgray-90">
                    <span className={`rounded-full px-2 py-0.5 text-body-xs ${STATUS_BADGE_CLASS[item.status]}`}>
                      {REPORT_STATUS_LABELS[item.status]}
                    </span>
                    {item.placeName ?? '삭제된 장소'}
                    <ReviewStars rating={item.rating} className="text-body-xs" />
                    {reviewState(item) && <span className="text-body-xs text-alert">{reviewState(item)}</span>}
                    <span className="ml-auto text-body-xs text-coolgray-60">대기 {item.pendingCount}건</span>
                  </span>
                  <span className="line-clamp-1 text-body-s text-coolgray-90">{item.content}</span>
                  <span className="text-body-s text-coolgray-90">
                    {REPORT_REASON_LABELS[item.reason]}
                    {item.description && <span className="text-coolgray-60"> · {item.description}</span>}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-body-xs text-coolgray-60">
                    {formatAdminDateTime(item.createdAt)}
                    <AdminMemberCell label="작성자" member={item.author} />
                    <AdminMemberCell label="신고자" member={item.reporter} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {list && <PageControls page={list.page} size={list.size} totalCount={list.totalCount} onChange={setPage} />}
      </section>
      <section aria-label="리뷰 신고 상세" className="col-span-2 rounded-2xl bg-white p-6 shadow-sm">
        {selectedId === null ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">왼쪽에서 신고를 골라주세요.</p>
        ) : (
          <ReviewReportDetail reportId={selectedId} onSelectMember={onSelectMember} />
        )}
      </section>
    </div>
  );
}

function ReviewReportDetail({ reportId, onSelectMember }: { reportId: number; onSelectMember: (id: number) => void }) {
  const { data: detail, isPending } = useAdminReviewReport(reportId);
  const action = useAdminReportAction();
  const visibility = useAdminReviewVisibility();
  const suspend = useAdminReportSuspension();
  const confirm = useAdminConfirm();
  const [suspending, setSuspending] = useState(false);

  if (isPending || !detail) return <p className="py-10 text-center text-body-m text-coolgray-60">불러오는 중이에요</p>;
  const { report } = detail;
  const isPendingReport = report.status === 'PENDING';
  const hidden = report.reviewStatus === 'HIDDEN';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2 text-heading-5 text-coolgray-90">
          {report.placeName ?? '삭제된 장소'} <ReviewStars rating={report.rating} />
          {reviewState(report) && <span className="text-body-s text-alert">{reviewState(report)}</span>}
        </h2>
        <p className="whitespace-pre-line rounded-lg bg-coolgray-10 px-4 py-3 text-body-s text-coolgray-90">
          {report.content}
        </p>
        <AdminMemberCell label="작성자" member={report.author} onSelect={onSelectMember} />
        <p className="text-body-s text-coolgray-90">
          {REPORT_REASON_LABELS[report.reason]}
          {report.description && ` · ${report.description}`}
        </p>
        <AdminMemberCell label="신고자" member={report.reporter} onSelect={onSelectMember} />
      </div>

      <div className="flex flex-wrap gap-2">
        {!report.reviewDeleted && (
          <Button
            variant={hidden ? 'outlined' : 'alert'}
            className="px-4 py-2"
            onClick={() =>
              confirm({
                ...reviewVisibilityConfirm(!hidden),
                onConfirm: () => visibility.mutate({ reviewId: report.reviewId, hidden: !hidden }),
              })
            }
          >
            {hidden ? '숨김 해제' : '리뷰 숨김'}
          </Button>
        )}
        <Button
          variant={isPendingReport ? 'primary' : 'disabled'}
          className="px-4 py-2"
          onClick={() =>
            confirm({
              action: '이 신고를 처리 완료할까요?',
              description: '처리한 신고는 다시 대기로 되돌릴 수 없어요.',
              confirmText: '처리 완료',
              onConfirm: () => action.mutate({ target: 'reviews', reportId, action: 'resolve' }),
            })
          }
        >
          처리 완료
        </Button>
        <Button
          variant={isPendingReport ? 'outlined' : 'disabled'}
          className="px-4 py-2"
          onClick={() =>
            confirm({
              action: '이 신고를 기각할까요?',
              description: '기각한 신고는 다시 대기로 되돌릴 수 없어요.',
              confirmText: '기각',
              onConfirm: () => action.mutate({ target: 'reviews', reportId, action: 'reject' }),
            })
          }
        >
          기각
        </Button>
        {report.author && (
          <Button variant="outlined" className="px-4 py-2" onClick={() => setSuspending(true)}>
            작성자 정지
          </Button>
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="text-button-m text-coolgray-90">이 리뷰의 신고 {detail.reviewReports.length}건</h3>
        <ul className="flex flex-col gap-1 text-body-s">
          {detail.reviewReports.map((item) => (
            <li key={item.reportId} className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-body-xs ${STATUS_BADGE_CLASS[item.status]}`}>
                {REPORT_STATUS_LABELS[item.status]}
              </span>
              {REPORT_REASON_LABELS[item.reason]}
              <AdminMemberCell member={item.reporter} />
            </li>
          ))}
        </ul>
      </section>

      {suspending && report.author && (
        <SuspensionDialog
          member={report.author}
          title="리뷰 신고로 작성자 정지"
          isSubmitting={suspend.isPending}
          onClose={() => setSuspending(false)}
          onSubmit={(days, note) =>
            suspend.mutate(
              { target: 'reviews', reportId, body: { days, note } },
              { onSuccess: () => setSuspending(false) },
            )
          }
        />
      )}
    </div>
  );
}
