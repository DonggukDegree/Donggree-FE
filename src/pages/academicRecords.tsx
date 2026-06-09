import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Edit from '@/assets/icons/edit.svg?react';
import Button from '@/components/common/button';
import Loading from '@/components/common/loading';
import Select from '@/components/common/select';
import TextField from '@/components/common/textField';
import Toggle from '@/components/common/toggle';
import useUpdateCourses from '@/hooks/report/useUpdateCourses';
import useUserReports from '@/hooks/report/useUserReports';
import useInView from '@/hooks/useInView';
import NotFound from '@/pages/notFound';
import { formatDateTime } from '@/utils/date';
import { getErrorStatus } from '@/utils/error';

// 수강 이력의 성적 허용값 (서버 enum과 동일)
const ALLOWED_GRADES = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'P', 'NP'];

// 수강 이력의 이수구분 선택지 (고정 목록)
const COURSE_TYPE_OPTIONS = ['전공', '공교', '일교', '학기', '자선'];

// 편집용 수강 이력
interface ICourse {
  category: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  area: string;
  retake: string;
}

interface IEditCourse extends ICourse {
  id: number; // React key 및 식별용 클라이언트 id (서버 id는 치환 시 재부여되므로 사용하지 않음)
}

// 학기 그룹 (학기 이름도 편집 가능)
interface IEditSemester {
  id: number;
  name: string;
  courses: IEditCourse[];
}

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
  // 컨테이너 전체에 페이드인을 걸기 때문에, 수강 내역이 많아 화면보다 길어지면
  // 기본 threshold(0.2)로는 한 번에 20%가 안 보여 영영 켜지지 않는다. 조금이라도 보이면 켜지도록 0으로 둔다.
  const [ref, isInView] = useInView(0);
  const [editMode, setEditMode] = useState(false); // false: 읽기 전용 보기, true: 편집
  const [semesters, setSemesters] = useState<IEditSemester[]>([]);
  const seededRef = useRef(false);
  const nextId = useRef(0);
  const { data, isPending, isError, error } = useUserReports();
  const { mutate: updateCourses, isPending: isSaving } = useUpdateCourses();

  // 조회 데이터로 편집 상태를 한 번 초기화한다. (이미 채웠으면 사용자의 편집을 덮어쓰지 않음)
  // 보기 모드에서는 항상 최신 서버 데이터와 동기화하고(백그라운드 리페치 반영),
  // 편집 모드에서는 사용자의 입력을 덮어쓰지 않도록 진입 시 최초 1회만 시드한다.
  // 저장하지 않고 편집을 끄면 보기 모드 동기화로 수정 사항이 자연스럽게 취소된다.
  // 로딩→콘텐츠 전환 시 빈 표가 잠깐 보이지 않도록 페인트 전(useLayoutEffect)에 시드한다.
  useLayoutEffect(() => {
    if (!data) return;
    // 편집 모드에서 이미 시드를 마쳤다면 사용자의 편집을 보존한다.
    if (editMode && seededRef.current) return;
    seededRef.current = editMode;
    setSemesters(
      data.courses.map((semester) => ({
        id: nextId.current++,
        name: semester.semester,
        courses: semester.records.map((record) => ({
          id: nextId.current++,
          category: record.courseType,
          courseCode: record.courseCode,
          courseName: record.courseName,
          credits: record.credits,
          grade: record.grade,
          area: record.areaName ?? '',
          retake: record.retake ? 'O' : 'X',
        })),
      })),
    );
  }, [data, editMode]);

  const hasCourses = semesters.some((semester) => semester.courses.length > 0);

  // 학기 추가/삭제/이름 변경
  const handleAddSemester = () => {
    setSemesters((prev) => [...prev, { id: nextId.current++, name: '', courses: [] }]);
  };

  const handleDeleteSemester = (semesterId: number) => {
    setSemesters((prev) => prev.filter((semester) => semester.id !== semesterId));
  };

  const handleSemesterNameChange = (semesterId: number, name: string) => {
    setSemesters((prev) => prev.map((semester) => (semester.id === semesterId ? { ...semester, name } : semester)));
  };

  // 학기 내 수강 행 추가/삭제/변경
  const handleAddCourse = (semesterId: number) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? { ...semester, courses: [...semester.courses, { ...EMPTY_COURSE, id: nextId.current++ }] }
          : semester,
      ),
    );
  };

  const handleDeleteCourse = (semesterId: number, courseId: number) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? { ...semester, courses: semester.courses.filter((course) => course.id !== courseId) }
          : semester,
      ),
    );
  };

  const handleCourseChange = (semesterId: number, courseId: number, field: keyof ICourse, value: string | number) => {
    const parsed = field === 'credits' ? Number(value) || 0 : value;
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: semester.courses.map((course) =>
                course.id === courseId ? { ...course, [field]: parsed } : course,
              ),
            }
          : semester,
      ),
    );
  };

  // "수정하기": 전체 수강 이력을 검증한 뒤 통째로 치환(PATCH)한다.
  const handleSubmit = () => {
    if (semesters.some((semester) => semester.courses.length > 0 && !semester.name.trim())) {
      toast.error('학기 이름을 입력해주세요.');
      return;
    }

    const flattened = semesters.flatMap((semester) =>
      semester.courses.map((course) => ({ semester: semester.name.trim(), course })),
    );
    // 전체를 비울 수는 없다(서버 @NotEmpty).
    if (flattened.length === 0) {
      toast.error('최소 1개의 수강 이력이 필요해요.');
      return;
    }

    // 클라이언트 검증: 필수항목(이수구분·학수번호·교과목명·성적) 채움, 학점 0 이상, 성적 enum (이수영역은 선택)
    const isValid = flattened.every(({ course }) => {
      const grade = course.grade.trim().toUpperCase();
      const filled = course.category.trim() && course.courseCode.trim() && course.courseName.trim() && grade;
      return filled && course.credits >= 0 && ALLOWED_GRADES.includes(grade);
    });
    if (!isValid) {
      toast.error('모든 항목을 올바르게 입력해주세요. (성적은 A+·B0·P 등)');
      return;
    }

    const courses = flattened.map(({ semester, course }) => {
      const trimmedArea = course.area.trim();
      return {
        semester,
        courseType: course.category.trim(),
        ...(trimmedArea ? { areaName: trimmedArea } : {}),
        courseCode: course.courseCode.trim(),
        courseName: course.courseName.trim(),
        credits: course.credits,
        grade: course.grade.trim().toUpperCase(),
        retake: course.retake === 'O',
      };
    });

    // 성공 시 보기 모드로 돌아간다. (시딩 effect가 보기 모드에서 재조회된 최신 데이터로 폼을 다시 채운다)
    updateCourses(
      { courses },
      {
        onSuccess: () => {
          setEditMode(false);
        },
      },
    );
  };

  // 편집 모드의 수강 행 셀: 이수구분·성적은 드롭다운, 재수강은 체크박스, 나머지는 텍스트 입력.
  const renderEditField = (
    col: (typeof COLUMNS)[number],
    course: IEditCourse,
    onFieldChange: (field: keyof ICourse, value: string) => void,
  ) => {
    if (col.key === 'retake') {
      return (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={course.retake === 'O'}
            disabled={isSaving}
            onChange={(e) => onFieldChange('retake', e.target.checked ? 'O' : 'X')}
            className="h-4 w-4 accent-primary-60"
          />
        </div>
      );
    }
    if (col.key === 'category') {
      return (
        <Select
          options={COURSE_TYPE_OPTIONS}
          placeholder="이수 구분"
          value={course.category}
          disabled={isSaving}
          onChange={(e) => onFieldChange('category', e.target.value)}
        />
      );
    }
    if (col.key === 'grade') {
      return (
        <Select
          options={ALLOWED_GRADES}
          placeholder="성적"
          value={course.grade}
          disabled={isSaving}
          onChange={(e) => onFieldChange('grade', e.target.value)}
        />
      );
    }
    return (
      <TextField
        className="!w-full"
        placeholder={col.label}
        value={course[col.key]}
        disabled={isSaving}
        onChange={(e) => onFieldChange(col.key, e.target.value)}
        {...(col.key === 'credits' && { type: 'number', min: 0 })}
      />
    );
  };

  // 보기 모드의 수강 행 셀: 고정 텍스트(재수강만 비활성 체크박스).
  const renderViewField = (col: (typeof COLUMNS)[number], course: IEditCourse) => {
    if (col.key === 'retake') {
      return <input type="checkbox" checked={course.retake === 'O'} disabled className="h-4 w-4 accent-primary-60" />;
    }
    return course[col.key];
  };

  // 성적표 조회 상태 처리: 로딩 → 공용 Loading, 미업로드(404) → 업로드 유도, 그 외 에러 → NotFound
  if (isPending) {
    return <Loading />;
  }
  if (isError) {
    if (getErrorStatus(error) === 404) {
      return <Navigate to="/upload" replace />;
    }
    return <NotFound />;
  }

  const { meta } = data;

  // 상단 기본 정보 항목(고정 텍스트). 지정 순서, 부전공/복수전공·단과대학은 값이 있을 때만 표시한다.
  const basicInfoItems: { label: string; value: string | number }[] = [
    { label: '교육과정 적용년도', value: meta.admissionYear },
  ];
  if (meta.collegeName) basicInfoItems.push({ label: '단과대학', value: meta.collegeName });
  basicInfoItems.push({ label: '학과', value: meta.department });
  if (meta.subMajor1) basicInfoItems.push({ label: '부전공1', value: meta.subMajor1 });
  if (meta.subMajor2) basicInfoItems.push({ label: '부전공2', value: meta.subMajor2 });
  if (meta.dualMajor1) basicInfoItems.push({ label: '복수전공1', value: meta.dualMajor1 });
  if (meta.dualMajor2) basicInfoItems.push({ label: '복수전공2', value: meta.dualMajor2 });
  basicInfoItems.push({ label: '학적 상태', value: meta.academicStatus });
  basicInfoItems.push({ label: '이수 학기', value: `${meta.completedSemesters}학기` });
  basicInfoItems.push({ label: '총 취득학점', value: `${meta.totalCredits}학점` });
  basicInfoItems.push({ label: '평점 평균', value: meta.gpa });

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center gap-12 p-20 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-12">
        <Edit className="w-20 h-20" />
        <div className="flex flex-col items-center gap-7">
          <p className="text-heading-2 text-coolgray-90">내 학업 정보 관리</p>
          {/* 보기/편집 토글 스위치 */}
          <div className="flex items-center gap-2">
            <span className="text-body-m text-primary-60">편집 모드</span>
            <Toggle checked={editMode} onChange={setEditMode} />
          </div>
        </div>
      </div>

      {/* 최초 업로드일 / 마지막 수정일 (오른쪽 정렬) */}
      <div className="w-full max-w-5xl flex flex-col items-end">
        <p className="text-body-m text-coolgray-60">최초 업로드일: {formatDateTime(meta.createdAt)}</p>
        <p className="text-body-m text-coolgray-60">마지막 수정일: {formatDateTime(meta.updatedAt)}</p>
      </div>

      {/* 기본 정보 (고정 텍스트) */}
      <div className={sectionStyles}>
        <p className="text-heading-3 text-coolgray-90">기본 정보</p>
        {/* 블록은 중앙 정렬, 값(2열)은 같은 시작점에서 왼쪽 정렬 */}
        <div className="grid grid-cols-[auto_auto] gap-x-40 gap-y-3">
          {basicInfoItems.map(({ label, value }) => (
            <Fragment key={label}>
              <span className="text-heading-5 text-coolgray-90">{label}</span>
              <span className="text-body-l text-coolgray-90">{value}</span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* 학기별 수강 내역 (보기: 고정 텍스트 / 편집: 입력) */}
      {semesters.map((semester) => (
        <div key={semester.id} className={sectionStyles}>
          {editMode ? (
            <div className="flex items-center gap-3">
              <TextField
                placeholder="학기 (예: 2024-1)"
                value={semester.name}
                disabled={isSaving}
                onChange={(e) => handleSemesterNameChange(semester.id, e.target.value)}
              />
              <button
                type="button"
                disabled={isSaving}
                className="cursor-pointer text-body-m text-coolgray-60 hover:text-primary-60 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handleDeleteSemester(semester.id)}
              >
                ✕
              </button>
            </div>
          ) : (
            <p className="text-heading-3 text-coolgray-90">{semester.name}</p>
          )}
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

            {/* 수강 행 */}
            {semester.courses.map((course) => (
              <div key={course.id} className="flex w-full items-center border-b border-coolgray-10 py-2">
                {COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    className={editMode ? `${col.width} px-1` : `${col.width} text-center text-body-l text-coolgray-90`}
                  >
                    {editMode
                      ? renderEditField(col, course, (field, value) =>
                          handleCourseChange(semester.id, course.id, field, value),
                        )
                      : renderViewField(col, course)}
                  </div>
                ))}
                <div className="flex w-[4%] justify-center">
                  {editMode && (
                    <button
                      type="button"
                      disabled={isSaving}
                      className="cursor-pointer text-body-m text-coolgray-60 hover:text-primary-60 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => handleDeleteCourse(semester.id, course.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 추가 버튼 (편집 모드) */}
            {editMode && (
              <div className="flex w-full justify-end py-3">
                <Button
                  variant={isSaving ? 'disabled' : 'outlined'}
                  className="w-16 h-10"
                  disabled={isSaving}
                  onClick={() => handleAddCourse(semester.id)}
                >
                  추가
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 새로운 학기 추가 (편집 모드, 오른쪽 정렬) */}
      {editMode && (
        <div className="w-full max-w-5xl flex justify-end">
          <Button
            variant={isSaving ? 'disabled' : 'primary'}
            className="w-40"
            disabled={isSaving}
            onClick={handleAddSemester}
          >
            새로운 학기 추가
          </Button>
        </div>
      )}

      {editMode && (
        <p className="text-body-l text-coolgray-60">
          *수정한 정보를 기준으로 졸업 판정이 진행되므로, 추가한 수강 이력이 부정확한 경우 정확한 판정이 어려울 수
          있습니다.
        </p>
      )}

      <div className="flex gap-4">
        <Button variant="outlined" className="w-40" onClick={() => navigate('/upload')}>
          PDF 새로 업로드하기
        </Button>
        {editMode && (
          <Button
            variant={hasCourses && !isSaving ? 'primary' : 'disabled'}
            className="w-40"
            disabled={!hasCourses || isSaving}
            onClick={handleSubmit}
          >
            수정하기
          </Button>
        )}
      </div>
    </div>
  );
}
