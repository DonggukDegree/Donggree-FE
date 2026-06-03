import { useState } from 'react';

import AreaDetailCard from '@/components/areaDetailCard';
import type { TChipVariant } from '@/components/chip';
import useReportDetail from '@/hooks/report/useReportDetail';
import { COURSE_LABEL, type TCourseName } from '@/types/course';
import type { TReportItemStatus } from '@/types/report/TGetReportDetail';

// 과목 이수 상태 → 칩 variant 매핑
const STATUS_TO_CHIP: Record<TReportItemStatus, TChipVariant> = {
  SATISFIED: 'satisfied', // 필수 이수 → 충족
  UNSATISFIED: 'unsatisfied', // 필수 미이수 → 불충족
  OPTIONAL: 'selected', // 선택 이수 → 선택
};

interface ICourseTabViewProps {
  // summary의 areaOverviews에서 받은, 이 회원에게 적용되는 영역 탭 목록
  courseTypes: TCourseName[];
}

export default function CourseTabView({ courseTypes }: ICourseTabViewProps) {
  const [activeTab, setActiveTab] = useState<TCourseName>(courseTypes[0] ?? 'COMMON_GENERAL');
  // 활성 탭의 courseType으로만 상세를 조회한다(지연 로딩, 탭별 캐시).
  const { data, isPending, isError } = useReportDetail(activeTab);

  return (
    <div className="flex flex-col gap-7 px-8 py-4">
      <div className="w-full border-b border-coolgray-20">
        <div className="flex justify-center gap-8">
          {courseTypes.map((course) => (
            <button
              key={course}
              type="button"
              onClick={() => setActiveTab(course)}
              className={`text-heading-5 py-2 cursor-pointer ${
                activeTab === course ? 'text-primary-90 border-b-2 border-primary-90' : 'text-coolgray-90'
              }`}
            >
              {COURSE_LABEL[course]}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <p className="py-10 text-center text-body-l text-coolgray-60">불러오는 중...</p>
      ) : isError || !data ? (
        <p className="py-10 text-center text-body-l text-coolgray-60">정보를 불러오지 못했어요.</p>
      ) : (
        <div key={activeTab} className="flex flex-col gap-7 animate-fade-in">
          <div className="flex gap-3 overflow-x-auto">
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

          <div className="flex gap-10">
            <div className="flex-1 border border-coolgray-20 p-4 flex flex-col gap-2">
              <span className="text-heading-5 text-coolgray-90">미충족 사유</span>
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
              <span className="text-heading-5 text-coolgray-90">영역 이수 현황</span>
              <div className="flex justify-between text-heading-6 text-coolgray-90">
                <span>이수 학점</span>
                <span>{data.creditStatus.earnedCredits}학점</span>
              </div>
              <div className="flex justify-between text-heading-6 text-coolgray-90">
                <span>목표 이수 학점</span>
                <span>{data.creditStatus.targetCredits}학점</span>
              </div>
              <div className="flex justify-between text-heading-6 text-coolgray-90">
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
