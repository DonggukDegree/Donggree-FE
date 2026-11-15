import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import PointRuleTooltip from '@/components/point/pointRuleTooltip';

describe('포인트 적립 기준 툴팁', () => {
  it('? 버튼 호버·포커스 시 활동별 적립액과 회수 안내를 보여줌', () => {
    const html = renderToStaticMarkup(<PointRuleTooltip />);
    expect(html).toMatch(/aria-label="포인트 적립 기준" aria-describedby="point-rule-tooltip"/);
    expect(html).toMatch(
      /role="tooltip" class="[^"]*opacity-0[^"]*group-focus-within:opacity-100[^"]*group-hover:opacity-100/,
    );
    for (const [label, amount] of [
      ['졸업 리포트 첫 확인', '+500P'],
      ['동글맵 새 장소 등록', '+500P'],
      ['리뷰가 없던 장소에 첫 리뷰 작성', '+500P'],
      ['동글맵 리뷰 작성', '+100P'],
      ['동글맵 장소 정보 수정', '+100P'],
    ] as const) {
      expect(html).toMatch(new RegExp(`${label}.*?${amount.replace('+', '\\+')}`));
    }
    expect(html).toContain('(장소별 1회)');
    expect(html).toContain('숨김 처리된 장소·리뷰로 받은 포인트는 회수돼요.');
  });
});
