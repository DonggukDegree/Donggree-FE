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
  const [activeTab, setActiveTab] = useState<TCourseName>('COMMON_GENERAL');
  const tabData = data[activeTab];

  return (
    <div className="flex flex-col gap-7 px-8 py-4">
      <div className="w-full border-b border-coolgray-20">
        <div className="flex justify-center gap-8">
          {COURSE_NAMES.map((course) => (
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
        <>
          <div className="flex gap-3 overflow-x-auto">
            {tabData.areaDetails.map((area, index) => (
              <AreaDetailCard
                key={index}
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
              {tabData.unsatisfiedReasons.map((reason, index) => (
                <span key={index} className="text-button-m text-alert">
                  {reason}
                </span>
              ))}
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
        </>
      )}
    </div>
  );
}
