/**
 * [공용] 스위치 토글
 * 학업 정보 관리의 편집 모드 전환, 관리자 화면의 모드 전환 등 on/off 하나를 다루는 곳에 쓴다.
 */
interface IToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

// iOS 스타일 토글 스위치. 켜짐=primary, 꺼짐=회색, 흰 손잡이가 슬라이드한다.
export default function Toggle({ checked, onChange }: IToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? 'bg-primary-60' : 'bg-coolgray-30'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
