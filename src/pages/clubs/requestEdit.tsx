/**
 * [동아리] 요청 수정해서 다시 보내기 페이지 (/clubs/requests/edit?request=ID)
 * 내 요청 내역의 검토 중·반려 요청을 보냈던 내용 그대로 불러와 고친 뒤 다시 승인 요청한다.
 * 검토 중이던 요청은 취소되고 새 요청으로 검토 순서가 뒤로 밀린다. 반려된 요청은 반려 사유를 위에 보여준다.
 */
import { useSearchParams } from 'react-router-dom';

import ClubForm from '@/components/club/clubForm';
import ClubFormPageLayout from '@/components/club/clubFormPageLayout';
import ClubRecruitmentForm from '@/components/club/clubRecruitmentForm';
import Loading from '@/components/common/feedback/loading';
import { CLUB_REQUEST_TYPE_LABELS } from '@/constants/club';
import { useClubDetail, useMyClubRequestDetail } from '@/hooks/club/useClubQueries';
import NotFound from '@/pages/exception/notFound';
import { parseClubIdParam } from '@/utils/club/club';

export default function ClubRequestEdit() {
  const [searchParams] = useSearchParams();
  const requestId = parseClubIdParam(searchParams.get('request'));
  const request = useMyClubRequestDetail(requestId);
  // 수정·모집 요청은 동아리 정보(사진·진행 중 모집)가 함께 필요하다. 신규 등록은 동아리가 아직 없다.
  const clubId = request.data && request.data.type !== 'REGISTER' ? request.data.clubId : null;
  const club = useClubDetail(clubId);

  if (requestId === null) return <NotFound />;
  if (request.isPending || (clubId !== null && club.isPending)) return <Loading />;
  if (request.isError) return <NotFound error={request.error} />;
  if (club.isError) return <NotFound error={club.error} />;

  const detail = request.data;
  const canResubmit = detail.status === 'PENDING' || detail.status === 'REJECTED';

  return (
    <ClubFormPageLayout
      title="요청 수정해서 다시 보내기"
      subtitle={`${detail.clubName} · ${CLUB_REQUEST_TYPE_LABELS[detail.type]}`}
    >
      {!canResubmit ? (
        <p className="rounded-xl bg-coolgray-10 px-4 py-6 text-center text-body-m text-coolgray-60">
          이미 처리된 요청이라 다시 보낼 수 없어요.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-xl border border-coolgray-20 bg-coolgray-10/40 px-4 py-3 text-body-s break-keep text-coolgray-90">
            {detail.status === 'PENDING' ? (
              <p>
                검토 중인 요청이에요. 다시 보내면 <strong>지금 요청은 취소</strong>되고 새 요청으로 검토 순서가 뒤로
                밀려요.
              </p>
            ) : (
              <>
                <p>반려된 요청이에요. 사유를 확인하고 보완해서 다시 보내주세요.</p>
                {detail.rejectReason && <p className="text-alert">반려 사유: {detail.rejectReason}</p>}
              </>
            )}
            {detail.type === 'REGISTER' && <p className="text-coolgray-60">사진은 다시 올려주세요.</p>}
          </div>
          {detail.type === 'RECRUITMENT' ? (
            club.data && (
              <ClubRecruitmentForm club={club.data} resubmit={{ requestId: detail.id, body: detail.after }} />
            )
          ) : (
            <ClubForm club={club.data ?? null} resubmit={{ requestId: detail.id, body: detail.after }} />
          )}
        </>
      )}
    </ClubFormPageLayout>
  );
}
