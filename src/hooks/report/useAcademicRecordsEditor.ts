/**
 * [내 학업 정보 관리] 수강 이력 편집 컨트롤러 훅
 * 페이지(pages/academicRecords.tsx)의 보기/편집 전환, 편집 중인 학기·수강 행 상태,
 * 저장 전 검증과 PATCH 호출을 담당한다.
 *
 * 상태 설계 메모:
 * 보기 모드에서는 로컬 상태를 두지 않고 서버 데이터를 그대로 변환해 보여 준다.
 * 편집 모드로 "전환하는 순간"에만 서버 데이터를 편집용 초안(drafts)으로 복사하므로,
 * effect로 서버 상태를 로컬에 계속 동기화할 필요가 없다.
 * 저장하지 않고 편집을 끄면 초안을 버리므로 수정 내용이 자연스럽게 취소된다.
 */
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { ALLOWED_GRADES } from '@/constants/report/academicRecords';
import useUpdateCourses from '@/hooks/report/useUpdateCourses';
import type { TGetUserReportsResult, TSemesterCourses } from '@/types/report/TGetUserReports';

// 편집 화면이 다루는 수강 이력 한 줄. 입력 편의를 위해 재수강은 'O'/'X' 문자열로 다룬다.
export type TEditCourse = {
  id: string; // React key 및 식별용 클라이언트 id (서버 id는 치환 시 재부여되므로 쓰지 않는다)
  category: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  area: string;
  retake: 'O' | 'X';
};

// 학기 그룹. 편집 모드에서는 학기 이름도 바꿀 수 있다.
export type TEditSemester = {
  id: string;
  name: string;
  courses: TEditCourse[];
};

const EMPTY_COURSE: Omit<TEditCourse, 'id'> = {
  category: '',
  courseCode: '',
  courseName: '',
  credits: 0,
  grade: '',
  area: '',
  retake: 'X',
};

// 서버 수강 이력을 편집용 형태로 변환한다.
// id는 위치 기반이라 같은 데이터면 항상 같은 값이 나온다. (보기 모드에서 매 렌더 새로 만들어도 안전)
const toEditSemesters = (courses: TSemesterCourses[]): TEditSemester[] =>
  courses.map((semester, semesterIndex) => ({
    id: `semester-${semesterIndex}`,
    name: semester.semester,
    courses: semester.records.map((record, recordIndex) => ({
      id: `course-${semesterIndex}-${recordIndex}`,
      category: record.courseType,
      courseCode: record.courseCode,
      courseName: record.courseName,
      credits: record.credits,
      grade: record.grade,
      area: record.areaName ?? '',
      retake: record.retake ? 'O' : 'X',
    })),
  }));

export default function useAcademicRecordsEditor(data: TGetUserReportsResult) {
  const [editMode, setEditMode] = useState(false);
  // 편집 모드에서만 쓰는 초안. 보기 모드에서는 비워 둔다.
  const [drafts, setDrafts] = useState<TEditSemester[]>([]);
  // 편집 중 새로 추가한 학기·행에 부여할 일련번호. (기존 행의 위치 기반 id와 절대 겹치지 않는다)
  const newRowIndex = useRef(0);
  const { mutate: updateCourses, isPending: isSaving } = useUpdateCourses();

  // 화면에 그릴 목록: 편집 중이면 초안, 아니면 서버 데이터를 변환한 결과.
  const semesters = editMode ? drafts : toEditSemesters(data.courses);
  const hasCourses = semesters.some((semester) => semester.courses.length > 0);

  // 편집 모드 전환. 켤 때 서버 데이터를 초안으로 복사하고, 끌 때 초안을 버린다.
  const changeEditMode = (nextEditMode: boolean) => {
    setDrafts(nextEditMode ? toEditSemesters(data.courses) : []);
    setEditMode(nextEditMode);
  };

  const addSemester = () => {
    setDrafts((prev) => [...prev, { id: `new-semester-${newRowIndex.current++}`, name: '', courses: [] }]);
  };

  const removeSemester = (semesterId: string) => {
    setDrafts((prev) => prev.filter((semester) => semester.id !== semesterId));
  };

  const changeSemesterName = (semesterId: string, name: string) => {
    setDrafts((prev) => prev.map((semester) => (semester.id === semesterId ? { ...semester, name } : semester)));
  };

  const addCourse = (semesterId: string) => {
    setDrafts((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: [...semester.courses, { ...EMPTY_COURSE, id: `new-course-${newRowIndex.current++}` }],
            }
          : semester,
      ),
    );
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setDrafts((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? { ...semester, courses: semester.courses.filter((course) => course.id !== courseId) }
          : semester,
      ),
    );
  };

  const changeCourse = (semesterId: string, courseId: string, field: keyof TEditCourse, value: string | number) => {
    // 학점만 숫자 필드다. 빈 문자열·문자 입력은 0으로 떨어뜨린다.
    const parsed = field === 'credits' ? Number(value) || 0 : value;
    setDrafts((prev) =>
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

  // 저장: 전체 수강 이력을 검증한 뒤 통째로 치환(PATCH)한다.
  const submit = () => {
    if (drafts.some((semester) => semester.courses.length > 0 && !semester.name.trim())) {
      toast.error('학기 이름을 입력해주세요.');
      return;
    }

    const flattened = drafts.flatMap((semester) =>
      semester.courses.map((course) => ({ semester: semester.name.trim(), course })),
    );
    // 전체를 비울 수는 없다. (서버 @NotEmpty)
    if (flattened.length === 0) {
      toast.error('최소 1개의 수강 이력이 필요해요.');
      return;
    }

    // 필수항목(이수구분·학수번호·교과목명·성적) 채움, 학점 0 이상, 성적은 허용 enum. (이수영역은 선택)
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
        // 이수 영역은 선택 값이라 비어 있으면 키 자체를 보내지 않는다.
        ...(trimmedArea ? { areaName: trimmedArea } : {}),
        courseCode: course.courseCode.trim(),
        courseName: course.courseName.trim(),
        credits: course.credits,
        grade: course.grade.trim().toUpperCase(),
        retake: course.retake === 'O',
      };
    });

    updateCourses(
      { courses },
      {
        // 저장에 성공하면 보기 모드로 돌아간다. 무효화된 조회가 최신 데이터를 다시 그린다.
        onSuccess: () => changeEditMode(false),
      },
    );
  };

  return {
    editMode,
    changeEditMode,
    semesters,
    hasCourses,
    isSaving,
    addSemester,
    removeSemester,
    changeSemesterName,
    addCourse,
    removeCourse,
    changeCourse,
    submit,
  };
}
