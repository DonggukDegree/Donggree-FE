type TChipVariant = 'satisfied' | 'unsatisfied' | 'selected';

interface IChipProps {
  variant: TChipVariant;
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

export default function Chip({ variant }: IChipProps) {
  return <span className={`text-body-s rounded-[12px] px-3 py-0.5 ${CHIP_STYLE[variant]}`}>{CHIP_LABEL[variant]}</span>;
}
