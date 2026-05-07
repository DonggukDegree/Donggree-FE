import { useState } from 'react';

import AreaDetailCard from '@/components/areaDetailCard';
import type { TChipVariant } from '@/components/chip';
import { COURSE_LABEL, COURSE_NAMES, type TCourseName } from '@/types/course';

interface ISubject {
  name: string;
  credits: number;
  chipVariant: TChipVariant;
  details?: string[];
}

interface ICourseTabData {
  areaDetails: {
    areaName: string;
    chipVariant: TChipVariant;
    requiredCredits: number;
    completedCredits: number;
    subjects: ISubject[];
  }[];
  unsatisfiedReasons: string[];
  completedCredits: number;
  targetCredits: number;
  remainingCredits: number;
}

interface ICourseTabViewProps {
  data: Partial<Record<TCourseName, ICourseTabData>>;
}

export default function CourseTabView({ data }: ICourseTabViewProps) {
  const availableCourses = COURSE_NAMES.filter((course) => course in data);
  const [activeTab, setActiveTab] = useState<TCourseName>(availableCourses[0] ?? 'COMMON_GENERAL');
  const tabData = data[activeTab];

  return (
    <div className="flex flex-col gap-7 px-8 py-4">
      <div className="w-full border-b border-coolgray-20">
        <div className="flex justify-center gap-8">
          {availableCourses.map((course) => (
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

      {tabData && (
        <div key={activeTab} className="flex flex-col gap-7 animate-fade-in">
          <div className="flex gap-3 overflow-x-auto">
            {tabData.areaDetails.map((area) => (
              <AreaDetailCard
                key={area.areaName}
                areaName={area.areaName}
                chipVariant={area.chipVariant}
                requiredCredits={area.requiredCredits}
                completedCredits={area.completedCredits}
                subjects={area.subjects}
              />
            ))}
          </div>

          <div className="flex gap-10">
            <div className="flex-1 border border-coolgray-20 p-4 flex flex-col gap-2">
              <span className="text-heading-5 text-coolgray-90">미충족 사유</span>
              {tabData.unsatisfiedReasons.length > 0 ? (
                tabData.unsatisfiedReasons.map((reason) => (
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
                <span>{tabData.completedCredits}학점</span>
              </div>
              <div className="flex justify-between text-heading-6 text-coolgray-90">
                <span>목표 이수 학점</span>
                <span>{tabData.targetCredits}학점</span>
              </div>
              <div className="flex justify-between text-heading-6 text-coolgray-90">
                <span>잔여 학점</span>
                <span className="text-primary-60">{tabData.remainingCredits}학점</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
