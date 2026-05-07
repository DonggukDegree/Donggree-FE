import { type ReactNode, useState } from 'react';

interface IDepartmentToggleProps {
  label: string;
  children: ReactNode;
}

export default function DepartmentToggle({ label, children }: IDepartmentToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full border border-coolgray-30 text-coolgray-90 py-5 cursor-pointer flex items-center justify-center hover:border-primary-60 transition-colors duration-300"
      >
        <h3 className="text-heading-5">{label}</h3>
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight: isOpen ? '500px' : '0px' }}
      >
        {children}
      </div>
    </div>
  );
}
