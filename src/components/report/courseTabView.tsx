/**
 * [졸업 판정] 영역별 상세 탭뷰
 * 학업 리포트 화면 중단. 이 회원에게 적용되는 이수구분(공통교양·전공 등)을 탭으로 두고,
 * 활성 탭의 상세(영역 카드 · 미충족 사유 · 영역 이수 현황)만 조회해 그린다.
 * 탭마다 별도 캐시라 한 번 본 탭은 다시 눌러도 즉시 표시된다.
 */
import { useState } from 'react';

import type { TChipVariant } from '@/components/common/chip';
import Loading from '@/components/common/loading';
import AreaDetailCard from '@/components/report/areaDetailCard';
import useReportDetail from '@/hooks/report/useReportDetail';
import { COURSE_LABEL, type TCourseType } from '@/types/course';
import type { TReportItemStatus } from '@/types/report/TGetReportDetail';
import { trackEvent } from '@/utils/analytics';

// 과목 이수 상태 → 칩 variant 매핑
const STATUS_TO_CHIP: Record<TReportItemStatus, TChipVariant> = {
  SATISFIED: 'satisfied', // 필수 이수 → 충족
  UNSATISFIED: 'unsatisfied', // 필수 미이수 → 불충족
  OPTIONAL: 'selected', // 선택 이수 → 선택
};

interface ICourseTabViewProps {
  // summary의 areaOverviews에서 받은, 이 회원에게 적용되는 영역 탭 목록
  courseTypes: TCourseType[];
}

export default function CourseTabView({ courseTypes }: ICourseTabViewProps) {
  const [activeTab, setActiveTab] = useState<TCourseType>(courseTypes[0] ?? 'COMMON_GENERAL');
  // 활성 탭의 courseType으로만 상세를 조회한다(지연 로딩, 탭별 캐시).
  const { data, isPending, isError } = useReportDetail(activeTab);

  // 사용자가 영역 상세 탭을 눌러 리포트를 파고드는지 집계한다. (같은 탭 재클릭은 제외)
  const handleTabClick = (course: TCourseType) => {
    if (course !== activeTab) {
      trackEvent('report_area_tab_click', { course_type: course });
    }
    setActiveTab(course);
  };

  return (
    <div className="flex flex-col gap-7 px-0 lg:px-8 py-4">
      <div className="w-full border-b border-coolgray-20">
        {/* 탭이 한 줄에 안 들어가는 모바일에서는 가운데 정렬 대신 가로 스크롤한다. */}
        <div className="flex max-lg:justify-start lg:justify-center gap-4 lg:gap-8 max-lg:overflow-x-auto">
          {courseTypes.map((course) => (
            <button
              key={course}
              type="button"
              onClick={() => handleTabClick(course)}
              className={`text-heading-6 lg:text-heading-5 py-2 shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === course ? 'text-primary-90 border-b-2 border-primary-90' : 'text-coolgray-90'
              }`}
            >
              {COURSE_LABEL[course]}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 전환마다 그 탭의 상세만 새로 불러오므로, 페이지 전체가 아닌 패널 안에서만 로딩을 보여 준다. */}
      {isPending ? (
        <Loading variant="inline" />
      ) : isError || !data ? (
        <p className="py-10 text-center text-body-l text-coolgray-60">정보를 불러오지 못했어요.</p>
      ) : (
        <div key={activeTab} className="flex flex-col gap-7 animate-fade-in">
          <div className="flex gap-3 overflow-x-auto max-lg:pb-2">
            {data.areaDetails.map((area) => (
              <AreaDetailCard
                key={area.areaName}
                areaName={area.areaName}
                chipVariant={area.satisfied ? 'satisfied' : 'unsatisfied'}
                requiredCredits={area.targetCredits}
                completedCredits={area.earnedCredits}
                subjects={area.items.map((item) => ({
                  name: item.title,
                  credits: item.credit,
                  chipVariant: STATUS_TO_CHIP[item.status],
                  details: item.detail ?? undefined,
                }))}
              />
            ))}
          </div>

          {/* 두 요약 박스는 모바일에서 나란히 두기엔 좁아 세로로 쌓는다. */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-10">
            <div className="flex-1 border border-coolgray-20 p-4 flex flex-col gap-2">
              <span className="text-heading-6 lg:text-heading-5 text-coolgray-90">미충족 사유</span>
              {data.unsatisfiedReasons.length > 0 ? (
                data.unsatisfiedReasons.map((reason) => (
                  <span key={reason} className="text-button-m text-alert">
                    {reason}
                  </span>
                ))
              ) : (
                <span className="text-button-m text-coolgray-90">해당사항 없음</span>
              )}
            </div>

            <div className="flex-1 border border-coolgray-20 p-4 flex flex-col gap-2">
              <span className="text-heading-6 lg:text-heading-5 text-coolgray-90">영역 이수 현황</span>
              <div className="flex justify-between gap-2 text-heading-6 text-coolgray-90">
                <span>이수 학점</span>
                <span>{data.creditStatus.earnedCredits}학점</span>
              </div>
              <div className="flex justify-between gap-2 text-heading-6 text-coolgray-90">
                <span>목표 이수 학점</span>
                <span>{data.creditStatus.targetCredits}학점</span>
              </div>
              <div className="flex justify-between gap-2 text-heading-6 text-coolgray-90">
                <span>잔여 학점</span>
                <span className="text-primary-60">{data.creditStatus.remainingCredits}학점</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
