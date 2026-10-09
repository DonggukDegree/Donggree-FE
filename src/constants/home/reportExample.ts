/** [홈 > 리포트 체험] 서비스 소개용 가상 데이터. 실제 학과의 졸업 기준이 아니다. */
import type { TReportPreviewDetails } from '@/types/admin/TPostReportPreview';
import { COURSE_LABEL } from '@/types/course';
import type { TGetReportDetailResult, TReportAreaDetail } from '@/types/report/TGetReportDetail';
import type { TGetReportSummaryResult } from '@/types/report/TGetReportSummary';

function detail(areaDetails: TReportAreaDetail[], unsatisfiedReasons: string[] = []): TGetReportDetailResult {
  const earnedCredits = areaDetails.reduce((sum, item) => sum + item.earnedCredits, 0);
  const targetCredits = areaDetails.reduce((sum, item) => sum + item.targetCredits, 0);
  return {
    areaDetails,
    unsatisfiedReasons,
    creditStatus: { earnedCredits, targetCredits, remainingCredits: Math.max(0, targetCredits - earnedCredits) },
  };
}

export const REPORT_EXAMPLE_DETAILS = {
  COMMON_GENERAL: detail(
    [
      {
        areaName: '동국인성',
        targetCredits: 4,
        earnedCredits: 3,
        satisfied: false,
        items: [
          { title: '자아와명상1', credit: 1, status: 'SATISFIED', detail: null },
          { title: '자아와명상2', credit: 1, status: 'UNSATISFIED', detail: null },
          { title: '불교와인간', credit: 2, status: 'SATISFIED', detail: null },
        ],
      },
      {
        areaName: '창의와융합',
        targetCredits: 3,
        earnedCredits: 3,
        satisfied: true,
        items: [{ title: '자연과기술명작세미나', credit: 3, status: 'OPTIONAL', detail: null }],
      },
    ],
    ['자아와명상2는 필수 과목입니다.', '동국인성을 4학점 이상 이수해야 합니다.'],
  ),
  LIBERAL_ARTS: detail([]),
  ACADEMIC_FOUNDATION: detail(
    [
      {
        areaName: '수학',
        targetCredits: 9,
        earnedCredits: 6,
        satisfied: false,
        items: [
          { title: '확률및통계학', credit: 3, status: 'SATISFIED', detail: null },
          { title: '미적분학및연습1', credit: 3, status: 'SATISFIED', detail: null },
          { title: '공학선형대수학', credit: 3, status: 'UNSATISFIED', detail: null },
        ],
      },
      {
        areaName: '과학',
        targetCredits: 7,
        earnedCredits: 7,
        satisfied: true,
        items: [
          { title: '개론', credit: 3, status: 'SATISFIED', detail: ['물리학개론'] },
          { title: '실험', credit: 4, status: 'SATISFIED', detail: ['일반물리학및실험1'] },
        ],
      },
    ],
    ['공학선형대수학은 필수 과목입니다.', '수학을 9학점 이상 이수해야 합니다.'],
  ),
  FIRST_MAJOR: {
    ...detail([], ['제1전공 졸업 이수 학점이 부족합니다.']),
    creditStatus: { earnedCredits: 16, targetCredits: 60, remainingCredits: 44 },
  },
} satisfies TReportPreviewDetails;

export const REPORT_EXAMPLE_COURSE_TYPES = Object.keys(
  REPORT_EXAMPLE_DETAILS,
) as (keyof typeof REPORT_EXAMPLE_DETAILS)[];
const earned = Object.values(REPORT_EXAMPLE_DETAILS).reduce((sum, item) => sum + item.creditStatus.earnedCredits, 0);
const target = Object.values(REPORT_EXAMPLE_DETAILS).reduce((sum, item) => sum + item.creditStatus.targetCredits, 0);

export const REPORT_EXAMPLE: TGetReportSummaryResult = {
  summary: {
    achievementRate: Math.round((earned / target) * 100),
    earnedCredits: earned,
    targetCredits: target,
    remainingCredits: target - earned,
    gpa: 3.82,
    graduated: false,
    unsatisfiedReasons: ['총 졸업 이수 학점과 일부 영역의 필수 요건이 부족해요.'],
  },
  areaOverviews: REPORT_EXAMPLE_COURSE_TYPES.map((courseType) => {
    const data = REPORT_EXAMPLE_DETAILS[courseType];
    return {
      courseType,
      courseTypeName: COURSE_LABEL[courseType],
      achievementRate:
        data.creditStatus.targetCredits === 0
          ? 0
          : Math.min(100, Math.round((data.creditStatus.earnedCredits / data.creditStatus.targetCredits) * 100)),
      remainingCredits: data.creditStatus.remainingCredits,
      satisfied: data.creditStatus.remainingCredits === 0 && data.areaDetails.every((item) => item.satisfied),
    };
  }),
  hasUnsupportedMajor: false,
  englishPassed: true,
};
