/**
 * [동글맵 > 장소 신고] 신고 모달
 * 공용 신고 모달에 장소 신고 사유 6종을 넣어 지도 위에 띄운다.
 */
import ReportDialog from '@/components/map/reportDialog';
import { PLACE_REPORT_REASONS } from '@/constants/place';
import usePlaceReportForm from '@/hooks/place/usePlaceReportForm';
import type { TPlaceDetail } from '@/types/place/TPlace';

interface IPlaceReportDialogProps {
  place: Pick<TPlaceDetail, 'id' | 'name' | 'category'>;
  onClose: () => void;
}

export default function PlaceReportDialog({ place, onClose }: IPlaceReportDialogProps) {
  const report = usePlaceReportForm(place, onClose);
  return (
    <ReportDialog
      idPrefix="place-report"
      title="장소 신고"
      intro={
        <>
          <span className="text-coolgray-90">{place.name}</span>의 어떤 점이 잘못됐나요? 관리자가 확인한 뒤 처리해요.
        </>
      }
      confirmTitle="이 장소를 신고할까요?"
      reasons={PLACE_REPORT_REASONS}
      report={report}
      onClose={onClose}
    />
  );
}
