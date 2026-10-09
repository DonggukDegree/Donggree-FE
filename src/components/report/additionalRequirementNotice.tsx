/** [졸업 판정 > 리포트] 요건 세트별 추가 확인사항 안내 */
import { useEffect, useState } from 'react';

import Button from '@/components/common/button';
import type { TGetReportSummaryResult } from '@/types/report/TGetReportSummary';

type TNotice = Omit<TGetReportSummaryResult['additionalNotices'][number], 'yearStart' | 'yearEnd'> & {
  yearStart: number | null;
  yearEnd: number | null;
};

const STORAGE_KEY = 'donggree.dismissed-requirement-notices';

const readDismissedIds = (): number[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((id): id is number => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
};

export default function AdditionalRequirementNotice({
  notices,
  forceShow = false,
  previewMode = false,
  onDismiss,
}: {
  notices: TNotice[];
  forceShow?: boolean;
  previewMode?: boolean;
  onDismiss?: () => void;
}) {
  const [visibleNotices, setVisibleNotices] = useState<TNotice[]>([]);

  useEffect(() => {
    const dismissedIds = new Set(forceShow ? [] : readDismissedIds());
    setVisibleNotices(notices.filter((notice) => !dismissedIds.has(notice.requirementSetId)));
  }, [forceShow, notices]);

  if (visibleNotices.length === 0) return null;

  const close = () => {
    setVisibleNotices([]);
    onDismiss?.();
  };
  const dismissPermanently = () => {
    if (!previewMode) {
      try {
        const existing = new Set(readDismissedIds());
        visibleNotices.forEach((notice) => existing.add(notice.requirementSetId));
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing]));
      } catch {
        // 저장소 사용이 제한된 환경에서도 현재 조회의 안내는 닫을 수 있다.
      }
    }
    close();
  };

  return (
    <aside
      aria-label="추가 확인사항"
      className="pointer-events-none fixed left-4 top-4 z-100 h-[min(28rem,calc(100dvh-2rem))] w-[min(24rem,calc(100vw-2rem))]"
    >
      <section className="pointer-events-none flex h-full flex-col rounded-2xl border border-primary-60/20 bg-white p-5 text-coolgray-90 shadow-xl">
        <h2 className="text-heading-6 font-bold text-primary-90">📢 추가 확인사항</h2>
        <div className="pointer-events-auto mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-4">
            {visibleNotices.map((notice) => (
              <article key={notice.requirementSetId}>
                <h3 className="text-body-s font-semibold text-black">
                  {[
                    notice.collegeName,
                    notice.departmentName,
                    notice.track === 'ADVANCED'
                      ? '심화과정'
                      : notice.track === 'GENERAL'
                        ? '일반과정'
                        : null,
                    notice.yearStart && notice.yearEnd
                      ? `${notice.yearStart === notice.yearEnd ? notice.yearStart : `${notice.yearStart}-${notice.yearEnd}`}학년도 입학 대상 안내`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-body-xs text-coolgray-70">{notice.content}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outlined"
            className="pointer-events-auto flex-1 px-2 py-2 text-body-xs"
            onClick={close}
          >
            닫기
          </Button>
          <Button className="pointer-events-auto flex-1 px-2 py-2 text-body-xs" onClick={dismissPermanently}>
            다시 보지 않기
          </Button>
        </div>
      </section>
    </aside>
  );
}
