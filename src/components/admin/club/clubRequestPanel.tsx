/**
 * [관리자 > 동아리 관리 > 요청 관리]
 * 왼쪽 목록(검토 중 기본: 먼저 들어온 순, 그 밖: 최신순, No는 먼저 들어온 요청이 1번)에서 요청을 고르면 오른쪽에 요청자(실명·회원 ID)·동아리와의 관계·연락처와 현재 값·요청 값 비교표를 보여준다.
 * 회원이 검토 중 요청을 고쳐 다시 보내면 기존 요청은 '취소'로 남고 새 요청이 검토 대기 맨 뒤로 들어간다.
 * 승인하면 바로 공개 화면에 반영되고 요청자에게 직접 수정 권한이 생긴다. 반려는 사유를 적어야 하며 요청자의 내 요청 내역에 보인다.
 */
import { useState } from 'react';

import { FilterChips } from '@/components/admin/report/reportListControls';
import Button from '@/components/common/inputs/button';
import {
  CLUB_POINTS,
  CLUB_REQUEST_STATUS_LABELS,
  CLUB_REQUEST_TYPE_LABELS,
  CLUB_REQUESTER_ROLE_LABELS,
} from '@/constants/club';
import { ADMIN_INPUT_CLASS } from '@/constants/inputStyles';
import { useApproveClubRequest, useRejectClubRequest } from '@/hooks/admin/mutations/useAdminClubActions';
import { useAdminClubRequests } from '@/hooks/admin/queries/useAdminClubs';
import { useModalStore } from '@/stores/modalStore';
import type { TClubRequestStatus } from '@/types/club/TClub';
import type { TAdminClubRequest } from '@/types/club/TClubAdmin';
import { formatAdminDateTime } from '@/utils/admin/report';
import { describeRequestChanges, numberRequestsByOldest } from '@/utils/club/clubAdmin';

const STATUS_OPTIONS: { value: TClubRequestStatus | null; label: string }[] = [
  { value: 'PENDING', label: CLUB_REQUEST_STATUS_LABELS.PENDING },
  { value: 'APPROVED', label: CLUB_REQUEST_STATUS_LABELS.APPROVED },
  { value: 'REJECTED', label: CLUB_REQUEST_STATUS_LABELS.REJECTED },
  { value: 'CANCELED', label: CLUB_REQUEST_STATUS_LABELS.CANCELED },
  { value: null, label: '전체' },
];

const REQUEST_STATUS_BADGE: Record<TClubRequestStatus, string> = {
  PENDING: 'bg-primary-30 text-primary-90',
  APPROVED: 'bg-chip-green-bg text-chip-green',
  REJECTED: 'bg-chip-red-bg text-chip-red',
  CANCELED: 'bg-coolgray-10 text-coolgray-60',
};

const REJECT_REASON_MAX = 200;

