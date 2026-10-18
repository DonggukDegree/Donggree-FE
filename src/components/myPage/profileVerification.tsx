/** [프로필 관리] PDF 본인 인증과 학교 이메일 인증 상태 및 인증 페이지 진입 */
import { useNavigate } from 'react-router-dom';

import Chip from '@/components/common/feedback/chip';
import Button from '@/components/common/inputs/button';
import useSchoolEmailVerification from '@/hooks/user/useSchoolEmailVerification';

export default function ProfileVerification({ identityVerified }: { identityVerified: boolean }) {
  const navigate = useNavigate();
  const { data, isPending } = useSchoolEmailVerification();

  return (
    <div className="flex max-w-full flex-col items-center gap-3 lg:items-start">
      <Chip
        variant={identityVerified ? 'satisfied' : 'unsatisfied'}
        label={identityVerified ? '본인 인증 완료' : '본인 인증 미완료'}
      />
      {data?.schoolEmailVerified ? (
        <Chip variant="verified" label="학교 이메일 인증 완료" />
      ) : (
        !identityVerified && (
          <Button
            className="py-3.5"
            variant={isPending ? 'disabled' : 'outlined'}
            onClick={() => navigate('/my-page/school-email-verification')}
          >
            학교 이메일로 인증하기
          </Button>
        )
      )}
    </div>
  );
}
