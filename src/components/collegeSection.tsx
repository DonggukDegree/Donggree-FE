import DepartmentToggle from '@/components/departmentToggle';
import useInView from '@/hooks/useInView';

interface IDepartment {
  name: string;
  admissionYear: number;
}

interface ICollegeSectionProps {
  collegeName: string;
  departments: IDepartment[];
}

export default function CollegeSection({ collegeName, departments }: ICollegeSectionProps) {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      className={`w-full flex flex-col gap-6 px-8 py-10 border-b border-coolgray-20 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <h2 className="text-heading-4">{collegeName}</h2>
      <div className="w-full flex flex-col items-center gap-4">
        {departments.map((dept) => (
          <DepartmentToggle
            key={`${dept.name}-${dept.admissionYear}`}
            label={`${dept.name} ${dept.admissionYear}학번 졸업기준표`}
          >
            <div className="w-full h-80 border border-coolgray-20 border-t-0 flex items-center justify-center bg-coolgray-10">
              <span className="text-body-m text-coolgray-60">졸업기준표 이미지 자리</span>
            </div>
          </DepartmentToggle>
        ))}
      </div>
    </div>
  );
}
