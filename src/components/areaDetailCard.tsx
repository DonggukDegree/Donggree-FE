import Chip, { type TChipVariant } from '@/components/chip';

interface ISubject {
  name: string;
  credits: number;
  chipVariant: TChipVariant;
  details?: string[];
}

interface IAreaDetailCardProps {
  areaName: string;
  chipVariant: TChipVariant;
  requiredCredits: number;
  completedCredits: number;
  subjects: ISubject[];
}

export default function AreaDetailCard({
  areaName,
  chipVariant,
  requiredCredits,
  completedCredits,
  subjects,
}: IAreaDetailCardProps) {
  return (
    <div className="w-50 flex flex-col shrink-0">
      <div className="border border-coolgray-20 p-3 flex flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-body-s text-coolgray-60">이수 기준</span>
          <div className="flex items-center justify-between gap-2">
            <span className="text-heading-5 text-coolgray-90">{areaName}</span>
            <Chip variant={chipVariant} />
          </div>
        </div>
        <span className="text-body-s text-coolgray-60">
          {requiredCredits}학점 중 {completedCredits}학점 이수
        </span>
      </div>

      <div className="w-full p-4 flex flex-col gap-1">
        <span className="text-body-s text-coolgray-60">소영역 분석</span>
        <div className="w-full flex flex-col">
          {subjects.map((subject, index) => (
            <div key={index} className="w-full border-b border-coolgray-10 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-heading-6 text-coolgray-90 max-w-[6em] break-words">{subject.name}</span>
                  <span className="text-body-xs text-coolgray-60">{subject.credits}학점</span>
                </div>
                <Chip variant={subject.chipVariant} />
              </div>
              {subject.details && subject.details.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {subject.details.map((detail, idx) => (
                    <span key={idx} className="text-body-xs text-primary-90 max-w-[8em] break-words">
                      {detail}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
