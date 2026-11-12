/**
 * [동글맵 > 장소 신고] 신고 모달
 * 장소 정보 위에 띄운다(모바일 아래, PC 가운데). 사유 하나를 고르고, 기타는 내용을 꼭 적게 한다.
 * 신고만으로 장소가 바로 숨겨지지 않는다는 점을 먼저 알린다.
 */
import Button from '@/components/common/inputs/button';
import { INPUT_CLASS } from '@/constants/inputStyles';
import { PLACE_REPORT_DESCRIPTION_MAX, PLACE_REPORT_REASONS } from '@/constants/place';
import usePlaceReportForm from '@/hooks/place/usePlaceReportForm';
import type { TPlaceDetail } from '@/types/place/TPlace';

interface IPlaceReportDialogProps {
  place: Pick<TPlaceDetail, 'id' | 'name' | 'category'>;
  onClose: () => void;
}

export default function PlaceReportDialog({ place, onClose }: IPlaceReportDialogProps) {
  const report = usePlaceReportForm(place, onClose);
  const { form, errors } = report;
  const isOther = form.reason === 'OTHER';

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-overlay p-4 lg:items-center">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-report-title"
        noValidate
        className="flex max-h-full w-full max-w-120 flex-col gap-5 overflow-y-auto rounded-2xl bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          report.submit();
        }}
      >
        <div className="flex flex-col gap-1">
          <h2 id="place-report-title" className="text-heading-6 text-coolgray-90">
            장소 신고
          </h2>
          <p className="break-keep text-body-s text-coolgray-60">
            <span className="text-coolgray-90">{place.name}</span>의 어떤 점이 잘못됐나요? 관리자가 확인한 뒤 처리해요.
          </p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">신고 사유</legend>
          {PLACE_REPORT_REASONS.map(({ value, label }) => {
            const checked = form.reason === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-body-s ${
                  checked ? 'border-primary-60 text-coolgray-90' : 'border-coolgray-30 text-coolgray-90'
                }`}
              >
                <input
                  type="radio"
                  name="place-report-reason"
                  value={value}
                  checked={checked}
                  onChange={() => report.changeReason(value)}
                  // 기본 라디오는 브라우저마다 강조색이 테두리 밖으로 번져 보여, 테두리·가운데 점을 직접 그린다.
                  className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-coolgray-30 checked:border-primary-60 checked:bg-primary-60 checked:shadow-[inset_0_0_0_3px_white] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
                />
                {label}
              </label>
            );
          })}
          {errors.reason && <p className="text-body-xs text-alert">{errors.reason}</p>}
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor="place-report-description" className="text-button-m text-coolgray-90">
            내용
            <span className="ml-1 text-body-xs text-coolgray-60">{isOther ? '필수' : '선택'}</span>
          </label>
          <textarea
            id="place-report-description"
            rows={3}
            value={form.description}
            maxLength={PLACE_REPORT_DESCRIPTION_MAX}
            placeholder={isOther ? '어떤 점이 잘못됐는지 적어주세요' : '자세한 내용이 있으면 적어주세요'}
            onChange={(event) => report.changeDescription(event.target.value)}
            className={`${INPUT_CLASS} resize-none ${errors.description ? 'border-alert' : 'border-coolgray-30'}`}
          />
          <div className="flex justify-between gap-2">
            <p className="text-body-xs text-alert">{errors.description}</p>
            <p className="shrink-0 text-body-xs text-coolgray-60">
              {form.description.length}/{PLACE_REPORT_DESCRIPTION_MAX}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outlined" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant={report.isSubmitting ? 'disabled' : 'alert'} className="flex-1">
            {report.isSubmitting ? '신고 중' : '신고하기'}
          </Button>
        </div>
      </form>
    </div>
  );
}
