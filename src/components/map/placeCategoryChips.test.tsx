/** [동글맵] 카테고리 칩의 숨은 맛집·전체·카테고리 순서, 선택 상태, 세부·태그 칩 줄 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import PlaceCategoryChips from '@/components/map/placeCategoryChips';
import { PLACE_CATEGORIES } from '@/constants/place';
import { ALL_PLACES_FILTER, type TPlaceFilter } from '@/utils/place/place';

const render = (filter: TPlaceFilter) =>
  renderToStaticMarkup(
    <PlaceCategoryChips
      filter={filter}
      onSelectCategory={vi.fn()}
      onToggleHiddenGem={vi.fn()}
      onToggleSubCategory={vi.fn()}
      onToggleTag={vi.fn()}
    />,
  );

describe('동글맵 카테고리 칩', () => {
  it('맨 앞 숨은 맛집(primary-30 배경), 전체, 카테고리 순서이며 카테고리는 핀과 같은 이모지를 붙임', () => {
    const html = render(ALL_PLACES_FILTER);
    expect(html.indexOf('숨은 맛집')).toBeLessThan(html.indexOf('>전체<'));
    expect(html).toMatch(
      /aria-pressed="false" class="[^"]*bg-primary-30[^"]*"><span aria-hidden="true" class="mr-1">✨<\/span>숨은 맛집/,
    );
    expect(html).toMatch(/aria-pressed="true"[^>]*>전체<\/button>/);
    for (const { emoji, label } of PLACE_CATEGORIES) {
      expect(html).toContain(`<span aria-hidden="true" class="mr-1">${emoji}</span>${label}</button>`);
    }
    expect(html).toContain('🎮');
    expect(html).not.toContain('세부 카테고리');
  });

  it('카테고리를 고르면 하나만 눌리고 아랫줄에 그 카테고리의 세부 칩(중복 선택)', () => {
    const html = render({ mode: 'category', category: 'CAFE', subCategories: ['FRANCHISE', 'COFFEE'] });
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(3);
    expect(html).toMatch(/aria-pressed="true"[^>]*><span aria-hidden="true" class="mr-1">☕<\/span>카페/);
    expect(html).toContain('aria-label="세부 카테고리"');
    for (const label of ['프랜차이즈', '디저트/베이커리', '커피 전문', '기타'])
      expect(html).toContain(`>${label}</button>`);
    expect(html).toMatch(/aria-pressed="true"[^>]*>프랜차이즈<\/button>/);
    expect(html).toMatch(/aria-pressed="false"[^>]*>디저트\/베이커리<\/button>/);
  });

  it('숨은 맛집을 고르면 카테고리 선택은 모두 풀리고 아랫줄에 태그 칩 8종', () => {
    const html = render({ mode: 'hiddenGem', tags: ['SOLO_DINING'] });
    expect(html).not.toMatch(/aria-pressed="true"[^>]*>전체<\/button>/);
    expect(html).toContain('aria-label="숨은 맛집 종류"');
    const labels = [
      '지름길 맛집',
      '공부 맛집',
      '회식 맛집',
      '밥약 맛집',
      '분위기 맛집',
      '혼밥 맛집',
      '커피 맛집',
      '진짜 맛집',
    ];
    const positions = labels.map((label) => html.indexOf(`>${label}</button>`));
    expect(positions.every((position) => position > 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(html).not.toContain('안주 맛집');
    expect(html).toMatch(/aria-pressed="true"[^>]*>혼밥 맛집<\/button>/);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(2);
  });
});
