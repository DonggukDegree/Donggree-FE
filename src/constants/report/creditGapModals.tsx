import type { ReactNode } from 'react';

// 성적표 업로드는 성공했지만 학점 정합성(creditGap !== 0)이 맞지 않을 때 안내할 모달 문구.
// 리포트 자체는 생성됐으므로, 모달 확인 후 졸업 판정(/graduation) 화면으로 이동한다.
// icon/buttonText 등은 훅에서 일괄 부여하고, 여기서는 텍스트만 관리한다.
// creditGap 값을 문구에 노출하기 위해 각 분기를 creditGap을 받는 함수로 둔다.
// (음수 분기는 절대값으로 표시해 자연스러운 문장이 되도록 한다)
type TCreditGapModalContent = {
  title: string;
  subtitle: ReactNode;
  description: string;
};

// creditGap 학점 수치 부분만 primary-60 색으로 강조한다.
const highlightCredit = (value: number) => <span className="text-primary-60">{value}학점</span>;

export const CREDIT_GAP_MODAL = {
  // 양수: PDF 총취득학점 > 인식된 과목 학점 합 → 누락된 수강 이력을 추가해야 함
  positive: (creditGap: number): TCreditGapModalContent => ({
    title: '동그리가 정확한 분석에 실패했어요',
    subtitle: <>동그리가 찾은 학점이 실제 수강한 학점보다 {highlightCredit(creditGap)} 모자라요.</>,
    description:
      '지금 제공하는 리포트는 정확하지 않을 수 있어요.\n리포트 하단의 내 학업 정보 추가에서 누락된 과목을 추가해주세요.',
  }),
  // 음수: 인식된 과목 학점 합 > PDF 총취득학점 → 과목이 더 많이 인식됨(중복 등)
  negative: (creditGap: number): TCreditGapModalContent => ({
    title: '동그리가 정확한 분석에 실패했어요',
    subtitle: <>동그리가 찾은 학점이 실제 수강한 학점보다 {highlightCredit(Math.abs(creditGap))} 많아요.</>,
    description: '지금 제공하는 리포트는 정확하지 않을 수 있어요.\n문제가 있다면 고객지원에 문의해주세요.',
  }),
};
