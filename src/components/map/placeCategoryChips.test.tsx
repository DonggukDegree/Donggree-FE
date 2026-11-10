/** [동글맵] 카테고리 칩의 이모지·라벨 순서와 선택 상태 표시 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import PlaceCategoryChips from '@/components/map/placeCategoryChips';
import { PLACE_CATEGORIES } from '@/constants/place';

describe('동글맵 카테고리 칩', () => {
  it('전체는 라벨만, 각 카테고리는 핀과 같은 이모지를 라벨 앞에 표시', () => {
    const html = renderToStaticMarkup(<PlaceCategoryChips selected={null} onSelect={() => {}} />);
    expect(html).toMatch(/aria-pressed="true"[^>]*>전체<\/button>/);
    for (const { emoji, label } of PLACE_CATEGORIES) {
      expect(html).toContain(`<span aria-hidden="true" class="mr-1">${emoji}</span>${label}</button>`);
    }
  });

  it('선택한 카테고리 칩만 눌린 상태로 표시', () => {
    const html = renderToStaticMarkup(<PlaceCategoryChips selected="CAFE" onSelect={() => {}} />);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-pressed="true"[^>]*><span aria-hidden="true" class="mr-1">☕<\/span>카페/);
  });
});
