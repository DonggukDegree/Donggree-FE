import Warning from '@/assets/icons/warning.svg?react';
import Button from '@/components/common/button';

interface IServerErrorProps {
  // 다시 시도 동작 (보통 쿼리 refetch). 없으면 페이지를 새로고침한다.
  onRetry?: () => void;
}

// 서버 연결 실패(응답 없는 네트워크 오류)·서버 내부 오류(5xx) 시 보여주는 화면.
// NotFound와 동일한 레이아웃을 따른다.
export default function ServerError({ onRetry }: IServerErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-12">
      <Warning className="w-20 h-20" />
      <div className="flex flex-col items-center gap-1">
        <p className="text-primary-60 text-heading-1">500</p>
        <p className="text-coolgray-90 text-heading-4">서버에 연결할 수 없어요.</p>
      </div>
      <Button variant="outlined" className="w-40" onClick={handleRetry}>
        다시 시도
      </Button>
    </div>
  );
}
