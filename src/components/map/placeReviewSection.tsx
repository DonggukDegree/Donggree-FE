/**
 * [동글맵 > 리뷰] 장소 정보의 리뷰 영역
 * 내 리뷰를 맨 위에 따로 두고(수정·삭제), 다른 회원 리뷰는 최신순 10개씩 "더보기"로 보여준다(신고 가능).
 * 작성자 닉네임이 없으면 "탈퇴한 회원", 프로필 사진이 없으면 기본 아바타를 쓴다.
 * 작성·수정·신고는 인증 학생만 하며, 미인증 회원도 버튼은 보고 누르면 인증 안내를 받는다.
 */
import { useState } from 'react';

import Pencil from '@/assets/icons/pencil.svg?react';
import Siren from '@/assets/icons/siren.svg?react';
import UserThumb from '@/assets/profile/userThumb.svg?react';
import Button from '@/components/common/inputs/button';
import PlaceReviewFormDialog from '@/components/map/placeReviewFormDialog';
import ReviewReportDialog from '@/components/map/reviewReportDialog';
import { ReviewStars } from '@/components/map/reviewStars';
import { WITHDRAWN_MEMBER_LABEL } from '@/constants/place';
import { usePlaceReviewDelete } from '@/hooks/place/usePlaceReviewMutations';
import usePlaceReviews from '@/hooks/place/usePlaceReviews';
import useUserInfo from '@/hooks/user/useUserInfo';
import { useModalStore } from '@/stores/modalStore';
import type { TPlaceDetail, TPlaceReview } from '@/types/place/TPlace';
import { trackEvent } from '@/utils/analytics/analytics';
import { formatPlaceDate } from '@/utils/place/place';
import { canWritePlace } from '@/utils/place/placeForm';
import { shouldFoldReview } from '@/utils/place/placeReview';

const ACTION_CLASS = 'flex cursor-pointer items-center gap-1 text-body-xs text-coolgray-60';

type TDialog =
  | { type: 'write' }
  | { type: 'edit'; review: TPlaceReview }
  | { type: 'delete'; review: TPlaceReview }
  | { type: 'report'; review: TPlaceReview }
  | null;

