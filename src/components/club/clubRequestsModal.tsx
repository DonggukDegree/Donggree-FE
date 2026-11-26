/**
 * [동아리] 내 요청 내역 모달
 * 동아리 페이지의 버튼으로 연다. 승인이 필요한 요청(신규 등록·정보 수정·모집 등록)의 상태와 반려 사유를 보여준다.
 * 검토 중·반려된 요청은 '수정해서 다시 요청'으로 보냈던 내용을 이어서 고칠 수 있다. 검토 중 요청을 다시 보내면
 * 기존 요청은 취소되고 새 요청으로 검토 순서가 뒤로 밀린다. 승인 없이 바로 반영된 변경은 요청이 아니라 여기에 나오지 않는다.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '@/components/common/feedback/loading';
import { CLUB_REQUEST_STATUS_LABELS, CLUB_REQUEST_TYPE_LABELS } from '@/constants/club';
import { useMyClubRequests } from '@/hooks/club/useClubQueries';
import type { TClubRequestStatus } from '@/types/club/TClub';
import { formatDateTime } from '@/utils/date';

const STATUS_STYLE: Record<TClubRequestStatus, string> = {
  PENDING: 'bg-primary-30 text-primary-90',
  APPROVED: 'bg-chip-green-bg text-chip-green',
  REJECTED: 'bg-chip-red-bg text-chip-red',
  CANCELED: 'bg-coolgray-10 text-coolgray-60',
};

export default function ClubRequestsModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { data: requests, isLoading, isError } = useMyClubRequests(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay lg:items-center lg:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="club-requests-title"
        className="flex max-h-[85dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-2xl bg-white lg:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-coolgray-20 px-5 py-4">
          <h2 id="club-requests-title" className="text-heading-6 text-coolgray-90">
            내 요청 내역
          </h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-heading-6 text-coolgray-60 hover:bg-coolgray-10"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          {isLoading && <Loading variant="inline" />}
          {isError && <p className="py-10 text-center text-body-s text-coolgray-60">요청 내역을 불러오지 못했어요.</p>}
          {requests && requests.length === 0 && (
            <p className="py-10 text-center text-body-s text-coolgray-60">아직 보낸 요청이 없어요.</p>
          )}
          {requests && requests.length > 0 && (
            <ul className="flex flex-col divide-y divide-coolgray-20">
              {requests.map((request) => (
                <li key={request.id} className="flex flex-col gap-1.5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-button-m text-coolgray-90">
                      <span className="text-coolgray-60">{CLUB_REQUEST_TYPE_LABELS[request.type]}</span> ·{' '}
                      {request.clubName}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-body-xs ${STATUS_STYLE[request.status]}`}
                    >
                      {CLUB_REQUEST_STATUS_LABELS[request.status]}
                    </span>
                  </div>
                  <p className="text-body-xs text-coolgray-60">
                    요청 {formatDateTime(request.requestedAt)}
                    {request.processedAt && ` · 처리 ${formatDateTime(request.processedAt)}`}
                  </p>
                  {request.rejectReason && (
                    <p className="break-keep rounded-lg bg-coolgray-10 p-3 text-body-s text-coolgray-90">
                      반려 사유: {request.rejectReason}
                    </p>
                  )}
                  {request.status === 'CANCELED' && (
                    <p className="text-body-xs text-coolgray-60">수정해서 다시 요청해 취소된 요청이에요.</p>
                  )}
                  {(request.status === 'PENDING' || request.status === 'REJECTED') && (
                    <button
                      type="button"
                      onClick={() => navigate(`/clubs/requests/edit?request=${request.id}`)}
                      className="w-fit cursor-pointer rounded-full border border-coolgray-30 px-3 py-1.5 text-button-s text-coolgray-90 hover:border-primary-60 hover:text-primary-60"
                    >
                      수정해서 다시 요청
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
