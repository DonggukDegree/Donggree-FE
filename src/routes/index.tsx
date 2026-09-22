/**
 * [라우팅] 라우터 정의
 * 게이트는 3단으로 겹쳐 둔다.
 *  ProtectedRoute(인증 → 온보딩 강제) → ReportGate(성적표 필요) → AdminRoute(관리자 권한)
 * 홈·자주 묻는 질문·로그인·콜백·404만 인증 없이 접근할 수 있다.
 *
 * 코드 분할: 첫 화면(홈·로그인·콜백·404)만 즉시 로드하고 나머지는 lazy로 나눈다.
 * 특히 관리자 3종은 일반 사용자가 평생 열지 않는 화면이라 초기 번들에 들어갈 이유가 없다.
 * 청크 대기 중에는 Layout의 Suspense가 공용 로딩을 띄운다.
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';

import Layout from '@/layouts';
import AuthCallback from '@/pages/auth/authCallback';
import Login from '@/pages/auth/login';
import NotFound from '@/pages/exception/notFound';
import Home from '@/pages/home';
import AdminRoute from '@/routes/adminRoute';
import {
  AcademicRecords,
  AdminCourseClassifications,
  AdminFaqs,
  AdminGraduationRequirements,
  AdminReportPreview,
  Curriculum,
  Faq,
  Graduation,
  MyPage,
  OnBoarding,
  Profile,
  UploadPage,
} from '@/routes/lazyPages';
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
      // 홈, 자주 묻는 질문은 인증 없이 접근 가능한 public 라우트.
      { index: true, element: <Home /> },
      { path: 'faq', element: <Faq /> },
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
                  { path: 'faqs', element: <AdminFaqs /> },
                  { path: 'report-preview', element: <AdminReportPreview /> },
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
