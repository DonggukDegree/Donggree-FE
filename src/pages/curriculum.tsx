import Folder from '@/assets/icons/folder.svg?react';
import CollegeSection from '@/components/collegeSection';
import useInView from '@/hooks/useInView';

// TODO: API 연동 시 교체
const mockData = [
  {
    collegeName: '소프트웨어융합대학',
    departments: [
      { name: '컴퓨터공학과', admissionYear: 23 },
      { name: 'AI학과', admissionYear: 23 },
      { name: '소프트웨어학과', admissionYear: 24 },
    ],
  },
  {
    collegeName: '경영대학',
    departments: [
      { name: '경영학과', admissionYear: 23 },
      { name: '국제통상학과', admissionYear: 24 },
    ],
  },
  {
    collegeName: '공과대학',
    departments: [
      { name: '전자공학과', admissionYear: 23 },
      { name: '기계공학과', admissionYear: 23 },
    ],
  },
];

export default function Curriculum() {
  const [headerRef, headerInView] = useInView();
  const [footerRef, footerInView] = useInView();

  return (
    <div className="flex flex-col gap-12 px-80 py-20">
      <div
        ref={headerRef}
        className={`flex flex-col items-center gap-12 ${headerInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <Folder className="w-20 h-20" />
        <h1 className="text-heading-2">커리큘럼</h1>
      </div>

      <div className="w-full flex flex-col gap-8 items-center">
        {mockData.map((college) => (
          <CollegeSection
            key={college.collegeName}
            collegeName={college.collegeName}
            departments={college.departments}
          />
        ))}
      </div>

      <p
        ref={footerRef}
        className={`text-body-l text-coolgray-60 ${footerInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        *현재 동그리에서 지원되는 학과의 커리큘럼만 조회 가능합니다.
      </p>
    </div>
  );
}
