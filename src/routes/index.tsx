import { createBrowserRouter } from 'react-router-dom';

import Layout from '@/layouts';
import AcademicRecords from '@/pages/academicRecords';
import Curriculum from '@/pages/curriculum';
import Graduation from '@/pages/graduation';
import Home from '@/pages/home';
import Login from '@/pages/login';
import MyPage from '@/pages/myPage';
import NotFound from '@/pages/notFound';
import OnBoarding from '@/pages/onBoarding';
import Profile from '@/pages/profile';
import UploadPage from '@/pages/uploadPage';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'my-page',
        children: [
          { index: true, element: <MyPage /> },
          { path: 'profile', element: <Profile /> },
          { path: 'academic-records', element: <AcademicRecords /> },
        ],
      },
      { path: 'curriculum', element: <Curriculum /> },
      { path: 'graduation', element: <Graduation /> },
      { path: 'onboarding', element: <OnBoarding /> },
      { path: 'upload', element: <UploadPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
