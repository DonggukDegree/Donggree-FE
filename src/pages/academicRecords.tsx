import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Edit from '@/assets/icons/edit.svg?react';
import Button from '@/components/common/button';
import TextField from '@/components/common/textField';
import useInView from '@/hooks/useInView';

interface ICourse {
  category: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  area: string;
  retake: string;
}

interface IAddedCourse extends ICourse {
  id: number;
}

interface ISemester {
  semester: string;
  courses: ICourse[];
}

// TODO: API 연동 시 교체
const MOCK_BASIC_INFO = {
  curriculumYear: '2023',
  program: '주간',
  college: '소프트웨어융합대학',
};

const BASIC_INFO_ITEMS = [
  { label: '교육과정 적용년도', value: MOCK_BASIC_INFO.curriculumYear },
  { label: '과정', value: MOCK_BASIC_INFO.program },
  { label: '단과대학', value: MOCK_BASIC_INFO.college },
] as const;

// TODO: API 연동 시 교체
const MOCK_SEMESTERS: ISemester[] = [
  {
    semester: '2023-1',
    courses: [
      {
        category: '공통교양',
        courseCode: 'GED1001',
        courseName: '글쓰기',
        credits: 3,
        grade: 'A+',
        area: '사고와표현',
        retake: 'O',
      },
      {
        category: '공통교양',
        courseCode: 'GED1002',
        courseName: '채플',
        credits: 1,
        grade: 'P',
        area: '채플',
        retake: 'X',
      },
      {
        category: '학문기초',
        courseCode: 'CSE1001',
        courseName: '컴퓨터공학입문',
        credits: 3,
        grade: 'A0',
        area: '1전공',
        retake: 'X',
      },
      {
        category: '전공필수',
        courseCode: 'CSE2001',
        courseName: '자료구조',
        credits: 3,
        grade: 'B+',
        area: '1전공',
        retake: 'X',
      },
    ],
  },
  {
    semester: '2023-2',
    courses: [
      {
        category: '전공필수',
        courseCode: 'CSE2002',
        courseName: '운영체제',
        credits: 3,
        grade: 'A+',
        area: '1전공',
        retake: 'X',
      },
      {
        category: '전공선택',
        courseCode: 'CSE3010',
        courseName: '데이터베이스',
        credits: 3,
        grade: 'A0',
        area: '1전공',
        retake: 'X',
      },
      {
        category: '일반교양',
        courseCode: 'GED2001',
        courseName: '철학입문',
        credits: 3,
        grade: 'B+',
        area: '인문',
        retake: 'X',
      },
    ],
  },
];

type TCourseField = keyof ICourse;

const COLUMNS: readonly { key: TCourseField; label: string; width: string }[] = [
  { key: 'category', label: '이수 구분', width: 'w-[12%]' },
  { key: 'courseCode', label: '학수번호', width: 'w-[14%]' },
  { key: 'courseName', label: '교과목명', width: 'w-[33%]' },
  { key: 'credits', label: '학점', width: 'w-[7%]' },
  { key: 'grade', label: '성적', width: 'w-[7%]' },
  { key: 'area', label: '이수 영역', width: 'w-[16%]' },
  { key: 'retake', label: '재수강', width: 'w-[7%]' },
];

const sectionStyles = 'flex w-full max-w-5xl flex-col items-center gap-5 border-b border-coolgray-20 py-4';

const EMPTY_COURSE: ICourse = {
  category: '',
  courseCode: '',
  courseName: '',
  credits: 0,
  grade: '',
  area: '',
  retake: 'X',
};

