/**
 * [앱 루트] 라우터 진입점
 * 전역 Provider(QueryClient·Toaster·ErrorBoundary)는 main.tsx가 감싸고,
 * 이 컴포넌트는 라우트 정의(routes/index.tsx)만 연결한다.
 */
import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
