/**
 * [동글맵 > 장소 등록] 중복 장소 안내
 * 같은 이름(exact)이면 등록을 막고 기존 장소로 이동만 제공한다.
 * 비슷한 이름(similar)이면 후보 중 고르거나 "다른 장소예요"로 등록을 이어간다.
 */
import Button from '@/components/common/inputs/button';
import { PLACE_CATEGORY_BY_VALUE, PLACE_SUB_CATEGORY_LABELS } from '@/constants/place';
import type { TDuplicateNotice } from '@/hooks/place/usePlaceRegisterForm';
import type { TPlaceDuplicateCandidate } from '@/types/place/TPlace';

interface IPlaceDuplicateDialogProps {
  notice: TDuplicateNotice;
  onSelectExisting: (placeId: number) => void;
  onConfirmDifferent: () => void;
  onClose: () => void;
}

export default function PlaceDuplicateDialog({
  notice,
  onSelectExisting,
  onConfirmDifferent,
  onClose,
}: IPlaceDuplicateDialogProps) {
  const isExact = notice.type === 'exact';
  const candidates = isExact ? notice.duplicates.exact : notice.duplicates.similar;

  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center bg-overlay p-4 lg:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-duplicate-title"
        className="flex max-h-full w-full flex-col gap-5 overflow-y-auto rounded-2xl bg-white p-5"
      >
        <div className="flex flex-col gap-1">
          <h2 id="place-duplicate-title" className="text-heading-6 text-coolgray-90">
            {isExact ? '이미 등록된 장소예요' : '혹시 이 중에 있나요?'}
          </h2>
          <p className="break-keep text-body-s text-coolgray-60">
            {isExact
              ? '50m 안에 같은 이름의 장소가 있어 새로 등록할 수 없어요.'
              : '50m 안에 이름이 비슷한 장소가 있어요. 같은 곳이면 기존 장소를 이용해주세요.'}
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {candidates.map((candidate) => (
            <li key={candidate.id}>
              <CandidateButton candidate={candidate} onSelect={onSelectExisting} />
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button variant="outlined" className="flex-1" onClick={onClose}>
            {isExact ? '닫기' : '돌아가기'}
          </Button>
          {!isExact && (
            <Button className="flex-1" onClick={onConfirmDifferent}>
              다른 장소예요
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateButton({
  candidate,
  onSelect,
}: {
  candidate: TPlaceDuplicateCandidate;
  onSelect: (placeId: number) => void;
}) {
  const category = PLACE_CATEGORY_BY_VALUE[candidate.category];
  return (
    <button
      type="button"
      onClick={() => onSelect(candidate.id)}
      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-coolgray-30 px-4 py-3 text-left hover:border-primary-60"
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-button-m text-coolgray-90">{candidate.name}</span>
        <span className="text-body-xs text-coolgray-60">
          {category.emoji} {category.label} · {PLACE_SUB_CATEGORY_LABELS[candidate.subCategory]} ·{' '}
          {candidate.distanceMeters}m
        </span>
      </span>
      <span className="shrink-0 text-body-s text-primary-60">이 장소 보기</span>
    </button>
  );
}
