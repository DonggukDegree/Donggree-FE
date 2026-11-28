/**
 * [동아리] 쓰기 버튼 학생 인증 확인
 * 등록·수정·모집·다시 요청 버튼은 누구에게나 보이되, 미인증 회원이 누르면 화면을 옮기지 않고 학생 인증 안내를 띄운다.
 * 서버도 쓰기 요청마다 다시 검증한다(CLUB403_1).
 */
import useUserInfo from '@/hooks/user/useUserInfo';
import { useModalStore } from '@/stores/modalStore';
import { canWriteClub } from '@/utils/club/club';

export default function useClubWriteGuard() {
  const { data: user } = useUserInfo();
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  return (next: () => void) => {
    if (!canWriteClub(user)) {
      openStudentVerification('club');
      return;
    }
    next();
  };
}
