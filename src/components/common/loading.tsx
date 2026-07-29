/**
 * [공용] 로딩 표시
 * - variant 'page'(기본): 화면 전체를 채우는 로딩. 라우트 게이트·페이지 진입 대기에 쓴다.
 * - variant 'inline'    : 화면 일부(탭 패널·카드 안)만 갱신될 때 쓰는 작은 로딩.
 * 두 경우 모두 같은 스피너를 써서 로딩 표현이 화면마다 달라지지 않게 한다.
 */
interface ILoadingProps {
  variant?: 'page' | 'inline';
}

export default function Loading({ variant = 'page' }: ILoadingProps) {
  const isPage = variant === 'page';

  return (
    <div
      className={`w-full flex flex-col items-center justify-center ${isPage ? 'flex-1 gap-20' : 'gap-4 py-10'}`}
      role="status"
      aria-label="불러오는 중"
    >
      <svg className={`animate-spin ${isPage ? 'h-20 w-20' : 'h-10 w-10'}`} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" className="stroke-primary-30" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r="36"
          className="stroke-primary-60"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="80 226"
        />
      </svg>
      <p className={isPage ? 'text-heading-2 text-primary-60' : 'text-body-m text-coolgray-60'}>
        {isPage ? 'Loading...' : '불러오는 중'}
      </p>
    </div>
  );
}