export default function AcademicRecords() {
  const navigate = useNavigate();
  const [ref, isInView] = useInView();
  const [addedCourses, setAddedCourses] = useState<Record<string, IAddedCourse[]>>({});
  const nextId = useRef(0);

  const hasNewCourses = Object.values(addedCourses).some((courses) => courses.length > 0);

  const handleAddCourse = (semester: string) => {
    setAddedCourses((prev) => ({
      ...prev,
      [semester]: [...(prev[semester] ?? []), { ...EMPTY_COURSE, id: nextId.current++ }],
    }));
  };

  const handleDeleteCourse = (semester: string, id: number) => {
    setAddedCourses((prev) => ({
      ...prev,
      [semester]: (prev[semester] ?? []).filter((course) => course.id !== id),
    }));
  };

  const handleNewCourseChange = (semester: string, id: number, field: keyof ICourse, value: string | number) => {
    const parsed = field === 'credits' ? Number(value) || 0 : value;
    setAddedCourses((prev) => ({
      ...prev,
      [semester]: (prev[semester] ?? []).map((course) => (course.id === id ? { ...course, [field]: parsed } : course)),
    }));
  };

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center gap-12 p-20 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-12">
        <Edit className="w-20 h-20" />
        <p className="text-heading-2 text-coolgray-90">내 학업 정보 관리</p>
      </div>

      {/* 기본 정보 */}
      <div className={sectionStyles}>
        <p className="text-heading-3 text-coolgray-90">기본 정보</p>
        <div className="flex w-full flex-col gap-3 px-20">
          {BASIC_INFO_ITEMS.map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-heading-5 text-coolgray-90">{label}</span>
              <span className="text-body-l text-coolgray-90">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 학기별 수강 내역 */}
      {MOCK_SEMESTERS.map((semesterData) => (
        <div key={semesterData.semester} className={sectionStyles}>
          <p className="text-heading-3 text-coolgray-90">{semesterData.semester}</p>
          <div className="w-full">
            {/* 헤더 행 */}
            <div className="flex w-full border-b border-coolgray-20 py-3">
              {COLUMNS.map((col) => (
                <div key={col.key} className={`${col.width} text-center text-heading-6 text-coolgray-90`}>
                  {col.label}
                </div>
              ))}
              <div className="w-[4%]" />
            </div>

            {/* 기존 수강 행 */}
            {semesterData.courses.map((course) => (
              <div key={course.courseCode} className="flex w-full items-center border-b border-coolgray-10 py-3">
                {COLUMNS.map((col) => (
                  <div key={col.key} className={`${col.width} text-center text-body-l text-coolgray-90`}>
                    {col.key === 'retake' ? (
                      <input
                        type="checkbox"
                        checked={course.retake === 'O'}
                        disabled
                        className="h-4 w-4 accent-primary-60"
                      />
                    ) : (
                      course[col.key]
                    )}
                  </div>
                ))}
                <div className="w-[4%]" />
              </div>
            ))}

            {/* 추가된 수강 행 */}
            {addedCourses[semesterData.semester]?.map((newCourse) => (
              <div key={newCourse.id} className="flex w-full items-center border-b border-coolgray-10 py-2">
                {COLUMNS.map((col) => (
                  <div key={col.key} className={`${col.width} px-1`}>
                    {col.key === 'retake' ? (
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={newCourse.retake === 'O'}
                          onChange={(e) =>
                            handleNewCourseChange(
                              semesterData.semester,
                              newCourse.id,
                              'retake',
                              e.target.checked ? 'O' : 'X',
                            )
                          }
                          className="h-4 w-4 accent-primary-60"
                        />
                      </div>
                    ) : (
                      <TextField
                        className="!w-full"
                        placeholder={col.label}
                        value={newCourse[col.key]}
                        onChange={(e) =>
                          handleNewCourseChange(semesterData.semester, newCourse.id, col.key, e.target.value)
                        }
                        {...(col.key === 'credits' && { type: 'number', min: 0 })}
                      />
                    )}
                  </div>
                ))}
                <div className="flex w-[4%] justify-center">
                  <button
                    type="button"
                    className="cursor-pointer text-body-m text-coolgray-60 hover:text-primary-60"
                    onClick={() => handleDeleteCourse(semesterData.semester, newCourse.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {/* 추가 버튼 */}
            <div className="flex w-full justify-end py-3">
              <Button variant="outlined" className="w-16 h-10" onClick={() => handleAddCourse(semesterData.semester)}>
                추가
              </Button>
            </div>
          </div>
        </div>
      ))}

      <p className="text-body-l text-coolgray-60">*수정한 정보를 기준으로 졸업 판정이 진행됩니다.</p>

      <div className="flex gap-4">
        <Button variant="outlined" className="w-40" onClick={() => navigate('/upload')}>
          PDF 새로 업로드하기
        </Button>
        <Button variant={hasNewCourses ? 'primary' : 'disabled'} className="w-40">
          수정하기
        </Button>
      </div>
    </div>
  );
}
