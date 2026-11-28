/**
 * [동아리] 정보 수정 페이지 (/clubs/edit?club=ID)
 * 승인 이력이 있는 회원은 바로 반영, 그 외 회원은 관리자 승인 요청으로 보낸다.
 */
import ClubForm from '@/components/club/clubForm';
import ClubFormPageLayout from '@/components/club/clubFormPageLayout';
import Loading from '@/components/common/feedback/loading';
import useClubIdParam from '@/hooks/club/useClubIdParam';
import { useClubDetail } from '@/hooks/club/useClubQueries';
import NotFound from '@/pages/exception/notFound';

export default function ClubEdit() {
  const clubId = useClubIdParam();
  const { data: club, isPending, isError, error } = useClubDetail(clubId);

  if (clubId === null) return <NotFound />;
  if (isPending) return <Loading />;
  if (isError) return <NotFound error={error} source="club" />;

  return (
    <ClubFormPageLayout
      title={club.canEditDirectly ? '동아리 정보 수정' : '동아리 정보 수정 요청'}
      subtitle={club.name}
    >
      <ClubForm club={club} />
    </ClubFormPageLayout>
  );
}
