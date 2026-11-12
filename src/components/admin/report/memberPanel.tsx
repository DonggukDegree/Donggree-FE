/**
 * [관리자 > 신고 관리 > 회원]
 * 학번·이름·닉네임으로 회원을 찾아 이름·학번·단과대·학과·받은 신고 수를 보고, 고른 회원의 정지 이력을 확인한다.
 * 신고와 별개로 정지(일수 입력)하거나, 정지 중인 회원을 언제든 해제할 수 있다.
 */
import { useState } from 'react';

import AdminMemberCell from '@/components/admin/report/adminMemberCell';
import { PageControls } from '@/components/admin/report/reportListControls';
import SuspensionDialog from '@/components/admin/report/suspensionDialog';
import Button from '@/components/common/inputs/button';
import { INPUT_CLASS } from '@/constants/inputStyles';
import { useAdminLiftSuspension, useAdminMemberSuspension } from '@/hooks/admin/mutations/useAdminReportActions';
import { useAdminMember, useAdminMembers } from '@/hooks/admin/queries/useAdminReports';
import { formatAdminDateTime, isSuspendedNow } from '@/utils/admin/report';

interface IMemberPanelProps {
  selectedId: number | null;
  onSelect: (memberId: number) => void;
}

export default function MemberPanel({ selectedId, onSelect }: IMemberPanelProps) {
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const { data: list, isPending } = useAdminMembers(keyword, page);

  return (
    <div className="grid grid-cols-5 gap-6">
      <section aria-label="회원 목록" className="col-span-3 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setKeyword(input);
            setPage(0);
          }}
        >
          <input
            aria-label="회원 검색"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="학번·이름·닉네임"
            className={`${INPUT_CLASS} flex-1 border-coolgray-30`}
          />
          <Button type="submit" className="px-6">
            검색
          </Button>
        </form>
        {isPending ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">불러오는 중이에요</p>
        ) : !list || list.items.length === 0 ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">회원이 없어요.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-coolgray-10">
            {list.items.map(({ member, receivedReportCount }) => (
              <li key={member.memberId}>
                <button
                  type="button"
                  aria-pressed={selectedId === member.memberId}
                  onClick={() => onSelect(member.memberId)}
                  className={`flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left hover:bg-primary-30/50 ${
                    selectedId === member.memberId ? 'bg-primary-30' : ''
                  }`}
                >
                  <AdminMemberCell member={member} />
                  <span className="ml-auto shrink-0 text-body-xs text-coolgray-60">
                    받은 신고 {receivedReportCount}건
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {list && <PageControls page={list.page} size={list.size} totalCount={list.totalCount} onChange={setPage} />}
      </section>
      <section aria-label="회원 상세" className="col-span-2 rounded-2xl bg-white p-6 shadow-sm">
        {selectedId === null ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">왼쪽에서 회원을 골라주세요.</p>
        ) : (
          <MemberDetail memberId={selectedId} />
        )}
      </section>
    </div>
  );
}

function MemberDetail({ memberId }: { memberId: number }) {
  const { data: detail, isPending } = useAdminMember(memberId);
  const suspend = useAdminMemberSuspension();
  const lift = useAdminLiftSuspension();
  const [suspending, setSuspending] = useState(false);

  if (isPending || !detail) return <p className="py-10 text-center text-body-m text-coolgray-60">불러오는 중이에요</p>;
  const suspended = isSuspendedNow(detail.member);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <AdminMemberCell member={detail.member} />
        <p className="text-body-xs text-coolgray-60">
          {detail.role} · 가입 {formatAdminDateTime(detail.joinedAt)}
        </p>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-coolgray-10 px-2 py-3">
          <dt className="text-body-xs text-coolgray-60">받은 신고</dt>
          <dd className="text-heading-5 text-coolgray-90">{detail.receivedReportCount}</dd>
        </div>
        <div className="rounded-lg bg-coolgray-10 px-2 py-3">
          <dt className="text-body-xs text-coolgray-60">리뷰 신고</dt>
          <dd className="text-heading-5 text-coolgray-90">{detail.receivedReviewReportCount}</dd>
        </div>
        <div className="rounded-lg bg-coolgray-10 px-2 py-3">
          <dt className="text-body-xs text-coolgray-60">장소 신고 정지</dt>
          <dd className="text-heading-5 text-coolgray-90">{detail.placeReportSuspensionCount}</dd>
        </div>
      </dl>
      <div className="flex gap-2">
        <Button variant="alert" className="flex-1 py-2" onClick={() => setSuspending(true)}>
          {suspended ? '다시 정지' : '정지'}
        </Button>
        <Button
          variant={suspended ? 'outlined' : 'disabled'}
          className="flex-1 py-2"
          onClick={() => lift.mutate(memberId)}
        >
          정지 해제
        </Button>
      </div>
      <section className="flex flex-col gap-2">
        <h3 className="text-button-m text-coolgray-90">정지 이력 {detail.suspensions.length}건</h3>
        {detail.suspensions.length === 0 ? (
          <p className="text-body-s text-coolgray-60">정지 이력이 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-body-s">
            {detail.suspensions.map((suspension) => (
              <li key={suspension.id} className="flex flex-col gap-0.5 rounded-lg border border-coolgray-20 p-3">
                <span className="text-coolgray-90">
                  {suspension.days}일 · {suspension.source === 'REPORT' ? '신고 처리' : '관리자 판단'}
                  {suspension.reportType &&
                    ` (${suspension.reportType === 'PLACE' ? '장소' : '리뷰'} 신고 #${suspension.reportId})`}
                </span>
                <span className="text-body-xs text-coolgray-60">
                  {formatAdminDateTime(suspension.startsAt)} ~ {formatAdminDateTime(suspension.endsAt)}
                  {suspension.liftedAt && ` · ${formatAdminDateTime(suspension.liftedAt)} 해제`}
                </span>
                {suspension.note && <span className="text-body-xs text-coolgray-90">{suspension.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
      {suspending && (
        <SuspensionDialog
          member={detail.member}
          title="회원 정지"
          isSubmitting={suspend.isPending}
          onClose={() => setSuspending(false)}
          onSubmit={(days, note) =>
            suspend.mutate({ memberId, body: { days, note } }, { onSuccess: () => setSuspending(false) })
          }
        />
      )}
    </div>
  );
}
