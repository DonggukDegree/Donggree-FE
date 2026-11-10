/** [마이페이지 > 학교 이메일 인증] 인증 상태 조회 */
import { getSchoolEmailVerification } from '@/apis/user/schoolEmailVerification';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

export default function useSchoolEmailVerification(pollDelivery = true) {
  return useCoreQuery(QUERY_KEYS.SCHOOL_EMAIL_VERIFICATION, getSchoolEmailVerification, {
    retry: false,
    refetchInterval: (query) =>
      pollDelivery && (query.state.data?.deliveryStatus === 'QUEUED' || query.state.data?.deliveryStatus === 'SENDING')
        ? 1000
        : false,
  });
}
