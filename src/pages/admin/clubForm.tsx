/**
 * [관리자 > 동아리 관리] 임시 등록 (/admin/clubs/register)·정보 수정 (/admin/clubs/edit?club=ID) 페이지
 * 회원 폼과 같은 입력 항목을 쓰되 승인 없이 바로 저장한다. 새 동아리는 임시 등록으로 공개된다.
 */
import ClubForm from '@/components/club/clubForm';
import Loading from '@/components/common/feedback/loading';
import useClubIdParam from '@/hooks/club/useClubIdParam';
import { useClubDetail } from '@/hooks/club/useClubQueries';
import NotFound from '@/pages/exception/notFound';
import type { TClubDetail } from '@/types/club/TClub';

function AdminClubFormLayout({ title, subtitle, club }: { title: string; subtitle: string; club: TClubDetail | null }) {
  return (
    <main className="flex-1 bg-primary-30/30 px-6 py-10 xl:px-10 xl:py-12">
      <div className="mx-auto flex w-full max-w-180 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-heading-3 text-coolgray-90">{title}</h1>
          <p className="break-keep text-body-m text-coolgray-60">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:p-8">
          <ClubForm club={club} admin />
        </div>
      </div>
    </main>
  );
}

export function AdminClubRegister() {
  return (
    <AdminClubFormLayout
      title="동아리 임시 등록"
      subtitle="초기 동아리 목록을 직접 입력해요. 회원 요청이 승인되면 정식 등록으로 바뀌어요."
      club={null}
    />
  );
}

export function AdminClubEdit() {
  const clubId = useClubIdParam();
  const { data: club, isPending, isError, error } = useClubDetail(clubId);

  if (clubId === null) return <NotFound />;
  if (isPending) return <Loading />;
  if (isError) return <NotFound error={error} />;

  return <AdminClubFormLayout title="동아리 정보 수정" subtitle={club.name} club={club} />;
}
