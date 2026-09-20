/**
 * [라우팅] 지연 로드 화면 모음
 * 라우트 단위 코드 분할 대상. 첫 화면(홈·로그인·콜백·404)은 즉시 로드해야 하므로 여기 두지 않는다.
 *
 * 라우터 정의(routes/index.tsx)와 파일을 나눈 이유:
 * 한 파일이 컴포넌트와 컴포넌트가 아닌 값(router)을 함께 내보내면 Fast Refresh가 동작하지 않아
 * react-refresh/only-export-components 규칙에 걸린다. 이 파일은 컴포넌트만 내보낸다.
 */
import { lazy } from 'react';

export const Faq = lazy(() => import('@/pages/faq'));
export const Curriculum = lazy(() => import('@/pages/curriculum'));
export const OnBoarding = lazy(() => import('@/pages/auth/onBoarding'));

export const MyPage = lazy(() => import('@/pages/myPage/index'));
export const Profile = lazy(() => import('@/pages/myPage/profile'));
export const AcademicRecords = lazy(() => import('@/pages/myPage/academicRecords'));

export const Graduation = lazy(() => import('@/pages/report/graduation'));
export const UploadPage = lazy(() => import('@/pages/report/uploadPage'));

// 관리자 화면은 일반 사용자가 평생 열지 않으므로 초기 번들에서 반드시 빼 둔다.
export const AdminCourseClassifications = lazy(() => import('@/pages/admin/courseClassifications'));
export const AdminGraduationRequirements = lazy(() => import('@/pages/admin/graduationRequirements'));
export const AdminFaqs = lazy(() => import('@/pages/admin/faqs'));