export default function ClubRequestPanel() {
  const [status, setStatus] = useState<TClubRequestStatus | null>('PENDING');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: requests, isPending } = useAdminClubRequests(status);
  const selected = requests?.find((request) => request.id === selectedId) ?? null;
  const numbers = numberRequestsByOldest(requests ?? []);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <section
        aria-label="동아리 요청 목록"
        className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm xl:col-span-2"
      >
        <FilterChips label="요청 상태" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
        {requests && <p className="text-body-s text-coolgray-60">총 {requests.length}건</p>}
        {isPending ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">불러오는 중이에요</p>
        ) : !requests || requests.length === 0 ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">요청이 없어요.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-coolgray-10">
            {requests.map((request) => (
              <li key={request.id}>
                <button
                  type="button"
                  aria-pressed={selectedId === request.id}
                  onClick={() => setSelectedId(request.id)}
                  className={`flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left hover:bg-primary-30/50 ${
                    selectedId === request.id ? 'bg-primary-30' : ''
                  }`}
                >
                  <span className="w-8 shrink-0 text-center text-body-s text-coolgray-60">
                    {numbers.get(request.id)}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="flex items-center gap-2 text-body-m text-coolgray-90">
                      <span className={`rounded-full px-2 py-0.5 text-body-xs ${REQUEST_STATUS_BADGE[request.status]}`}>
                        {CLUB_REQUEST_STATUS_LABELS[request.status]}
                      </span>
                      <span className="text-body-s text-coolgray-60">{CLUB_REQUEST_TYPE_LABELS[request.type]}</span>
                      {request.clubName}
                    </span>
                    <span className="text-body-xs text-coolgray-60">
                      {formatAdminDateTime(request.requestedAt)} · {request.requester.name ?? '탈퇴한 회원'} ·{' '}
                      {request.requester.role ? CLUB_REQUESTER_ROLE_LABELS[request.requester.role] : '관계 정보 없음'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-label="동아리 요청 상세" className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-3">
        {selected ? (
          <RequestDetail key={selected.id} request={selected} />
        ) : (
          <p className="py-10 text-center text-body-m text-coolgray-60">왼쪽에서 요청을 골라주세요.</p>
        )}
      </section>
    </div>
  );
}

// 승인하면 생기는 일. 포인트 적립은 서버가 판정하며 여기서는 안내만 한다.
const approveEffects = (request: TAdminClubRequest) => {
  const effects = ['요청 내용이 동아리 쇼핑 화면에 바로 반영돼요.'];
  if (request.type === 'REGISTER')
    effects.unshift(`정식 동아리로 공개되고 최초 등록 ${CLUB_POINTS.FIRST_REGISTRATION}P 적립 대상이에요.`);
  if (request.type === 'RECRUITMENT') effects.push(`새 모집이면 ${CLUB_POINTS.RECRUITMENT}P 적립 대상이에요.`);
  if (request.requester.memberId !== null)
    effects.push(`${request.requester.name ?? '요청자'}님에게 이 동아리 직접 수정 권한이 생겨요.`);
  return effects;
};

function RequestDetail({ request }: { request: TAdminClubRequest }) {
  const approve = useApproveClubRequest();
  const reject = useRejectClubRequest();
  const openConfirm = useModalStore((state) => state.openConfirm);
  const [onlyChanged, setOnlyChanged] = useState(request.type === 'EDIT');
  const [reason, setReason] = useState('');
  const rows = describeRequestChanges(request);
  const visibleRows = onlyChanged ? rows.filter((row) => row.changed) : rows;
  const isPendingRequest = request.status === 'PENDING';
  const busy = approve.isPending || reject.isPending;

  const confirmApprove = () =>
    openConfirm({
      title: '동아리 관리',
      action: `${request.clubName} ${CLUB_REQUEST_TYPE_LABELS[request.type]} 요청을 승인할까요?`,
      details: (
        <ul className="ml-4 list-disc text-body-s text-coolgray-90">
          {approveEffects(request).map((effect) => (
            <li key={effect}>{effect}</li>
          ))}
        </ul>
      ),
      confirmText: '승인',
      onConfirm: () => approve.mutate(request.id),
    });

  const confirmReject = () =>
    openConfirm({
      title: '동아리 관리',
      action: `${request.clubName} ${CLUB_REQUEST_TYPE_LABELS[request.type]} 요청을 반려할까요?`,
      description: '반려 사유는 요청자의 내 요청 내역에 그대로 보여요.',
      details: <p className="whitespace-pre-line break-keep text-body-s text-coolgray-90">{reason.trim()}</p>,
      confirmText: '반려',
      confirmVariant: 'alert',
      onConfirm: () => reject.mutate({ requestId: request.id, reason: reason.trim() }),
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-body-xs ${REQUEST_STATUS_BADGE[request.status]}`}>
            {CLUB_REQUEST_STATUS_LABELS[request.status]}
          </span>
          <span className="text-body-s text-coolgray-60">{CLUB_REQUEST_TYPE_LABELS[request.type]}</span>
        </div>
        <h2 className="text-heading-5 text-coolgray-90">{request.clubName}</h2>
        <dl className="grid grid-cols-[112px_1fr] gap-x-3 gap-y-1 text-body-s">
          <dt className="text-coolgray-60">요청자</dt>
          <dd className="text-coolgray-90">
            {request.requester.name ?? '탈퇴한 회원'}{' '}
            {request.requester.memberId !== null && (
              <span className="text-coolgray-60">(ID #{request.requester.memberId})</span>
            )}
          </dd>
          <dt className="text-coolgray-60">동아리와의 관계</dt>
          <dd className="text-coolgray-90">
            {request.requester.role ? CLUB_REQUESTER_ROLE_LABELS[request.requester.role] : '보유 기간 경과로 삭제됨'}
          </dd>
          <dt className="text-coolgray-60">확인 연락처</dt>
          <dd className="text-coolgray-90">{request.requester.contact ?? '보유 기간 경과로 삭제됨'}</dd>
          <dt className="text-coolgray-60">요청 시각</dt>
          <dd className="text-coolgray-90">{formatAdminDateTime(request.requestedAt)}</dd>
          {request.processedAt && (
            <>
              <dt className="text-coolgray-60">처리 시각</dt>
              <dd className="text-coolgray-90">{formatAdminDateTime(request.processedAt)}</dd>
            </>
          )}
          {request.rejectReason && (
            <>
              <dt className="text-coolgray-60">반려 사유</dt>
              <dd className="whitespace-pre-line break-keep text-alert">{request.rejectReason}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-heading-6 text-coolgray-90">
            {request.before ? '현재 값과 요청 값' : '요청 내용'}
            <span className="ml-2 text-body-s text-coolgray-60">
              바뀐 항목 {rows.filter((row) => row.changed).length}개
            </span>
          </h3>
          {request.before && (
            <label className="flex cursor-pointer items-center gap-1.5 text-body-s text-coolgray-90">
              <input
                type="checkbox"
                checked={onlyChanged}
                onChange={(event) => setOnlyChanged(event.target.checked)}
                className="h-4 w-4 accent-primary-60"
              />
              바뀐 항목만
            </label>
          )}
        </div>
        <table className="w-full table-fixed border-collapse text-left text-body-s">
          <thead>
            <tr className="border-b border-coolgray-20 text-coolgray-60">
              <th className="w-32 py-2 font-normal">항목</th>
              {request.before && <th className="py-2 font-normal">현재</th>}
              <th className="py-2 font-normal">요청</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.label}
                className={`border-b border-coolgray-10 align-top ${request.before && row.changed ? 'bg-primary-30/40' : ''}`}
              >
                <th scope="row" className="py-2 pr-2 font-normal text-coolgray-60">
                  {row.label}
                </th>
                {request.before && (
                  <td className="whitespace-pre-line break-all py-2 pr-2 text-coolgray-60">{row.before}</td>
                )}
                <td
                  className={`whitespace-pre-line break-all py-2 ${
                    request.before && row.changed ? 'font-semibold text-coolgray-90' : 'text-coolgray-90'
                  }`}
                >
                  {row.after}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPendingRequest && (
        <div className="flex flex-col gap-3 border-t border-coolgray-20 pt-5">
          <label className="flex flex-col gap-1 text-body-s text-coolgray-90">
            반려 사유 (반려할 때만)
            <textarea
              rows={3}
              value={reason}
              maxLength={REJECT_REASON_MAX}
              placeholder="요청자가 무엇을 보완하면 되는지 적어주세요."
              onChange={(event) => setReason(event.target.value)}
              className={`${ADMIN_INPUT_CLASS} resize-none`}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant={reason.trim() && !busy ? 'alert' : 'disabled'}
              className="w-28 py-2.5"
              onClick={confirmReject}
            >
              반려
            </Button>
            <Button variant={busy ? 'disabled' : 'primary'} className="w-28 py-2.5" onClick={confirmApprove}>
              승인
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
