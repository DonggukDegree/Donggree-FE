/**
 * [공용] 입력 요소 스타일 단일 소스
 * input·select·textarea는 서로 다른 태그라 하나의 컴포넌트로 묶을 수 없어서,
 * 생김새만이라도 어긋나지 않도록 클래스 문자열을 여기 모아 두고 모든 화면이 이것만 쓴다.
 */

// 학생 화면 기본 입력(TextField)의 입력칸 스타일.
export const INPUT_CLASS =
  'w-full px-4 py-3 rounded-lg bg-white border text-body-m placeholder:text-coolgray-60 outline-none disabled:bg-coolgray-10 disabled:text-coolgray-60 disabled:cursor-not-allowed';

// 관리자 폼/필터의 기본 입력 스타일에서 테두리 '색'만 뺀 것.
// 테두리 색을 상황(기본/에러)에 따라 갈아끼워야 하는 곳에서 쓴다. Tailwind에서 같은 속성 클래스가
// 두 개 붙으면 어느 쪽이 이길지 보장되지 않으므로, 색은 항상 한 번만 붙도록 분리해 둔다.
export const ADMIN_INPUT_BASE_CLASS =
  'w-full rounded-lg border bg-white px-3 py-2 text-body-s text-coolgray-90 outline-none placeholder:text-coolgray-60 focus:border-primary-60 disabled:bg-coolgray-10 disabled:text-coolgray-60 disabled:cursor-not-allowed';

// 관리자 폼/필터의 기본 입력 스타일. (input·select·textarea 공통)
export const ADMIN_INPUT_CLASS = `${ADMIN_INPUT_BASE_CLASS} border-coolgray-20`;

// 한 줄에 라벨+컨트롤을 좁게 배치하는 컴팩트 입력 스타일. (너비 w-* 는 사용처에서 덧붙인다)
export const ADMIN_COMPACT_INPUT_CLASS =
  'rounded-lg border border-coolgray-20 bg-white px-2 py-1.5 text-body-s text-coolgray-90 outline-none placeholder:text-coolgray-60 focus:border-primary-60 disabled:bg-coolgray-10 disabled:text-coolgray-60 disabled:cursor-not-allowed';

// 네이티브 화살표를 숨긴 select에 커스텀 꺽쇠를 겹칠 때 함께 붙이는 스타일.
export const SELECT_RESET_CLASS = 'appearance-none pr-8';
