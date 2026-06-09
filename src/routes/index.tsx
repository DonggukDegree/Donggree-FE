import { createBrowserRouter } from 'react-router-dom';

import Layout from '@/layouts';
import AcademicRecords from '@/pages/academicRecords';
import AuthCallback from '@/pages/authCallback';
import Curriculum from '@/pages/curriculum';
import Graduation from '@/pages/graduation';
import Home from '@/pages/home';
import Login from '@/pages/login';
import MyPage from '@/pages/myPage';
import NotFound from '@/pages/notFound';
import OnBoarding from '@/pages/onBoarding';
import Profile from '@/pages/profile';
import UploadPage from '@/pages/uploadPage';
import ProtectedRoute from '@/routes/protectedRoute';
import ReportGate from '@/routes/reportGate';

export const router = createBrowserRouter([
  // 인증 없이 접근 가능한 라우트 (로그인, OAuth 콜백)
  { path: '/login', element: <Login /> },
  // 콜백 경로는 /login/callback. (/auth/* 는 같은 도메인에서 백엔드로 라우팅되어 빨려들어가므로 피한다)
  { path: '/login/callback', element: <AuthCallback /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      // 홈(랜딩)은 인증 없이 접근 가능한 public 라우트.
      { index: true, element: <Home /> },
      // 그 외 라우트는 ProtectedRoute(인증 → 온보딩 게이트)를 통과해야 한다.
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'my-page',
            children: [
              { index: true, element: <MyPage /> },
              { path: 'profile', element: <Profile /> },
              { path: 'academic-records', element: <AcademicRecords /> },
            ],
          },
          { path: 'curriculum', element: <Curriculum /> },
          // 졸업 판정은 성적표가 있어야 의미가 있으므로 리포트 게이트를 한 번 더 통과시킨다.
          {
            element: <ReportGate />,
            children: [{ path: 'graduation', element: <Graduation /> }],
          },
          { path: 'onboarding', element: <OnBoarding /> },
          { path: 'upload', element: <UploadPage /> },
        ],
      },
      // 정의되지 않은 경로는 인증과 무관하게 NotFound를 보여준다. (public)
      { path: '*', element: <NotFound /> },
    ],
  },
]);
