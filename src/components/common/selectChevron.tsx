/**
 * [공용] 드롭다운 꺽쇠 아이콘
 * 네이티브 select 화살표를 숨긴(appearance-none) 자리에 겹쳐 그리는 장식용 아이콘.
 * 부모에 relative를, select에 pr-8을 주고 이 컴포넌트를 형제로 두면 칸 안쪽 오른쪽에 붙는다.
 * 클릭이 select로 그대로 전달되도록 pointer-events-none 이다.
 */
export default function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coolgray-60"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
