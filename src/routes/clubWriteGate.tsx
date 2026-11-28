import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import Loading from '@/components/common/feedback/loading';
import useUserInfo from '@/hooks/user/useUserInfo';
import { useModalStore } from '@/stores/modalStore';
import { canWriteClub } from '@/utils/club/club';

// 동아리 쓰기 화면(등록·수정·모집·다시 요청) 학생 인증 게이트.
// ProtectedRoute(인증·온보딩) 통과 후, 주소로 바로 들어온 미인증 회원을 동아리 목록으로 돌려보내고 학생 인증 안내를 띄운다.
// 목록·상세 조회는 이 게이트 밖이라 누구나 본다.
export default function ClubWriteGate() {
  const { data: user } = useUserInfo();
  const navigate = useNavigate();
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  const allowed = canWriteClub(user);

  useEffect(() => {
    if (!user || allowed) return;
    navigate('/clubs', { replace: true });
    openStudentVerification('club');
  }, [user, allowed, navigate, openStudentVerification]);

  if (!allowed) return <Loading />;
  return <Outlet />;
}
