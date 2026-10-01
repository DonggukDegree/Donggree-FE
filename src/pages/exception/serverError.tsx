/** [오류 > 서버 연결] 실제 오류 UI 표시 시 응답 유무를 구분하여 기록 */
import { useEffect } from 'react';

import Warning from '@/assets/icons/warning.svg?react';
import Button from '@/components/common/button';
import type { TErrorSource } from '@/constants/analytics';
import { trackErrorShown } from '@/utils/analyticsError';

interface IServerErrorProps {
  error?: unknown;
  source?: TErrorSource;
  // 다시 시도 동작 (보통 쿼리 refetch). 없으면 페이지를 새로고침한다.
  onRetry?: () => void;
}

// 서버 연결 실패(응답 없는 네트워크 오류)·서버 내부 오류(5xx) 시 보여주는 화면.
// NotFound와 동일한 레이아웃을 따른다.
export default function ServerError({ onRetry, error, source = 'server' }: IServerErrorProps) {
  useEffect(() => {
    trackErrorShown(source, error, true);
  }, [source, error]);
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-8 lg:gap-12 px-6 lg:px-0 py-10 lg:py-0">
      <Warning className="w-10 h-10 lg:w-20 lg:h-20 shrink-0" />
      <div className="flex flex-col items-center gap-1 max-lg:text-center">
        <p className="text-primary-60 text-heading-2 lg:text-heading-1">500</p>
        <p className="text-coolgray-90 text-heading-6 lg:text-heading-4">서버에 연결할 수 없어요.</p>
      </div>
      <Button variant="outlined" className="w-40 max-w-full" onClick={handleRetry}>
        다시 시도
      </Button>
    </div>
  );
}
