/**
 * [로그인] 페이지 (/login)
 * 카카오 로그인 버튼 하나뿐인 화면. 인증 게이트(ProtectedRoute)에서 미인증으로 판단되면 이리로 온다.
 * 버튼을 누르면 백엔드의 OAuth2 진입점으로 이동하고, 인증이 끝나면 /login/callback으로 돌아온다.
 */
import Kakao from '@/assets/kakao.svg?react';
import Logo from '@/assets/logo.svg?react';
import { trackEvent } from '@/utils/analytics';

export default function Login() {
  // 카카오 로그인 시작: 백엔드의 Spring Security OAuth2 진입점으로 이동시킨다.
  // 이후 콜백/토큰 발급은 백엔드가 처리하고 /login/callback으로 돌아온다.
  const handleKakaoLogin = () => {
    // 외부 이동 직전에 로그인 시도를 집계한다. (실제 성공은 콜백 이후 온보딩/이용 흐름으로 확인)
    trackEvent('login_click', { method: 'kakao' });
    window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/kakao`;
  };

  // 로그인은 Layout 밖(전체 화면 배경)이라 셸이 적용되지 않는다. 카드 자체를 좁은 화면에 맞춘다.
  return (
    <div className="flex items-center justify-center h-screen bg-primary-30 px-6 lg:px-0">
      <div className="w-full max-w-md lg:w-auto lg:max-w-none flex flex-col items-center gap-8 lg:gap-12 rounded-md bg-white py-12 lg:py-20 px-6 lg:px-42">
        <div className="flex flex-col items-center gap-3">
          <Logo className="w-40 lg:w-80 max-w-full h-auto" />
          <p className="text-body-s lg:text-body-m text-primary-60 max-lg:text-center">
            가장 쉽고 빠른 나만의 학업 로드맵, 동그리와 함께
          </p>
        </div>
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="w-full lg:w-auto flex items-center justify-center gap-4 bg-[#FEE500] rounded-md px-6 lg:px-20 py-3 cursor-pointer hover:opacity-90"
        >
          <Kakao className="w-7 h-7 shrink-0" />
          <span className="text-black text-body-m lg:text-body-l">카카오톡으로 로그인</span>
        </button>
      </div>
    </div>
  );
}
