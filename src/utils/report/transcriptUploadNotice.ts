/** [성적표 업로드] 학점 차이와 F 평가방식 확인을 하나의 안내 모달로 조합한다. */
import { CREDIT_GAP_MODAL, GRADE_REVIEW_MODAL, type TReportModalContent } from '@/constants/report/reportModals';
import type { TPutTranscriptResult } from '@/types/report/TPutTranscript';

export const buildTranscriptUploadNotice = ({
  creditGap,
  gradeReviewCourses,
}: TPutTranscriptResult): TReportModalContent | null => {
  const creditNotice =
    creditGap === 0
      ? null
      : creditGap > 0
        ? CREDIT_GAP_MODAL.positive(creditGap)
        : CREDIT_GAP_MODAL.negative(creditGap);
  // 이전 서버 응답과 배포 순서가 엇갈려도 업로드 결과를 정상 표시한다.
  if (!gradeReviewCourses?.length) return creditNotice;
  if (creditGap !== 0) return GRADE_REVIEW_MODAL.withCreditGap(creditGap);
  return GRADE_REVIEW_MODAL.forCount(gradeReviewCourses.length);
};
