/**
 * [마이페이지 > 포인트 내역] 페이지 (/my-page/points)
 * 위에 현재 총 포인트, 아래에 적립 내역(최신순, 20개씩 더보기)을 보여 준다.
 * 제목 옆 ? 툴팁에 어떤 활동에 얼마를 주는지 요약한다.
 */
import Loading from '@/components/common/feedback/loading';
import Button from '@/components/common/inputs/button';
import PointHistoryList from '@/components/point/pointHistoryList';
import PointRuleTooltip from '@/components/point/pointRuleTooltip';
import usePointHistories from '@/hooks/point/usePointHistories';
import usePointSummary from '@/hooks/point/usePointSummary';
import useInView from '@/hooks/useInView';
import NotFound from '@/pages/exception/notFound';
import { formatPoints } from '@/utils/point/point';

export default function Points() {
  // 내역이 길어 화면보다 커져도 페이드인이 켜지도록 조금이라도 보이면 켠다.
  const [ref, isInView] = useInView(0);
  const summary = usePointSummary();
  const { histories, hasNextPage, fetchNextPage, isFetchingNextPage, ...historyQuery } = usePointHistories();

  if (summary.isPending || historyQuery.isPending) return <Loading />;
  if (summary.isError) return <NotFound error={summary.error} source="points" />;
  if (historyQuery.isError) return <NotFound error={historyQuery.error} source="points" />;

  return (
    <div
      ref={ref}
      className={`mx-auto flex w-full max-w-160 flex-col gap-8 px-4 py-8 lg:py-16 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="relative flex items-center gap-2">
        <h1 className="text-heading-4 text-coolgray-90">포인트 내역</h1>
        <PointRuleTooltip />
      </div>

      <section
        aria-label="현재 포인트"
        className="flex items-center justify-between gap-4 rounded-2xl bg-primary-30 px-6 py-5"
      >
        <span className="text-body-m text-coolgray-90">현재 포인트</span>
        <span className="text-heading-4 text-primary-60">{formatPoints(summary.data.totalPoints)}</span>
      </section>

      <section aria-label="적립 내역" className="flex flex-col items-center gap-4">
        <h2 className="self-start text-button-m text-coolgray-90">적립 내역</h2>
        <PointHistoryList histories={histories} />
        {hasNextPage && (
          <Button variant="outlined" className="w-40" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? '불러오는 중' : '더보기'}
          </Button>
        )}
      </section>
    </div>
  );
}
