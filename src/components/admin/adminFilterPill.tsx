interface IAdminFilterPillProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

export default function AdminFilterPill({ active, label, onClick }: IAdminFilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-button-s transition-colors ${
        active
          ? 'border-primary-60 bg-primary-30 text-primary-90'
          : 'border-coolgray-20 bg-white text-coolgray-60 hover:border-primary-60 hover:text-primary-60'
      }`}
    >
      {label}
    </button>
  );
}
