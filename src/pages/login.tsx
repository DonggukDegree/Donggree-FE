import Kakao from '@/assets/kakao.svg?react';
import Logo from '@/assets/logo.svg?react';

export default function Login() {
  // 카카오 로그인 시작: 백엔드의 Spring Security OAuth2 진입점으로 이동시킨다.
  // 이후 콜백/토큰 발급은 백엔드가 처리하고 /login/callback으로 돌아온다.
  const handleKakaoLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/kakao`;
  };

  return (
    <div className="flex items-center justify-center h-screen bg-primary-30">
      <div className="flex flex-col items-center gap-12 rounded-md bg-white py-20 px-42">
        <div className="flex flex-col items-center gap-3">
          <Logo className="w-80 h-auto" />
          <p className="text-body-m text-primary-60">가장 쉽고 빠른 나만의 학업 로드맵, 동그리와 함께</p>
        </div>
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="flex items-center justify-center gap-4 bg-[#FEE500] rounded-md px-20 py-3 cursor-pointer hover:opacity-90"
        >
          <Kakao className="w-7 h-7" />
          <span className="text-black text-body-l">카카오톡으로 로그인</span>
        </button>
      </div>
    </div>
  );
}
