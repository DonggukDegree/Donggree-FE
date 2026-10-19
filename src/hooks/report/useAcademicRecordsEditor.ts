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

import useUpdateCourses from '@/hooks/report/useUpdateCourses';
import type { TEditCourse, TEditSemester } from '@/types/report/academicRecordsForm';
import type { TGetUserReportsResult } from '@/types/report/TGetUserReports';
import { trackEvent } from '@/utils/analytics/analytics';
import { buildCourseUpdate, toEditSemesters } from '@/utils/report/academicRecordsForm';

const EMPTY_COURSE: Omit<TEditCourse, 'id'> = {
  category: '',
  courseCode: '',
  courseName: '',
  credits: 0,
  grade: '',
  area: '',
  retake: 'X',
};

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
    const parsed =
      field === 'credits'
        ? Number(value) || 0
        : field === 'courseCode'
          ? String(value)
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '')
              .slice(0, 8)
          : value;
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
    const result = buildCourseUpdate(drafts);
    if (!result.ok) {
      if (result.error) toast.error(result.error);
      trackEvent('error_shown', { source: 'academic_records', code: 'VALIDATION_ERROR', status: 0 });
      return;
    }

    updateCourses(result.value, {
      // 저장에 성공하면 보기 모드로 돌아간다. 무효화된 조회가 최신 데이터를 다시 그린다.
      onSuccess: () => changeEditMode(false),
    });
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
