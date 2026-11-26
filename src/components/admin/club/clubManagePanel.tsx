/**
 * [관리자 > 동아리 관리 > 동아리]
 * 왼쪽에 동아리 목록(먼저 등록된 순 No, 이름 검색)과 임시 등록 버튼, 오른쪽에 고른 동아리의 상태·정보 수정 버튼과
 * 직접 수정 권한이 있는 회원 목록(권한 회수)을 둔다. 회수하면 그 회원의 다음 수정부터 다시 승인 요청이 된다.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { KeywordSearch } from '@/components/admin/report/reportListControls';
import { RecruitmentBadge } from '@/components/club/clubBadges';
import Button from '@/components/common/inputs/button';
import { CLUB_AFFILIATION_LABELS, CLUB_REGISTRATION_LABELS } from '@/constants/club';
import { useRevokeClubEditor } from '@/hooks/admin/mutations/useAdminClubActions';
import { useAdminClubs } from '@/hooks/admin/queries/useAdminClubs';
import { useModalStore } from '@/stores/modalStore';
import type { TAdminClub, TAdminClubEditor } from '@/types/club/TClubAdmin';
import { formatAdminDateTime } from '@/utils/admin/report';

const REGISTRATION_BADGE = {
  PROVISIONAL: 'bg-primary-30 text-primary-90',
  OFFICIAL: 'bg-coolgray-10 text-coolgray-90',
} as const;

export default function ClubManagePanel() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [now] = useState(() => new Date());
  const { data: clubs, isPending } = useAdminClubs(keyword);
  const selected = clubs?.find((club) => club.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <section
        aria-label="동아리 목록"
        className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm xl:col-span-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <KeywordSearch label="동아리 이름 검색" placeholder="동아리 이름" onSearch={setKeyword} />
          <Button className="px-5 py-2" onClick={() => navigate('/admin/clubs/register')}>
            동아리 임시 등록
          </Button>
        </div>
        {clubs && <p className="text-body-s text-coolgray-60">총 {clubs.length}개</p>}
        {isPending ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">불러오는 중이에요</p>
        ) : !clubs || clubs.length === 0 ? (
          <p className="py-10 text-center text-body-m text-coolgray-60">동아리가 없어요.</p>
        ) : (
          <table className="w-full table-fixed border-collapse text-left text-body-s">
            <thead>
              <tr className="border-b border-coolgray-20 text-coolgray-60">
                <th className="w-12 py-2 text-center font-normal">No</th>
                <th className="py-2 font-normal">이름</th>
                <th className="w-32 py-2 font-normal">소속</th>
                <th className="w-24 py-2 font-normal">등록</th>
                <th className="w-28 py-2 font-normal">모집</th>
                <th className="w-24 py-2 font-normal">직접 수정</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club, index) => (
                <tr
                  key={club.id}
                  className={`border-b border-coolgray-10 hover:bg-primary-30/50 ${
                    selectedId === club.id ? 'bg-primary-30' : ''
                  }`}
                >
                  <td className="py-2.5 text-center text-coolgray-60">{index + 1}</td>
                  <td className="truncate py-2.5 pr-2 text-body-m text-coolgray-90">
                    <button
                      type="button"
                      aria-pressed={selectedId === club.id}
                      className="cursor-pointer text-left hover:text-primary-60"
                      onClick={() => setSelectedId(club.id)}
                    >
                      {club.name}
                    </button>
                    {!club.activityConfirmed && <span className="ml-1 text-body-xs text-coolgray-60">활동 미확인</span>}
                  </td>
                  <td className="truncate py-2.5 text-coolgray-90">{CLUB_AFFILIATION_LABELS[club.affiliation]}</td>
                  <td className="py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-body-xs ${REGISTRATION_BADGE[club.registration]}`}>
                      {CLUB_REGISTRATION_LABELS[club.registration]}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <RecruitmentBadge recruitment={club.recruitment} now={now} />
                  </td>
                  <td className="py-2.5 text-coolgray-90">{club.editors.length}명</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section aria-label="동아리 상세" className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
        {selected ? (
          <ClubManageDetail club={selected} />
        ) : (
          <p className="py-10 text-center text-body-m text-coolgray-60">왼쪽에서 동아리를 골라주세요.</p>
        )}
      </section>
    </div>
  );
}

function ClubManageDetail({ club }: { club: TAdminClub }) {
  const navigate = useNavigate();
  const revoke = useRevokeClubEditor();
  const openConfirm = useModalStore((state) => state.openConfirm);

  const confirmRevoke = (editor: TAdminClubEditor) =>
    openConfirm({
      title: '동아리 관리',
      action: `${editor.name}님의 ${club.name} 직접 수정 권한을 회수할까요?`,
      description: '회수하면 이 회원의 정보 수정·모집 등록이 다시 관리자 승인 요청으로 들어와요.',
      confirmText: '권한 회수',
      confirmVariant: 'alert',
      onConfirm: () => revoke.mutate({ clubId: club.id, memberId: editor.memberId }),
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className={`w-fit rounded-full px-2 py-0.5 text-body-xs ${REGISTRATION_BADGE[club.registration]}`}>
          {CLUB_REGISTRATION_LABELS[club.registration]}
        </span>
        <h2 className="text-heading-5 text-coolgray-90">{club.name}</h2>
        <p className="text-body-s text-coolgray-60">
          {CLUB_AFFILIATION_LABELS[club.affiliation]} · 마지막 수정 {formatAdminDateTime(club.updatedAt)}
        </p>
        {club.registration === 'PROVISIONAL' && (
          <p className="break-keep rounded-lg bg-primary-30 px-3 py-2 text-body-s text-primary-90">
            관리자가 임시 등록한 동아리예요. 회원 요청이 승인되면 정식 등록으로 바뀌어요.
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Button className="flex-1 py-2.5" onClick={() => navigate(`/admin/clubs/edit?club=${club.id}`)}>
            정보 수정
          </Button>
          <Button variant="outlined" className="flex-1 py-2.5" onClick={() => navigate(`/clubs?club=${club.id}`)}>
            공개 화면 보기
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-heading-6 text-coolgray-90">직접 수정 권한 회원 {club.editors.length}명</h3>
        <p className="break-keep text-body-s text-coolgray-60">
          이 동아리의 요청이 승인된 회원은 승인 없이 정보 수정·모집 등록을 할 수 있어요.
        </p>
        {club.editors.length === 0 ? (
          <p className="rounded-lg bg-coolgray-10 px-3 py-4 text-center text-body-s text-coolgray-60">
            직접 수정 권한이 있는 회원이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-coolgray-10">
            {club.editors.map((editor) => (
              <li key={editor.memberId} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex flex-col">
                  <span className="text-body-m text-coolgray-90">
                    {editor.name} <span className="text-body-xs text-coolgray-60">(ID #{editor.memberId})</span>
                  </span>
                  <span className="text-body-xs text-coolgray-60">
                    권한 부여 {formatAdminDateTime(editor.grantedAt)}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={revoke.isPending}
                  onClick={() => confirmRevoke(editor)}
                  className="shrink-0 cursor-pointer rounded-full border border-coolgray-30 px-3 py-1 text-body-s text-coolgray-90 hover:border-alert hover:text-alert disabled:cursor-default disabled:opacity-40"
                >
                  권한 회수
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
