/** [동글맵 > 리뷰] 리뷰 영역의 내 리뷰·목록·탈퇴 회원·숨김·더보기 표시 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlaceReviewSection from '@/components/map/placeReviewSection';
import type { TPlaceDetail, TPlaceReview } from '@/types/place/TPlace';

const state = vi.hoisted(() => ({
  reviews: [] as TPlaceReview[],
  myReview: null as TPlaceReview | null,
  hasNextPage: false,
}));

vi.mock('@/hooks/place/usePlaceReviews', () => ({
  default: () => ({
    reviews: state.reviews,
    myReview: state.myReview,
    isPending: false,
    isError: false,
    hasNextPage: state.hasNextPage,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  }),
}));
vi.mock('@/hooks/user/useUserInfo', () => ({
  default: () => ({ data: { identityVerified: false, schoolEmailVerified: true } }),
}));

const place = {
  id: 1,
  name: '동국반점',
  category: 'RESTAURANT',
  subCategory: 'CHINESE',
  reviewCount: 2,
  averageRating: 3.1,
} as TPlaceDetail;

const review = (id: number, overrides: Partial<TPlaceReview> = {}): TPlaceReview => ({
  id,
  rating: 4,
  content: '짜장면이 맛있고 양이 많아요.',
  createdAt: '2026-11-12T18:00:00',
  updatedAt: '2026-11-12T18:00:00',
  author: { nickname: '김아코', profileUrl: null },
  mine: false,
  hidden: false,
  ...overrides,
});

const render = () => renderToStaticMarkup(<PlaceReviewSection place={place} />);

describe('리뷰 영역', () => {
  beforeEach(() => {
    state.reviews = [];
    state.myReview = null;
    state.hasNextPage = false;
  });

  it('리뷰가 없으면 첫 리뷰 안내와 리뷰 쓰기 버튼', () => {
    const html = render();
    expect(html).toContain('아직 리뷰가 없어요. 첫 리뷰를 남겨주세요.');
    expect(html).toContain('리뷰 쓰기');
  });

  it('다른 회원 리뷰는 기본 아바타·닉네임·별점·신고, 탈퇴 작성자는 탈퇴한 회원', () => {
    state.reviews = [review(2), review(1, { author: { nickname: null, profileUrl: null }, rating: 2 })];
    const html = render();
    expect(html).toContain('김아코');
    expect(html).toContain('탈퇴한 회원');
    expect(html).toContain('aria-label="별점 4점"');
    expect(html).toContain('aria-label="별점 2점"');
    expect(html.match(/<svg/g)?.length).toBeGreaterThanOrEqual(4);
    expect(html.match(/>신고<\/button>/g)).toHaveLength(2);
    expect(html).not.toContain('<img');
  });

  it('내 리뷰는 맨 위에 수정·삭제와 함께 두고 목록에서 빼며, 리뷰 쓰기 버튼은 숨김', () => {
    const mine = review(3, { mine: true, author: { nickname: '동그리', profileUrl: null } });
    state.myReview = mine;
    state.reviews = [mine, review(2)];
    const html = render();
    expect(html).toContain('내 리뷰');
    expect(html).toContain('>수정</button>');
    expect(html).toContain('>삭제</button>');
    expect(html).not.toContain('리뷰 쓰기');
    expect(html.match(/동그리/g)).toHaveLength(1);
    expect(html.match(/>신고<\/button>/g)).toHaveLength(1);
  });

  it('숨겨진 내 리뷰는 안내를 띄우고 수정 없이 삭제만', () => {
    state.myReview = review(3, { mine: true, hidden: true });
    const html = render();
    expect(html).toContain('신고가 누적되어 숨겨진 리뷰예요');
    expect(html).not.toContain('>수정</button>');
    expect(html).toContain('>삭제</button>');
  });

  it('긴 본문은 3줄로 접고 펼치기, 다음 페이지가 있으면 꺾쇠가 붙은 넓은 더보기 버튼', () => {
    state.reviews = [review(2, { content: '가'.repeat(120) })];
    state.hasNextPage = true;
    const html = render();
    expect(html).toContain('line-clamp-3');
    expect(html).toContain('펼치기');
    expect(html).toMatch(
      /<button[^>]*w-full[^>]*rounded-lg border border-coolgray-30[^>]*><svg[^>]*>.*?<\/svg>리뷰 더보기<\/button>/,
    );
  });

  it('처음에는 리뷰 5개만 보이고 더 받아 둔 리뷰가 있으면 더보기', () => {
    state.reviews = Array.from({ length: 10 }, (_, index) =>
      review(100 - index, { content: `리뷰 본문 ${index}번째입니다` }),
    );
    const html = render();
    expect(html.match(/리뷰 본문 \d번째입니다/g)).toHaveLength(5);
    expect(html).toContain('리뷰 더보기');
  });

  it('제목은 리뷰와 개수만, 평균 별점은 오른쪽 끝에 표시', () => {
    const html = render();
    expect(html).toMatch(
      /리뷰 <span class="text-coolgray-60">2<\/span><\/h3><div class="ml-auto flex items-center gap-2">/,
    );
    expect(html).toMatch(
      /<span class="text-button-m text-primary-60"><span aria-hidden="true">★<\/span><span class="sr-only">평균 별점 <\/span>3\.1<\/span>/,
    );
  });
});
