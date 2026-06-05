import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import Chart from '@/assets/icons/chart.svg?react';
import Warning from '@/assets/icons/warning.svg?react';
import Button from '@/components/common/button';
import Loading from '@/components/common/loading';
import CourseSummaryCard from '@/components/courseSummaryCard';
import CourseTabView from '@/components/courseTabView';
import ProgressBar from '@/components/progressBar';
import { ERROR_CODE } from '@/constants/errorCodes';
import { TRANSCRIPT_ERROR_MODAL } from '@/constants/report/transcriptErrorModals';
import useReportSummary from '@/hooks/report/useReportSummary';
import useInView from '@/hooks/useInView';
import NotFound from '@/pages/notFound';
import { useModalStore } from '@/stores/modalStore';
import { getErrorCode } from '@/utils/error';

export default function Graduation() {
  const navigate = useNavigate();
  const openAlert = useModalStore((state) => state.openAlert);
  const { data, isPending, isError, error } = useReportSummary();

  const [headerRef, headerInView] = useInView();
  const [summaryRef, summaryInView] = useInView();
  const [areaRef, areaInView] = useInView();
  const [tabRef, tabInView] = useInView(0.1);
  const [buttonRef, buttonInView] = useInView();

  const errorCode = isError ? getErrorCode(error) : undefined;
  // 적용 가능한 졸업 요건이 없는 학과(404 GRADUATION404_2)는 업로드의 미지원 학과 모달 문구를 재사용해 안내하고,
  // 확인 시 홈으로 보낸다.
  const isUnsupportedDept = errorCode === ERROR_CODE.NO_REQUIREMENT;
  useEffect(() => {
    if (!isUnsupportedDept) return;
    const modal = TRANSCRIPT_ERROR_MODAL.TRANSCRIPT400_3;
    if (!modal) return;
    openAlert({
      icon: Warning,
      title: modal.title,
      subtitle: modal.subtitle,
      description: modal.description,
      buttonText: '닫기',
      buttonVariant: 'primary',
      onConfirm: () => navigate('/'),
    });
  }, [isUnsupportedDept, openAlert, navigate]);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    // 리포트 없음(404_1)은 업로드로 유도(게이트 우회 등 방어).
    if (errorCode === ERROR_CODE.NO_GRADUATION_REPORT) {
      return <Navigate to="/upload" replace />;
    }
    // 미지원 학과(404_2)는 위 모달을 띄우는 동안 로딩을 보여준다.
    if (isUnsupportedDept) {
      return <Loading />;
    }
    // 그 외 예기치 못한 오류는 NotFound.
    return <NotFound />;
  }

  const { summary, areaOverviews } = data;
  const graduationStatus: 'PASS' | 'FAIL' = summary.graduated ? 'PASS' : 'FAIL';
  // 이 회원에게 적용되는 영역 탭 목록 (탭뷰가 활성 탭만 조회)
  const courseTypes = areaOverviews.map((area) => area.courseType);

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
          <ProgressBar progress={summary.achievementRate} animate={summaryInView} />
          <span className="text-heading-5 text-shimmer">졸업까지 {summary.achievementRate}% 달성했어요!</span>
        </div>
        <div className="w-full flex flex-col gap-3 px-115">
          <div className="flex justify-between">
            <span className="text-heading-5 text-coolgray-90">이수 학점</span>
            <span className="text-heading-5 text-coolgray-90">{summary.earnedCredits}학점</span>
          </div>
          <div className="flex justify-between">
            <span className="text-heading-5 text-coolgray-90">목표 이수 학점</span>
            <span className="text-heading-5 text-coolgray-90">{summary.targetCredits}학점</span>
          </div>
          <div className="flex justify-between">
            <span className="text-heading-5 text-coolgray-90">잔여 학점</span>
            <span className="text-heading-5 text-primary-60">{summary.remainingCredits}학점</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-3 px-100">
          <div className="w-full flex justify-between">
            <span className="text-heading-4 text-coolgray-90">총 평점 평균</span>
            <span className="text-heading-4 text-coolgray-90">{summary.gpa}</span>
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

        {/* 전체 졸업요건 미충족 사유 (없으면 숨김). 졸업 판정 아래 중앙 정렬, 영역별 사유와 동일한 글씨 */}
        {summary.unsatisfiedReasons.length > 0 && (
          <div className="flex flex-col items-center gap-1 mt-4">
            {summary.unsatisfiedReasons.map((reason) => (
              <span key={reason} className="text-button-m text-alert">
                {reason}
              </span>
            ))}
          </div>
        )}
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
          {areaOverviews.map((area) => (
            <CourseSummaryCard
              key={area.courseType}
              courseType={area.courseType}
              progress={area.achievementRate}
              remainingCredits={area.remainingCredits}
              status={area.satisfied ? 'PASS' : 'FAIL'}
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
        <CourseTabView courseTypes={courseTypes} />
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
