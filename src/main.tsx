/**
 * [앱 진입점]
 * 전역 Provider를 한자리에 모은다. 에러 경계 → React Query Provider → 앱 → 토스트 순.
 * 개발 환경에서만 React Query Devtools를 함께 렌더한다.
 */
import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import ErrorBoundary from '@/components/common/errorBoundary';
import { QUERY_CLIENT_DEFAULT_OPTIONS } from '@/constants/queryOptions';
import { initGA } from '@/utils/analytics';

import App from './App.tsx';

const queryClient = new QueryClient({ defaultOptions: QUERY_CLIENT_DEFAULT_OPTIONS });

// GA4 초기화(측정 ID가 있을 때만 동작). 렌더 전에 1회 실행해 이후 페이지뷰·이벤트를 받을 준비를 한다.
initGA();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-center" richColors />
        {/* 개발 환경에서만 React Query Devtools를 렌더한다. (프로덕션 번들/노출 방지) */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
