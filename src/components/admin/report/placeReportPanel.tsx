/**
 * [관리자 > 신고 관리 > 장소 신고]
 * 왼쪽 목록(대기 기본, 최신순)에서 신고를 고르면 오른쪽에 장소 정보·같은 장소 신고·최근 수정 이력(수정자)을 보여준다.
 * 처리: 장소 숨김·해제, 신고 처리 완료·기각, 수정 되돌리기, 등록자·수정자 정지(정지하면 신고 처리 완료).
 */
import { useState } from 'react';

import AdminMemberCell from '@/components/admin/report/adminMemberCell';
import { PageControls, ReportStatusFilter } from '@/components/admin/report/reportListControls';
import SuspensionDialog from '@/components/admin/report/suspensionDialog';
import Button from '@/components/common/inputs/button';
import { PLACE_CATEGORY_BY_VALUE, PLACE_TAG_LABELS } from '@/constants/place';
import {
  useAdminPlaceVisibility,
  useAdminReportAction,
  useAdminReportSuspension,
  useAdminRevertEdit,
} from '@/hooks/admin/mutations/useAdminReportActions';
import { useAdminPlaceReport, useAdminPlaceReports } from '@/hooks/admin/queries/useAdminReports';
import useAdminConfirm from '@/hooks/admin/useAdminConfirm';
import type { TAdminMember, TReportStatus } from '@/types/admin/TAdminReport';
import {
  describeInfoChanges,
  formatAdminDateTime,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  STATUS_BADGE_CLASS,
} from '@/utils/admin/report';

export default function PlaceReportPanel({ onSelectMember }: { onSelectMember: (memberId: number) => void }) {
  const [status, setStatus] = useState<TReportStatus | null>('PENDING');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: list, isPending } = useAdminPlaceReports(status, page);

  return (
    <div className="grid grid-cols-5 gap-6">
      <section
        aria-label="장소 신고 목록"
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
                    {item.category && PLACE_CATEGORY_BY_VALUE[item.category].emoji} {item.placeName ?? '삭제된 장소'}
                    {item.placeStatus === 'HIDDEN' && <span className="text-body-xs text-alert">숨김</span>}
                    <span className="ml-auto text-body-xs text-coolgray-60">대기 {item.pendingCount}건</span>
                  </span>
                  <span className="text-body-s text-coolgray-90">
                    {REPORT_REASON_LABELS[item.reason]}
                    {item.description && <span className="text-coolgray-60"> · {item.description}</span>}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-body-xs text-coolgray-60">
                    {formatAdminDateTime(item.createdAt)}
                    <AdminMemberCell label="신고자" member={item.reporter} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {list && <PageControls page={list.page} size={list.size} totalCount={list.totalCount} onChange={setPage} />}
      </section>
      <section aria-label="장소 신고 상세" className="col-span-2 rounded-2xl bg-white p-6 shadow-sm">
        {selectedId === null ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">왼쪽에서 신고를 골라주세요.</p>
        ) : (
          <PlaceReportDetail reportId={selectedId} onSelectMember={onSelectMember} />
        )}
      </section>
    </div>
  );
}

