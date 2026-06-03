import { useNavigate } from 'react-router-dom';

import Chart from '@/assets/icons/chart.svg?react';
import Button from '@/components/common/button';
import CourseSummaryCard from '@/components/courseSummaryCard';
import CourseTabView from '@/components/courseTabView';
import ProgressBar from '@/components/progressBar';
import useInView from '@/hooks/useInView';
import type { TCourseName } from '@/types/course';

export default function Graduation() {
  // TODO: API 연동 시 교체
  const progress = 85;
  const completedCredits = 120;
  const targetCredits = 140;
  const remainingCredits = 20;
  const gpa = 3.85;
  const graduationStatus = 'FAIL' as 'PASS' | 'FAIL';

  const courseSummary: {
    courseName: TCourseName;
    progress: number;
    remainingCredits: number;
    status: 'PASS' | 'FAIL';
  }[] = [
    { courseName: 'COMMON_GENERAL', progress: 100, remainingCredits: 0, status: 'PASS' },
    { courseName: 'LIBERAL_ARTS', progress: 67, remainingCredits: 3, status: 'FAIL' },
    { courseName: 'ACADEMIC_FOUNDATION', progress: 100, remainingCredits: 0, status: 'PASS' },
    { courseName: 'FIRST_MAJOR', progress: 95, remainingCredits: 3, status: 'FAIL' },
    { courseName: 'SECOND_MAJOR', progress: 92, remainingCredits: 3, status: 'FAIL' },
  ];

  const courseTabData = {
    COMMON_GENERAL: {
      areaDetails: [
        {
          areaName: '사고와표현',
          chipVariant: 'satisfied' as const,
          requiredCredits: 6,
          completedCredits: 6,
          subjects: [
            { name: '글쓰기', credits: 3, chipVariant: 'satisfied' as const },
            { name: '발표와토론', credits: 3, chipVariant: 'satisfied' as const },
          ],
        },
        {
          areaName: 'AI리터러시',
          chipVariant: 'satisfied' as const,
          requiredCredits: 3,
          completedCredits: 3,
          subjects: [{ name: 'AI활용기초', credits: 3, chipVariant: 'satisfied' as const }],
        },
        {
          areaName: '채플',
          chipVariant: 'satisfied' as const,
          requiredCredits: 4,
          completedCredits: 4,
          subjects: [
            { name: '채플', credits: 2, chipVariant: 'satisfied' as const },
            { name: '채플', credits: 2, chipVariant: 'satisfied' as const },
          ],
        },
      ],
      unsatisfiedReasons: [],
      completedCredits: 13,
      targetCredits: 13,
      remainingCredits: 0,
    },
    LIBERAL_ARTS: {
      areaDetails: [
        {
          areaName: '인문',
          chipVariant: 'satisfied' as const,
          requiredCredits: 3,
          completedCredits: 3,
          subjects: [{ name: '철학입문', credits: 3, chipVariant: 'selected' as const }],
        },
        {
          areaName: '사회',
          chipVariant: 'satisfied' as const,
          requiredCredits: 3,
          completedCredits: 3,
          subjects: [{ name: '경제학원론', credits: 3, chipVariant: 'selected' as const }],
        },
        {
          areaName: '자연',
          chipVariant: 'unsatisfied' as const,
          requiredCredits: 3,
          completedCredits: 0,
          subjects: [{ name: '자연과학개론', credits: 3, chipVariant: 'unsatisfied' as const }],
        },
      ],
      unsatisfiedReasons: ['자연 영역 미이수'],
      completedCredits: 6,
      targetCredits: 9,
      remainingCredits: 3,
    },
    ACADEMIC_FOUNDATION: {
      areaDetails: [
        {
          areaName: '수학',
          chipVariant: 'satisfied' as const,
          requiredCredits: 6,
          completedCredits: 6,
          subjects: [
            { name: '미적분학', credits: 3, chipVariant: 'satisfied' as const },
            { name: '선형대수', credits: 3, chipVariant: 'satisfied' as const },
          ],
        },
        {
          areaName: '과학',
          chipVariant: 'satisfied' as const,
          requiredCredits: 3,
          completedCredits: 3,
          subjects: [{ name: '물리학개론', credits: 3, chipVariant: 'satisfied' as const }],
        },
      ],
      unsatisfiedReasons: [],
      completedCredits: 9,
      targetCredits: 9,
      remainingCredits: 0,
    },
    FIRST_MAJOR: {
      areaDetails: [
        {
          areaName: '전공필수',
          chipVariant: 'unsatisfied' as const,
          requiredCredits: 18,
          completedCredits: 12,
          subjects: [
            { name: '자료구조', credits: 3, chipVariant: 'satisfied' as const },
            { name: '운영체제', credits: 3, chipVariant: 'satisfied' as const },
            { name: '알고리즘', credits: 3, chipVariant: 'satisfied' as const },
            { name: '컴퓨터네트워크', credits: 3, chipVariant: 'satisfied' as const },
            { name: '캡스톤디자인', credits: 3, chipVariant: 'unsatisfied' as const },
            { name: '졸업프로젝트', credits: 3, chipVariant: 'unsatisfied' as const },
          ],
        },
        {
          areaName: '전공선택',
          chipVariant: 'satisfied' as const,
          requiredCredits: 42,
          completedCredits: 42,
          subjects: [
            { name: '데이터베이스', credits: 3, chipVariant: 'selected' as const },
            { name: '인공지능', credits: 3, chipVariant: 'selected' as const },
            { name: '웹프로그래밍', credits: 3, chipVariant: 'selected' as const },
          ],
        },
      ],
      unsatisfiedReasons: ['캡스톤디자인 미이수', '졸업프로젝트 미이수'],
      completedCredits: 57,
      targetCredits: 60,
      remainingCredits: 3,
    },
    SECOND_MAJOR: {
      areaDetails: [
        {
          areaName: '경영필수',
          chipVariant: 'unsatisfied' as const,
          requiredCredits: 12,
          completedCredits: 9,
          subjects: [
            { name: '경영학원론', credits: 3, chipVariant: 'satisfied' as const },
            { name: '마케팅원론', credits: 3, chipVariant: 'satisfied' as const },
            { name: '재무관리', credits: 3, chipVariant: 'satisfied' as const },
            { name: '회계원리', credits: 3, chipVariant: 'unsatisfied' as const },
          ],
        },
        {
          areaName: '경영선택',
          chipVariant: 'satisfied' as const,
          requiredCredits: 24,
          completedCredits: 24,
          subjects: [
            { name: '조직행동론', credits: 3, chipVariant: 'selected' as const },
            { name: '인사관리', credits: 3, chipVariant: 'selected' as const },
            { name: '경영정보시스템', credits: 3, chipVariant: 'selected' as const, details: ['ERP', '빅데이터분석'] },
          ],
        },
      ],
      unsatisfiedReasons: ['회계원리 미이수'],
      completedCredits: 33,
      targetCredits: 36,
      remainingCredits: 3,
    },
  };

  const navigate = useNavigate();

  const [headerRef, headerInView] = useInView();
  const [summaryRef, summaryInView] = useInView();
  const [areaRef, areaInView] = useInView();
  const [tabRef, tabInView] = useInView(0.1);
  const [buttonRef, buttonInView] = useInView();

  return (
    <div className="flex flex-col p-20 gap-15">
      {/* 헤더 */}
      <div
        ref={headerRef}
        className={`flex flex-col items-center gap-10 ${headerInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <Chart className="w-20 h-20" />
        <h2 className="text-heading-2 text-coolgray-90">나의 학업 리포트</h2>
      </div>

      {/* 요약 */}
      <div
        ref={summaryRef}
        className={`flex flex-col px-4 py-8 gap-15 items-center border-b border-coolgray-20 ${summaryInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <h3 className="text-heading-3 text-coolgray-90">요약</h3>
        <div className="flex flex-col gap-6 items-center">
          <ProgressBar progress={progress} animate={summaryInView} />
          <span className="text-heading-5 text-shimmer">졸업까지 {progress}% 달성했어요!</span>
        </div>
        <div className="w-full flex flex-col gap-3 px-115">
          <div className="flex justify-between">
            <span className="text-heading-5 text-coolgray-90">이수 학점</span>
            <span className="text-heading-5 text-coolgray-90">{completedCredits}학점</span>
          </div>
          <div className="flex justify-between">
            <span className="text-heading-5 text-coolgray-90">목표 이수 학점</span>
            <span className="text-heading-5 text-coolgray-90">{targetCredits}학점</span>
          </div>
          <div className="flex justify-between">
            <span className="text-heading-5 text-coolgray-90">잔여 학점</span>
            <span className="text-heading-5 text-primary-60">{remainingCredits}학점</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-3 px-100">
          <div className="w-full flex justify-between">
            <span className="text-heading-4 text-coolgray-90">총 평점 평균</span>
            <span className="text-heading-4 text-coolgray-90">{gpa}</span>
          </div>
          <div className="w-full flex justify-between">
            <span className="text-heading-3 text-primary-60">졸업 판정</span>
            <span
              className={`text-heading-3 font-bold ${graduationStatus === 'PASS' ? 'text-primary-60' : 'text-coolgray-30'}`}
            >
              {graduationStatus}
            </span>
          </div>
        </div>
      </div>

      {/* 영역별 이수 현황 */}
      <div
        ref={areaRef}
        className={`flex flex-col gap-6 items-center ${areaInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <div className="flex flex-col gap-2 items-center">
          <h3 className="text-heading-3 text-coolgray-90">영역별 이수 현황</h3>
          <p className="text-body-m text-coolgray-60">아래에서 원하는 영역 탭을 클릭해 자세한 정보를 확인하세요.</p>
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {courseSummary.map((course) => (
            <CourseSummaryCard
              key={course.courseName}
              courseName={course.courseName}
              progress={course.progress}
              remainingCredits={course.remainingCredits}
              status={course.status}
              isVisible={areaInView}
            />
          ))}
        </div>
      </div>

      {/* 탭뷰 */}
      <div
        ref={tabRef}
        className={`w-full py-4 px-10 border-b border-coolgray-20 ${tabInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <CourseTabView data={courseTabData} />
      </div>

      {/* 버튼 */}
      <div ref={buttonRef} className={`flex gap-4 justify-center ${buttonInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <Button variant="outlined" className="w-60" onClick={() => navigate('/my-page/academic-records')}>
          내 학업 정보 수정
        </Button>
        <Button className="w-60" onClick={() => navigate('/curriculum')}>
          커리큘럼 확인하기
        </Button>
      </div>
    </div>
  );
}
