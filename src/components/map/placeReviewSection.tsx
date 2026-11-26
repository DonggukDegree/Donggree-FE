/**
 * [동글맵 > 리뷰] 장소 정보의 리뷰 영역
 * 내 리뷰를 맨 위에 따로 두고(수정·삭제), 다른 회원 리뷰는 최신순으로 처음 5개, 목록 끝에 가까워지면 10개씩 자동으로 더 보여준다
 * (서버는 10개씩 커서 조회, 받아 둔 리뷰가 모자랄 때만 다음 페이지를 요청하고 받는 동안 깜빡이는 뼈대). 신고 가능.
 * 작성자 닉네임이 없으면 "탈퇴한 회원", 프로필 사진이 없으면 기본 아바타를 쓴다.
 * 숨긴 리뷰는 목록에서 자리를 지키고 닉네임·날짜와 "신고되어 숨겨진 리뷰입니다."만 보여준다(별점·본문·신고 버튼 없음).
 * 작성·수정·신고는 인증 학생만 하며, 미인증 회원도 버튼은 보고 누르면 인증 안내를 받는다.
 */
import { useState } from 'react';

import Pencil from '@/assets/icons/pencil.svg?react';
import Siren from '@/assets/icons/siren.svg?react';
import UserThumb from '@/assets/profile/userThumb.svg?react';
import Skeleton, { LoadMoreStatus } from '@/components/common/feedback/skeleton';
import Button from '@/components/common/inputs/button';
import PlaceReviewFormDialog from '@/components/map/placeReviewFormDialog';
import ReviewReportDialog from '@/components/map/reviewReportDialog';
import { ReviewStars } from '@/components/map/reviewStars';
import {
  HIDDEN_REVIEW_LABEL,
  PLACE_REVIEW_INITIAL_COUNT,
  PLACE_REVIEW_MORE_COUNT,
  WITHDRAWN_MEMBER_LABEL,
} from '@/constants/place';
import { POINT_HINTS } from '@/constants/point';
import { usePlaceReviewDelete } from '@/hooks/place/usePlaceReviewMutations';
import usePlaceReviews from '@/hooks/place/usePlaceReviews';
import useLoadMoreTrigger from '@/hooks/useLoadMoreTrigger';
import useUserInfo from '@/hooks/user/useUserInfo';
import { useModalStore } from '@/stores/modalStore';
import type { TPlaceDetail, TPlaceReview } from '@/types/place/TPlace';
import { trackEvent } from '@/utils/analytics/analytics';
import { formatPlaceDate } from '@/utils/place/place';
import { canWritePlace } from '@/utils/place/placeForm';
import { formatAverageRating, shouldFoldReview } from '@/utils/place/placeReview';

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
  const [visibleCount, setVisibleCount] = useState<number>(PLACE_REVIEW_INITIAL_COUNT);
  const others = reviews.filter((review) => !review.mine);
  const shownReviews = others.slice(0, visibleCount);
  const canShowMore = visibleCount < others.length || hasNextPage;

  const showMore = () => {
    const next = visibleCount + PLACE_REVIEW_MORE_COUNT;
    setVisibleCount(next);
    if (next > others.length && hasNextPage) void fetchNextPage();
  };
  // 목록 끝 표식이 보이면 다음 리뷰를 자동으로 펼친다.
  const loadMoreRef = useLoadMoreTrigger({
    canLoadMore: canShowMore,
    isLoading: isPending || isFetchingNextPage,
    onLoadMore: showMore,
    itemCount: shownReviews.length,
  });

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
        {/* 평균 별점은 제목과 떨어뜨려 오른쪽 끝에 두고, 리뷰 쓰기 버튼이 있으면 그 앞에 둔다. */}
        <div className="ml-auto flex items-center gap-2">
          {place.averageRating !== null && (
            <span className="text-button-m text-primary-60">
              <span aria-hidden="true">★</span>
              <span className="sr-only">평균 별점 </span>
              {formatAverageRating(place.averageRating)}
            </span>
          )}
          {!myReview && (
            // 호버·키보드 포커스 시 버튼 아래에 적립 안내 말풍선. 버튼이 오른쪽 끝에 붙어 있어 말풍선도 오른쪽에 맞춘다.
            <div className="group relative">
              <button
                type="button"
                aria-describedby="review-write-tooltip"
                onClick={() => openIfVerified({ type: 'write' })}
                className="flex cursor-pointer items-center gap-1 rounded-full bg-primary-60 px-3 py-1 text-body-xs text-white hover:opacity-90"
              >
                <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                리뷰 쓰기
              </button>
              <span
                id="review-write-tooltip"
                role="tooltip"
                className="pointer-events-none absolute top-full right-0 z-10 mt-2 translate-y-1 rounded-lg bg-coolgray-90 px-3 py-1.5 text-body-xs whitespace-nowrap text-white opacity-0 shadow-md transition duration-150 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
              >
                <span aria-hidden="true" className="absolute -top-1 right-8 h-2 w-2 rotate-45 bg-coolgray-90" />
                {POINT_HINTS.REVIEW_WRITE}
              </span>
            </div>
          )}
        </div>
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
        <ReviewSkeletonList count={3} />
      ) : isError ? (
        <p className="py-4 text-center text-body-s text-coolgray-60">리뷰를 불러오지 못했어요.</p>
      ) : others.length === 0 && !myReview ? (
        <p className="rounded-lg bg-coolgray-10 px-4 py-5 text-center text-body-s break-keep text-coolgray-60">
          아직 리뷰가 없어요. 첫 리뷰를 남겨주세요.
          <span className="mt-1 block font-semibold text-primary-60">{POINT_HINTS.firstReview(place.name)}</span>
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-coolgray-10">
          {shownReviews.map((review) => (
            <li key={review.id} className="py-3">
              <ReviewItem review={review}>
                {!review.hidden && (
                  <button
                    type="button"
                    onClick={() => openIfVerified({ type: 'report', review })}
                    className={`${ACTION_CLASS} hover:text-alert`}
                  >
                    <Siren aria-hidden="true" className="h-3.5 w-3.5" />
                    신고
                  </button>
                )}
              </ReviewItem>
            </li>
          ))}
        </ul>
      )}

      {isFetchingNextPage && <ReviewSkeletonList count={2} />}
      <div ref={loadMoreRef} aria-hidden />
      <LoadMoreStatus isLoading={isPending || isFetchingNextPage} />

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

// 리뷰를 불러오는 동안 리뷰 한 줄 모양으로 깜빡이는 뼈대
function ReviewSkeletonList({ count }: { count: number }) {
  return (
    <ul className="flex flex-col divide-y divide-coolgray-10">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex gap-3 py-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

// 본문이 비어 온 리뷰(목록의 숨긴 리뷰)는 별점·본문 대신 안내 문구만 보여준다. 내 리뷰는 숨겨져도 본문이 온다.
function ReviewItem({ review, children }: { review: TPlaceReview; children?: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const masked = review.content === null || review.rating === null;
  const foldable = !masked && shouldFoldReview(review.content ?? '');
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
            {review.rating !== null && <ReviewStars rating={review.rating} className="text-body-xs" />}
            <span className="text-body-xs text-coolgray-60">{formatPlaceDate(review.createdAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      </div>
      {masked ? (
        <p className="break-keep text-body-s text-coolgray-60">{HIDDEN_REVIEW_LABEL}</p>
      ) : (
        <p
          className={`whitespace-pre-line break-keep text-body-s text-coolgray-90 ${foldable && !expanded ? 'line-clamp-3' : ''}`}
        >
          {review.content}
        </p>
      )}
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