export default function PlaceReviewSection({ place }: { place: TPlaceDetail }) {
  const { reviews, myReview, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = usePlaceReviews(
    place.id,
  );
  const { data: user } = useUserInfo();
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  const [dialog, setDialog] = useState<TDialog>(null);
  const closeDialog = () => setDialog(null);
  const others = reviews.filter((review) => !review.mine);

  // 작성·수정·신고는 인증 학생만. 서버도 요청마다 다시 검증한다.
  const openIfVerified = (next: NonNullable<TDialog>) => {
    if (!canWritePlace(user)) {
      openStudentVerification();
      return;
    }
    if (next.type === 'write') trackEvent('place_review_write_start', { place_category: place.category });
    setDialog(next);
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-button-m text-coolgray-90">
          리뷰 <span className="text-coolgray-60">{place.reviewCount}</span>
        </h3>
        {!myReview && (
          <button
            type="button"
            onClick={() => openIfVerified({ type: 'write' })}
            className="flex cursor-pointer items-center gap-1 rounded-full bg-primary-60 px-3 py-1 text-body-xs text-white hover:opacity-90"
          >
            <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
            리뷰 쓰기
          </button>
        )}
      </div>

      {myReview && (
        <div className="flex flex-col gap-2 rounded-lg bg-coolgray-10 px-4 py-3">
          <ReviewItem review={myReview}>
            {!myReview.hidden && (
              <button
                type="button"
                onClick={() => openIfVerified({ type: 'edit', review: myReview })}
                className={`${ACTION_CLASS} hover:text-primary-60`}
              >
                수정
              </button>
            )}
            <button
              type="button"
              onClick={() => setDialog({ type: 'delete', review: myReview })}
              className={`${ACTION_CLASS} hover:text-alert`}
            >
              삭제
            </button>
          </ReviewItem>
          {myReview.hidden && (
            <p className="break-keep text-body-xs text-alert">
              신고가 누적되어 숨겨진 리뷰예요. 다른 회원에게 보이지 않고 수정할 수 없어요.
            </p>
          )}
        </div>
      )}

      {isPending ? (
        <p className="py-4 text-center text-body-s text-coolgray-60">리뷰를 불러오는 중이에요</p>
      ) : isError ? (
        <p className="py-4 text-center text-body-s text-coolgray-60">리뷰를 불러오지 못했어요.</p>
      ) : others.length === 0 && !myReview ? (
        <p className="rounded-lg bg-coolgray-10 px-4 py-5 text-center text-body-s text-coolgray-60">
          아직 리뷰가 없어요. 첫 리뷰를 남겨주세요.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-coolgray-10">
          {others.map((review) => (
            <li key={review.id} className="py-3">
              <ReviewItem review={review}>
                <button
                  type="button"
                  onClick={() => openIfVerified({ type: 'report', review })}
                  className={`${ACTION_CLASS} hover:text-alert`}
                >
                  <Siren aria-hidden="true" className="h-3.5 w-3.5" />
                  신고
                </button>
              </ReviewItem>
            </li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <button
          type="button"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
          className="cursor-pointer self-center text-button-s text-coolgray-60 hover:text-primary-60 disabled:cursor-default"
        >
          {isFetchingNextPage ? '불러오는 중' : '리뷰 더보기'}
        </button>
      )}

      {(dialog?.type === 'write' || dialog?.type === 'edit') && (
        <PlaceReviewFormDialog
          place={place}
          review={dialog.type === 'edit' ? dialog.review : null}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'report' && <ReviewReportDialog place={place} review={dialog.review} onClose={closeDialog} />}
      {dialog?.type === 'delete' && <DeleteReviewDialog place={place} review={dialog.review} onClose={closeDialog} />}
    </section>
  );
}

function ReviewItem({ review, children }: { review: TPlaceReview; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const foldable = shouldFoldReview(review.content);
  return (
    <article className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {review.author.profileUrl ? (
          <img src={review.author.profileUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
        ) : (
          <UserThumb aria-hidden="true" className="h-8 w-8 shrink-0" />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-body-s text-coolgray-90">
            {review.author.nickname ?? WITHDRAWN_MEMBER_LABEL}
            {review.mine && <span className="ml-1 text-body-xs text-primary-60">내 리뷰</span>}
          </p>
          <div className="flex items-center gap-1.5">
            <ReviewStars rating={review.rating} className="text-body-xs" />
            <span className="text-body-xs text-coolgray-60">{formatPlaceDate(review.createdAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      </div>
      <p
        className={`whitespace-pre-line break-keep text-body-s text-coolgray-90 ${foldable && !expanded ? 'line-clamp-3' : ''}`}
      >
        {review.content}
      </p>
      {foldable && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="cursor-pointer self-start text-body-xs text-coolgray-60 hover:text-primary-60"
        >
          {expanded ? '접기' : '펼치기'}
        </button>
      )}
    </article>
  );
}

function DeleteReviewDialog({
  place,
  review,
  onClose,
}: {
  place: Pick<TPlaceDetail, 'id' | 'category'>;
  review: TPlaceReview;
  onClose: () => void;
}) {
  const remove = usePlaceReviewDelete(place, onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="place-review-delete-title"
        className="flex w-full max-w-100 flex-col gap-5 rounded-2xl bg-white p-5"
      >
        <div className="flex flex-col gap-2">
          <h2 id="place-review-delete-title" className="text-heading-6 text-coolgray-90">
            리뷰를 삭제할까요?
          </h2>
          <p className="break-keep text-body-s text-coolgray-60">
            삭제하면 되돌릴 수 없고, 이 장소에 리뷰를 다시 쓸 수 있어요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outlined" className="flex-1" disabled={remove.isPending} onClick={onClose}>
            취소
          </Button>
          <Button
            type="button"
            variant={remove.isPending ? 'disabled' : 'alert'}
            className="flex-1"
            onClick={() => remove.mutate({ placeId: place.id, reviewId: review.id })}
          >
            {remove.isPending ? '삭제 중' : '삭제하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}
