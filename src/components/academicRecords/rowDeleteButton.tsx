/**
 * [내 학업 정보 관리] 행 삭제 아이콘 버튼
 * 편집 모드에서 학기 또는 수강 이력 한 줄을 지울 때 쓰는 작은 원형 버튼.
 * 텍스트 ✕ 대신 아이콘을 써서 표 안에서 세로 정렬이 흔들리지 않게 한다.
 */
interface IRowDeleteButtonProps {
  label: string; // 스크린리더용 설명 (예: '수강 이력 삭제')
  disabled: boolean;
  onClick: () => void;
}

export default function RowDeleteButton({ label, disabled, onClick }: IRowDeleteButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-coolgray-60 transition-colors hover:bg-coolgray-10 hover:text-alert disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-coolgray-60"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 2l10 10M12 2L2 12" strokeLinecap="round" />
      </svg>
    </button>
  );
}
