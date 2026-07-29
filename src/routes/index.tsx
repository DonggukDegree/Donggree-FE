/**
 * [라우팅] 라우터 정의
 * 게이트는 3단으로 겹쳐 둔다.
 *  ProtectedRoute(인증 → 온보딩 강제) → ReportGate(성적표 필요) → AdminRoute(관리자 권한)
 * 홈·로그인·콜백·404만 인증 없이 접근할 수 있다.
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';

import Layout from '@/layouts';
import AdminCourseClassifications from '@/pages/admin/courseClassifications';
import AdminGraduationRequirements from '@/pages/admin/graduationRequirements';
import AuthCallback from '@/pages/auth/authCallback';
import Login from '@/pages/auth/login';
import OnBoarding from '@/pages/auth/onBoarding';
import Curriculum from '@/pages/curriculum';
import NotFound from '@/pages/exception/notFound';
import Home from '@/pages/home';
import AcademicRecords from '@/pages/myPage/academicRecords';
import MyPage from '@/pages/myPage/index';
import Profile from '@/pages/myPage/profile';
import Graduation from '@/pages/report/graduation';
import UploadPage from '@/pages/report/uploadPage';
import AdminRoute from '@/routes/adminRoute';
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
          {
            element: <AdminRoute />,
            children: [
              {
                path: 'admin',
                children: [
                  { index: true, element: <Navigate to="course-classifications" replace /> },
                  { path: 'course-classifications', element: <AdminCourseClassifications /> },
                  { path: 'graduation-requirements', element: <AdminGraduationRequirements /> },
                ],
              },
            ],
          },
        ],
      },
      // 정의되지 않은 경로는 인증과 무관하게 NotFound를 보여준다. (public)
      { path: '*', element: <NotFound /> },
    ],
  },
]);
