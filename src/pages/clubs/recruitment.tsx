/**
 * [동아리] 모집 등록 페이지 (/clubs/recruitment?club=ID)
 * 진행 중·예정 모집이 있으면 수정, 없거나 마감됐으면 새 모집을 등록한다.
 */
import ClubFormPageLayout from '@/components/club/clubFormPageLayout';
import ClubRecruitmentForm from '@/components/club/clubRecruitmentForm';
import Loading from '@/components/common/feedback/loading';
import useClubIdParam from '@/hooks/club/useClubIdParam';
import { useClubDetail } from '@/hooks/club/useClubQueries';
import NotFound from '@/pages/exception/notFound';

export default function ClubRecruitment() {
  const clubId = useClubIdParam();
  const { data: club, isPending, isError, error } = useClubDetail(clubId);

  if (clubId === null) return <NotFound />;
  if (isPending) return <Loading />;
  if (isError) return <NotFound error={error} />;

  return (
    <ClubFormPageLayout title="신입 부원 모집" subtitle={club.name}>
      <ClubRecruitmentForm club={club} />
    </ClubFormPageLayout>
  );
}
