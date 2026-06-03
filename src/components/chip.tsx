export type TChipVariant = 'satisfied' | 'unsatisfied' | 'selected';

interface IChipProps {
  variant: TChipVariant;
  // 기본 라벨(충족/불충족/선택) 대신 커스텀 텍스트를 쓰고 싶을 때 사용한다.
  label?: string;
}

const CHIP_LABEL: Record<TChipVariant, string> = {
  satisfied: '충족',
  unsatisfied: '불충족',
  selected: '선택',
};

const CHIP_STYLE: Record<TChipVariant, string> = {
  satisfied: 'bg-chip-green-bg text-chip-green',
  unsatisfied: 'bg-chip-red-bg text-chip-red',
  selected: 'bg-coolgray-10 text-coolgray-60',
};

export default function Chip({ variant, label }: IChipProps) {
  return (
    <span className={`text-body-s rounded-[12px] px-3 py-0.5 ${CHIP_STYLE[variant]}`}>
      {label ?? CHIP_LABEL[variant]}
    </span>
  );
}
