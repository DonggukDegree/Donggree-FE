/** [동글맵] 첫 방문 튜토리얼 모달의 첫 단계 구성 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import MapOnboardingModal from '@/components/map/mapOnboardingModal';
import { MAP_ONBOARDING_STEPS } from '@/constants/place';

describe('MapOnboardingModal', () => {
  it('첫 단계는 이미지 자리·제목·본문·진행 점 4개와 다음 버튼만 보여주고 이전 버튼은 없다', () => {
    const html = renderToStaticMarkup(<MapOnboardingModal />);

    expect(html).toContain('aspect-[4/3]');
    expect(html).toContain('동글맵이 출시되었어요!');
    expect(html).toContain('상단 칩을 눌러 학교 주변 &quot;동글인 보증&quot; 맛집을 알아보세요.');
    expect(html).toContain('aria-label="4단계 중 1단계"');
    expect(html.match(/<li /g)).toHaveLength(4);
    expect(html).toContain('>다음</button>');
    expect(html).not.toContain('이전');
    expect(html).not.toContain('시작하기');
  });

  it('튜토리얼은 4단계이고 마지막은 숨은 맛집 안내다', () => {
    expect(MAP_ONBOARDING_STEPS.map((step) => step.title)).toEqual([
      '동글맵이 출시되었어요!',
      '좋아하는 장소를 등록해요.',
      '장소 정보를 보완하고, 리뷰를 적을 수 있어요.',
      '숨은 맛집을 찾아내요!',
    ]);
  });
});
