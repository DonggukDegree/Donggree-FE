/**
 * [동아리] 신규 등록 페이지 (/clubs/register)
 * 학교 인증 회원 누구나 요청할 수 있고, 관리자가 실제 동아리인지 확인한 뒤 공개된다.
 */
import ClubForm from '@/components/club/clubForm';
import ClubFormPageLayout from '@/components/club/clubFormPageLayout';

export default function ClubRegister() {
  return (
    <ClubFormPageLayout title="신규 동아리 등록" subtitle="목록에 없는 동아리를 알려주세요.">
      <ClubForm club={null} />
    </ClubFormPageLayout>
  );
}
