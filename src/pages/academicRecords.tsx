import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Edit from '@/assets/icons/edit.svg?react';
import Button from '@/components/common/button';
import Loading from '@/components/common/loading';
import TextField from '@/components/common/textField';
import useAddCourses from '@/hooks/report/useAddCourses';
import useUserReports from '@/hooks/report/useUserReports';
import useInView from '@/hooks/useInView';
import NotFound from '@/pages/notFound';
import type { TTranscriptRecord } from '@/types/report/TGetUserReports';

// 추가 수강 이력의 성적 허용값 (서버 enum과 동일)
const ALLOWED_GRADES = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'P', 'NP'];

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

// API 수강 이력(TTranscriptRecord)을 화면 표시용(ICourse + id) 형태로 변환한다.
// 기존 수강 표와 수동 추가 행이 공유하는 ICourse 구조에 맞춘다.
// (이수영역 null → '-', 재수강 boolean → 'O'/'X')
const toDisplayCourse = (record: TTranscriptRecord): IAddedCourse => ({
  id: record.id,
  category: record.courseType,
  courseCode: record.courseCode,
  courseName: record.courseName,
  credits: record.credits,
  grade: record.grade,
  area: record.areaName ?? '-',
  retake: record.retake ? 'O' : 'X',
});

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
  const { data, isPending, isError, error } = useUserReports();
  const { mutate: addCourses, isPending: isAdding } = useAddCourses();

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

  // "수정하기": 학기별로 추가한 행을 검증한 뒤 한 번에 PATCH로 반영한다.
  const handleSubmitCourses = () => {
    // 학기별 추가행을 학기 정보와 함께 평탄화한다.
    const flattened = Object.entries(addedCourses).flatMap(([semester, list]) =>
      list.map((course) => ({ semester, course })),
    );
    if (flattened.length === 0) return;

    // 클라이언트 검증: 필수항목(이수구분·학수번호·교과목명·성적) 채움, 학점 0 이상, 성적 enum (이수영역은 선택)
    const isValid = flattened.every(({ course }) => {
      const grade = course.grade.trim().toUpperCase();
      const filled = course.category.trim() && course.courseCode.trim() && course.courseName.trim() && grade;
      return filled && course.credits >= 0 && ALLOWED_GRADES.includes(grade);
    });
    if (!isValid) {
      toast.error('추가한 과목의 모든 항목을 올바르게 입력해주세요. (성적은 A+·B0·P 등)');
      return;
    }

    const courses = flattened.map(({ semester, course }) => ({
      semester,
      courseType: course.category.trim(),
      ...(course.area.trim() ? { areaName: course.area.trim() } : {}),
      courseCode: course.courseCode.trim(),
      courseName: course.courseName.trim(),
      credits: course.credits,
      grade: course.grade.trim().toUpperCase(),
      retake: course.retake === 'O',
    }));

    // 성공 시 추가행을 비운다. (무효화로 다시 받아온 데이터에서 기존 수강으로 합류)
    addCourses({ courses }, { onSuccess: () => setAddedCourses({}) });
  };

  // 성적표 조회 상태 처리: 로딩 → 공용 Loading, 미업로드(404) → 업로드 유도, 그 외 에러 → NotFound
  if (isPending) {
    return <Loading />;
  }
  if (isError) {
    if (error.response?.status === 404) {
      return <Navigate to="/upload" replace />;
    }
    return <NotFound />;
  }

  const { meta, courses } = data;

  // 상단 기본 정보 항목. 부전공/복수전공은 값이 있을 때만(null이면 숨김) 한 줄씩 추가한다.
  const basicInfoItems: { label: string; value: string | number }[] = [
    { label: '교육과정 적용년도', value: meta.admissionYear },
    { label: '학과', value: meta.department },
  ];
  if (meta.subMajor1) basicInfoItems.push({ label: '부전공1', value: meta.subMajor1 });
  if (meta.subMajor2) basicInfoItems.push({ label: '부전공2', value: meta.subMajor2 });
  if (meta.dualMajor1) basicInfoItems.push({ label: '복수전공1', value: meta.dualMajor1 });
  if (meta.dualMajor2) basicInfoItems.push({ label: '복수전공2', value: meta.dualMajor2 });

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
          {basicInfoItems.map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-heading-5 text-coolgray-90">{label}</span>
              <span className="text-body-l text-coolgray-90">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 학기별 수강 내역 */}
      {courses.map((semesterData) => (
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

            {/* 기존 수강 행 (API 데이터) */}
            {semesterData.records.map(toDisplayCourse).map((course) => (
              <div key={course.id} className="flex w-full items-center border-b border-coolgray-10 py-3">
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
        <Button
          variant={hasNewCourses && !isAdding ? 'primary' : 'disabled'}
          className="w-40"
          disabled={!hasNewCourses || isAdding}
          onClick={handleSubmitCourses}
        >
          수정하기
        </Button>
      </div>
    </div>
  );
}
