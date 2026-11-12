/**
 * [동글맵 > 리뷰 신고] 신고 모달
 * 공용 신고 모달에 리뷰 신고 사유 5종을 넣는다. 장소 정보 시트 안에서 열리므로 화면 전체를 덮는다.
 */
import ReportDialog from '@/components/map/reportDialog';
import { REVIEW_REPORT_REASONS } from '@/constants/place';
import { useReviewReportForm } from '@/hooks/place/usePlaceReviewMutations';
import type { TPlaceDetail, TPlaceReview } from '@/types/place/TPlace';

interface IReviewReportDialogProps {
  place: Pick<TPlaceDetail, 'id' | 'category'>;
  review: Pick<TPlaceReview, 'id'>;
  onClose: () => void;
}

export default function ReviewReportDialog({ place, review, onClose }: IReviewReportDialogProps) {
  const report = useReviewReportForm(place, review, onClose);
  return (
    <ReportDialog
      idPrefix="review-report"
      title="리뷰 신고"
      intro="이 리뷰의 어떤 점이 문제인가요? 관리자가 확인한 뒤 처리해요."
      confirmTitle="이 리뷰를 신고할까요?"
      reasons={REVIEW_REPORT_REASONS}
      report={report}
      onClose={onClose}
      overlayClassName="fixed inset-0 z-50"
    />
  );
}
