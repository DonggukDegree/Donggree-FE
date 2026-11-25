/**
 * [공용] 스켈레톤
 * 목록을 불러오는 동안 자리를 잡아 두는 회색 블록. 천천히 깜빡이며(줄어든 움직임 설정이면 멈춤) 모양은 className으로 정한다.
 */
export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`animate-pulse rounded-md bg-coolgray-10 motion-reduce:animate-none ${className}`} />
  );
}

// 목록 끝 자동 불러오기 표식. 화면 읽기 프로그램에는 불러오는 중이라고 알린다.
export function LoadMoreStatus({ isLoading }: { isLoading: boolean }) {
  return (
    <p role="status" className="sr-only">
      {isLoading ? '목록을 더 불러오는 중이에요' : ''}
    </p>
  );
}
