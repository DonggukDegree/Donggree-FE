/**
 * [졸업 판정] 학업 리포트 페이지 (/graduation)
 * 졸업 달성률 요약(진행바·학점·평점·PASS/FAIL) → 영역별 이수 현황 카드 → 영역 상세 탭뷰 순으로 보여 준다.
 * 성적표가 있어야 의미가 있으므로 ReportGate를 통과한 회원만 들어온다.
 * 적용 가능한 졸업 요건이 없는 학과(404)는 안내 모달을 띄우고 홈으로 돌려보낸다.
 */
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Chart from '@/assets/icons/chart.svg?react';
import Warning from '@/assets/icons/warning.svg?react';
import Button from '@/components/common/button';
import Loading from '@/components/common/loading';
import CourseSummaryCard from '@/components/report/courseSummaryCard';
import CourseTabView from '@/components/report/courseTabView';
import ProgressBar from '@/components/report/progressBar';
import { ERROR_CODE } from '@/constants/errorCodes';
import { READY_MESSAGE } from '@/constants/links';
import { TRANSCRIPT_ERROR_MODAL } from '@/constants/report/transcriptErrorModals';
import useReportSummary from '@/hooks/report/useReportSummary';
import useInView from '@/hooks/useInView';
import NotFound from '@/pages/exception/notFound';
import { useModalStore } from '@/stores/modalStore';
import { trackEvent } from '@/utils/analytics';
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
    // 적용 가능한 졸업 요건이 없어 리포트를 못 보는 이탈 지점을 집계한다.
    trackEvent('error_shown', { source: 'graduation', code: ERROR_CODE.NO_REQUIREMENT });
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

  // 졸업 판정 리포트를 실제로 확인한 시점(요약 조회 성공). PASS/FAIL·달성률을 함께 집계한다.
  useEffect(() => {
    if (!data) return;
    trackEvent('graduation_check', {
      graduated: data.summary.graduated,
      achievement_rate: data.summary.achievementRate,
    });
  }, [data]);

  // 하단 버튼 영역이 뷰포트에 들어오면(useInView는 1회만 true) 리포트를 끝까지 스크롤했다고 본다.
  useEffect(() => {
    if (!buttonInView) return;
    trackEvent('graduation_report_complete');
  }, [buttonInView]);

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
    <div className="flex flex-col p-4 lg:p-20 gap-10 lg:gap-15">
      {/* 헤더 */}
      <div
        ref={headerRef}
        className={`flex flex-col items-center gap-6 lg:gap-10 ${headerInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <Chart className="w-10 h-10 lg:w-20 lg:h-20 shrink-0" />
        <h2 className="text-heading-4 lg:text-heading-2 text-coolgray-90">나의 학업 리포트</h2>
      </div>

      {/* 요약 */}
      <div
        ref={summaryRef}
        className={`flex flex-col px-0 lg:px-4 py-6 lg:py-8 gap-8 lg:gap-15 items-center border-b border-coolgray-20 ${summaryInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <h3 className="text-heading-5 lg:text-heading-3 text-coolgray-90">요약</h3>
        {/* w-full이어야 좁은 화면에서 진행 바가 부모 폭을 기준으로 줄어든다. */}
        <div className="w-full flex flex-col gap-6 items-center">
          <ProgressBar progress={summary.achievementRate} animate={summaryInView} />
          <span className="text-heading-6 lg:text-heading-5 text-shimmer max-lg:text-center">
            졸업까지 {summary.achievementRate}% 달성했어요!
          </span>
        </div>
        <div className="w-full max-w-md mx-auto flex flex-col gap-3">
          <div className="flex justify-between gap-2">
            <span className="text-heading-6 lg:text-heading-5 text-coolgray-90">이수 학점</span>
            <span className="text-heading-6 lg:text-heading-5 text-coolgray-90">{summary.earnedCredits}학점</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-heading-6 lg:text-heading-5 text-coolgray-90">목표 이수 학점</span>
            <span className="text-heading-6 lg:text-heading-5 text-coolgray-90">{summary.targetCredits}학점</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-heading-6 lg:text-heading-5 text-coolgray-90">잔여 학점</span>
            <span className="text-heading-6 lg:text-heading-5 text-primary-60">{summary.remainingCredits}학점</span>
          </div>
        </div>
        <div className="w-full max-w-md mx-auto flex flex-col gap-3">
          <div className="w-full flex justify-between gap-2">
            <span className="text-heading-6 lg:text-heading-4 text-coolgray-90">총 평점 평균</span>
            <span className="text-heading-6 lg:text-heading-4 text-coolgray-90">{summary.gpa}</span>
          </div>
          <div className="w-full flex justify-between gap-2">
            <span className="text-heading-5 lg:text-heading-3 text-primary-60">졸업 판정</span>
            <span
              className={`text-heading-5 lg:text-heading-3 font-bold ${graduationStatus === 'PASS' ? 'text-primary-60' : 'text-coolgray-30'}`}
            >
              {graduationStatus}
            </span>
          </div>
        </div>

        {/* 전체 졸업요건 미충족 사유 (없으면 숨김). 졸업 판정 아래 중앙 정렬, 영역별 사유와 동일한 글씨 */}
        {summary.unsatisfiedReasons.length > 0 && (
          <div className="flex flex-col items-center gap-1 mb-4 max-lg:text-center">
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
        <div className="flex flex-col gap-2 items-center max-lg:text-center">
          <h3 className="text-heading-5 lg:text-heading-3 text-coolgray-90">영역별 이수 현황</h3>
          <p className="text-body-s lg:text-body-m text-coolgray-60">
            아래에서 원하는 영역 탭을 클릭해 자세한 정보를 확인하세요.
          </p>
        </div>
        {/* 카드가 화면보다 많으면 가로로 스크롤한다. (모바일에서 특히 필요) */}
        <div className="w-full lg:w-auto flex gap-3 overflow-x-auto max-lg:pb-2">
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
        className={`w-full py-4 px-0 lg:px-10 border-b border-coolgray-20 ${tabInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <CourseTabView courseTypes={courseTypes} />
      </div>

      {/* 버튼 */}
      <div
        ref={buttonRef}
        className={`flex flex-col lg:flex-row items-center gap-4 justify-center ${buttonInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <Button variant="outlined" className="w-60 max-w-full" onClick={() => navigate('/my-page/academic-records')}>
          내 학업 정보 수정
        </Button>
        {/* 커리큘럼 기능은 아직 미개발이라 페이지 이동 대신 준비 중 토스트로 안내한다. */}
        <Button className="w-60 max-w-full" onClick={() => toast(READY_MESSAGE)}>
          커리큘럼 확인하기
        </Button>
      </div>
    </div>
  );
}
