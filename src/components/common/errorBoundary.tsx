import { Component, type ErrorInfo, type ReactNode } from 'react';

import Warning from '@/assets/icons/warning.svg?react';
import Button from '@/components/common/button';

interface IErrorBoundaryProps {
  children: ReactNode;
}

interface IErrorBoundaryState {
  hasError: boolean;
}

// 렌더링 중 발생한 예외로 앱 전체가 흰 화면이 되는 것을 막는 전역 에러 경계.
// (에러 경계는 클래스 컴포넌트로만 구현 가능)
export default class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
  state: IErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): IErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 추후 에러 로깅(Sentry 등) 연동 지점
    console.error('Unhandled error:', error, info);
  }

  handleGoHome = () => {
    // 라우터 컨텍스트 밖이므로 전체 리로드로 홈으로 이동한다.
    window.location.href = '/';
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-12">
          <Warning className="w-20 h-20" />
          <div className="flex flex-col items-center gap-1">
            <p className="text-coolgray-90 text-heading-2">문제가 발생했어요</p>
            <p className="text-coolgray-60 text-body-l">잠시 후 다시 시도해주세요.</p>
          </div>
          <Button variant="outlined" className="w-40" onClick={this.handleGoHome}>
            홈으로
          </Button>
        </div>
      );
    }

    return children;
  }
}
