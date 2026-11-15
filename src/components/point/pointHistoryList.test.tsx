import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import PointHistoryList from '@/components/point/pointHistoryList';

describe('포인트 적립 내역', () => {
  it('항목 이름·날짜·적립액을 최신순 그대로 보여주고 회수된 적립은 취소선', () => {
    const html = renderToStaticMarkup(
      <PointHistoryList
        histories={[
          { historyId: 3, reason: 'PLACE_REGISTER', amount: 500, revoked: false, createdAt: '2026-11-16T10:00:00' },
          { historyId: 2, reason: 'PLACE_REVIEW', amount: 100, revoked: true, createdAt: '2026-11-15T10:00:00' },
          {
            historyId: 1,
            reason: 'GRADUATION_REPORT_FIRST_VIEW',
            amount: 500,
            revoked: false,
            createdAt: '2026-11-14T10:00:00',
          },
        ]}
      />,
    );
    expect(html.indexOf('동글맵 새 장소 등록')).toBeLessThan(html.indexOf('동글맵 리뷰 작성'));
    expect(html.indexOf('동글맵 리뷰 작성')).toBeLessThan(html.indexOf('졸업 리포트 첫 확인'));
    expect(html).toContain('2026.11.16');
    expect(html).toMatch(/font-semibold text-primary-60">\+500P/);
    expect(html).toMatch(/line-through">\+100P/);
    expect(html).toContain('숨김 처리로 회수됨');
  });

  it('내역이 없으면 안내 문구', () => {
    expect(renderToStaticMarkup(<PointHistoryList histories={[]} />)).toContain('아직 적립된 포인트가 없어요');
  });
});
