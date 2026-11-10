/**
 * [커리큘럼] 학과 토글
 * 커리큘럼 화면의 학과 한 줄. 펼치면 해당 학과의 입학년도별 항목이 보인다.
 */
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
        className="w-full border border-coolgray-30 text-coolgray-90 py-5 px-3 lg:px-0 cursor-pointer flex items-center justify-center hover:border-primary-60 transition-colors duration-300"
      >
        <h3 className="text-heading-6 lg:text-heading-5 max-lg:text-center">{label}</h3>
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