export function PlaceReportDetail({
  reportId,
  onSelectMember,
}: {
  reportId: number;
  onSelectMember: (id: number) => void;
}) {
  const { data: detail, isPending } = useAdminPlaceReport(reportId);
  const action = useAdminReportAction();
  const visibility = useAdminPlaceVisibility();
  const revert = useAdminRevertEdit();
  const suspend = useAdminReportSuspension();
  const confirm = useAdminConfirm();
  const [suspendTarget, setSuspendTarget] = useState<TAdminMember | null>(null);

  if (isPending || !detail) return <p className="py-10 text-center text-body-m text-coolgray-60">불러오는 중이에요</p>;
  const { report, place } = detail;
  const isPendingReport = report.status === 'PENDING';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-heading-5 text-coolgray-90">
          {PLACE_CATEGORY_BY_VALUE[place.category].emoji} {place.name}
          {place.status === 'HIDDEN' && <span className="ml-2 text-body-s text-alert">숨김</span>}
        </h2>
        <p className="text-body-s text-coolgray-90">
          {REPORT_REASON_LABELS[report.reason]}
          {report.description && ` · ${report.description}`}
        </p>
        <AdminMemberCell label="신고자" member={report.reporter} onSelect={onSelectMember} />
        <AdminMemberCell label="등록자" member={detail.registrant} onSelect={onSelectMember} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={place.status === 'HIDDEN' ? 'outlined' : 'alert'}
          className="px-4 py-2"
          onClick={() =>
            confirm(
              place.status === 'HIDDEN'
                ? {
                    action: `${place.name}을 다시 지도에 보이게 할까요?`,
                    description: '이 장소의 처리 대기 신고는 기각돼요.',
                    confirmText: '숨김 해제',
                    onConfirm: () => visibility.mutate({ placeId: place.id, hidden: false }),
                  }
                : {
                    action: `${place.name}을 지도에서 숨길까요?`,
                    description: '숨기면 지도·장소 정보에서 사라지고, 이 장소의 처리 대기 신고는 처리 완료돼요.',
                    confirmText: '숨기기',
                    danger: true,
                    onConfirm: () => visibility.mutate({ placeId: place.id, hidden: true }),
                  },
            )
          }
        >
          {place.status === 'HIDDEN' ? '숨김 해제' : '장소 숨김'}
        </Button>
        <Button
          variant={isPendingReport ? 'primary' : 'disabled'}
          className="px-4 py-2"
          onClick={() =>
            confirm({
              action: '이 신고를 처리 완료할까요?',
              description: '처리한 신고는 다시 대기로 되돌릴 수 없어요.',
              confirmText: '처리 완료',
              onConfirm: () => action.mutate({ target: 'places', reportId, action: 'resolve' }),
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
              onConfirm: () => action.mutate({ target: 'places', reportId, action: 'reject' }),
            })
          }
        >
          기각
        </Button>
        {detail.registrant && (
          <Button variant="outlined" className="px-4 py-2" onClick={() => setSuspendTarget(detail.registrant)}>
            등록자 정지
          </Button>
        )}
      </div>

      <dl className="flex flex-col gap-1 rounded-lg bg-coolgray-10 px-4 py-3 text-body-s">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-coolgray-60">영업시간</dt>
          <dd>{place.businessHours ?? '-'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-coolgray-60">설명</dt>
          <dd className="whitespace-pre-line">{place.description ?? '-'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-coolgray-60">메뉴</dt>
          <dd>{place.menus.map((menu) => menu.name).join(', ') || '-'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-coolgray-60">숨은 맛집</dt>
          <dd>{place.tags.map((tag) => PLACE_TAG_LABELS[tag]).join(', ') || '-'}</dd>
        </div>
      </dl>

      <section className="flex flex-col gap-3">
        <h3 className="text-button-m text-coolgray-90">최근 수정 이력</h3>
        {detail.editHistories.length === 0 ? (
          <p className="text-body-s text-coolgray-60">수정 이력이 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {detail.editHistories.map((history) => (
              <li key={history.historyId} className="flex flex-col gap-2 rounded-lg border border-coolgray-20 p-3">
                <span className="flex flex-wrap items-center gap-2 text-body-xs text-coolgray-60">
                  {formatAdminDateTime(history.editedAt)}
                  <AdminMemberCell label="수정자" member={history.editor} onSelect={onSelectMember} />
                </span>
                <ul className="flex flex-col gap-0.5 text-body-s text-coolgray-90">
                  {describeInfoChanges(history.before, history.after).map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
                <span className="flex gap-2">
                  <Button
                    variant="outlined"
                    className="px-3 py-1.5"
                    onClick={() =>
                      confirm({
                        action: '이 수정 전 정보로 되돌릴까요?',
                        description:
                          '영업시간·설명·메뉴·숨은 맛집이 이 수정 전 값으로 바뀌고, 관리자 수정으로 이력에 남아요.',
                        confirmText: '되돌리기',
                        danger: true,
                        onConfirm: () => revert.mutate({ placeId: place.id, historyId: history.historyId }),
                      })
                    }
                  >
                    이 수정 되돌리기
                  </Button>
                  {history.editor && (
                    <Button variant="outlined" className="px-3 py-1.5" onClick={() => setSuspendTarget(history.editor)}>
                      수정자 정지
                    </Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-button-m text-coolgray-90">이 장소의 신고 {detail.placeReports.length}건</h3>
        <ul className="flex flex-col gap-1 text-body-s">
          {detail.placeReports.map((item) => (
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

      {suspendTarget && (
        <SuspensionDialog
          member={suspendTarget}
          title="장소 신고로 회원 정지"
          isSubmitting={suspend.isPending}
          onClose={() => setSuspendTarget(null)}
          onSubmit={(days, note) =>
            suspend.mutate(
              { target: 'places', reportId, body: { memberId: suspendTarget.memberId, days, note } },
              { onSuccess: () => setSuspendTarget(null) },
            )
          }
        />
      )}
    </div>
  );
}
