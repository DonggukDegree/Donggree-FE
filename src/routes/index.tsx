import { createBrowserRouter } from 'react-router-dom';

import Layout from '@/layouts';
import Curriculum from '@/pages/curriculum';
import Graduation from '@/pages/graduation';
import Home from '@/pages/home';
import Login from '@/pages/login';
import MyPage from '@/pages/myPage';
import NotFound from '@/pages/notFound';
import OnBoarding from '@/pages/onBoarding';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'my-page', element: <MyPage /> },
      { path: 'curriculum', element: <Curriculum /> },
      { path: 'graduation', element: <Graduation /> },
      { path: 'onboarding', element: <OnBoarding /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
