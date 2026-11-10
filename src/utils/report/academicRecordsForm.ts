/** [학업정보 > 수강 편집] 서버 이력 변환과 저장 입력 검증 */
import { ALLOWED_GRADES } from '@/constants/report/academicRecords';
import type { TEditSemester } from '@/types/report/academicRecordsForm';
import type { TSemesterCourses } from '@/types/report/TGetUserReports';
import type { TPatchReportRequest } from '@/types/report/TPatchReport';
import type { TValidationResult } from '@/types/validation';

// 서버 수강 이력을 편집용 형태로 변환한다.
// id는 위치 기반이라 같은 데이터면 항상 같은 값이 나온다. (보기 모드에서 매 렌더 새로 만들어도 안전)
export const toEditSemesters = (courses: TSemesterCourses[]): TEditSemester[] =>
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

export const buildCourseUpdate = (drafts: TEditSemester[]): TValidationResult<TPatchReportRequest> => {
  if (drafts.some((semester) => semester.courses.length > 0 && !semester.name.trim())) {
    return { ok: false, error: '학기 이름을 입력해주세요.' };
  }

  const flattened = drafts.flatMap((semester) =>
    semester.courses.map((course) => ({ semester: semester.name.trim(), course })),
  );
  // 전체를 비울 수는 없다. (서버 @NotEmpty)
  if (flattened.length === 0) {
    return { ok: false, error: '최소 1개의 수강 이력이 필요해요.' };
  }

  // 필수항목(이수구분·학수번호·교과목명·성적) 채움, 학점 0 이상, 성적은 허용 enum. (이수영역은 선택)
  const isValid = flattened.every(({ course }) => {
    const grade = course.grade.trim().toUpperCase();
    const filled = course.category.trim() && course.courseCode.trim() && course.courseName.trim() && grade;
    return (
      filled &&
      /^[A-Z0-9]{1,8}$/.test(course.courseCode.trim().toUpperCase()) &&
      Number.isInteger(course.credits) &&
      course.credits >= 0 &&
      ALLOWED_GRADES.includes(grade)
    );
  });
  if (!isValid) {
    return { ok: false, error: '모든 항목을 올바르게 입력해주세요. (성적은 A+·B0·P 등)' };
  }

  const courses = flattened.map(({ semester, course }) => {
    const trimmedArea = course.area.trim();
    return {
      semester,
      courseType: course.category.trim(),
      // 이수 영역은 선택 값이라 비어 있으면 키 자체를 보내지 않는다.
      ...(trimmedArea ? { areaName: trimmedArea } : {}),
      courseCode: course.courseCode.trim().toUpperCase(),
      courseName: course.courseName.trim(),
      credits: course.credits,
      grade: course.grade.trim().toUpperCase(),
      retake: course.retake === 'O',
    };
  });

  return { ok: true, value: { courses } };
};
