/**
 * [에러] 404 화면
 * 정의되지 않은 경로에서 라우터가 직접 띄우고, 예기치 못한 조회 실패 시 각 화면이 대신 렌더하기도 한다.
 */
import { useNavigate } from 'react-router-dom';

import Rocket from '@/assets/icons/rocket.svg?react';
import Button from '@/components/common/button';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-8 lg:gap-12 px-6 lg:px-0 py-10 lg:py-0">
      <Rocket className="w-10 h-10 lg:w-20 lg:h-20 shrink-0" />
      <div className="flex flex-col items-center gap-1 max-lg:text-center">
        <p className="text-primary-60 text-heading-2 lg:text-heading-1">404</p>
        <p className="text-coolgray-90 text-heading-6 lg:text-heading-4">페이지를 찾을 수 없습니다.</p>
      </div>
      <Button variant="outlined" className="w-40 max-w-full" onClick={() => navigate('/')}>
        홈으로
      </Button>
    </div>
  );
}
