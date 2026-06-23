import type { TAdminCourseClassification } from '@/types/admin/TGetCourseClassifications';
import { COURSE_LABEL } from '@/types/course';

interface ICourseClassificationTableProps {
  courses: TAdminCourseClassification[];
  selectedIds: Set<number>;
  isLoading: boolean;
  isError: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (courseId: number, checked: boolean) => void;
}

const HEADER_CELL_CLASS = 'px-4 py-3 text-left text-body-s font-semibold text-primary-90';
const BODY_CELL_CLASS = 'px-4 py-4 text-body-s text-coolgray-90';

export default function CourseClassificationTable({
  courses,
  selectedIds,
  isLoading,
  isError,
  onToggleAll,
  onToggleRow,
}: ICourseClassificationTableProps) {
  // 현재 목록(courses)의 모든 과목이 선택되었는지 검사한다.
  // selectedIds.size 비교 대신 courses.every를 사용해, selectedIds에 현재 목록에 없는 ID가 섞여 있어도 정확히 판정한다.
  const allChecked = courses.length > 0 && courses.every((course) => selectedIds.has(course.id));

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-5 text-coolgray-90">과목 분류 목록</h2>
          <p className="mt-1 text-body-s text-coolgray-60">조회 결과 {courses.length.toLocaleString()}건</p>
        </div>
        <span className="rounded-full bg-primary-30 px-4 py-2 text-button-s text-primary-90">
          선택 {selectedIds.size.toLocaleString()}건
        </span>
      </div>

      <div className="max-h-[590px] overflow-auto rounded-xl border border-coolgray-10">
        <table className="min-w-[980px] w-full table-fixed border-collapse bg-white">
          <colgroup>
            <col className="w-12" />
            <col className="w-[13%]" />
            {/* 표시명 너비를 넓히고, 세부분류·학문영역 너비를 줄였다. */}
            <col className="w-[22%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[17%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-primary-30">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allChecked}
                  disabled={courses.length === 0}
                  onChange={(event) => onToggleAll(event.target.checked)}
                  className="h-4 w-4 accent-primary-60"
                  aria-label="전체 과목 선택"
                />
              </th>
              <th className={HEADER_CELL_CLASS}>과목코드</th>
              <th className={HEADER_CELL_CLASS}>표시명</th>
              <th className={HEADER_CELL_CLASS}>적용년도</th>
              <th className={HEADER_CELL_CLASS}>이수구분</th>
              <th className={HEADER_CELL_CLASS}>이수 영역</th>
              <th className={HEADER_CELL_CLASS}>세부분류</th>
              <th className={HEADER_CELL_CLASS}>학문영역</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-body-m text-coolgray-60">
                  과목 분류를 불러오는 중입니다.
                </td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-body-m text-alert">
                  과목 분류 정보를 불러오지 못했어요.
                </td>
              </tr>
            )}
            {!isLoading && !isError && courses.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-body-m text-coolgray-60">
                  조건에 맞는 과목 분류가 없습니다.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              courses.map((course) => (
                <tr
                  key={course.id}
                  className={`border-t border-coolgray-10 transition-colors ${
                    selectedIds.has(course.id) ? 'bg-primary-30/70' : 'hover:bg-coolgray-10/50'
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(course.id)}
                      onChange={(event) => onToggleRow(course.id, event.target.checked)}
                      className="h-4 w-4 accent-primary-60"
                      aria-label={`${course.courseCode} 선택`}
                    />
                  </td>
                  <td className={`${BODY_CELL_CLASS} font-semibold`}>{course.courseCode}</td>
                  <td className={BODY_CELL_CLASS}>
                    <span className="block truncate">{course.tag ?? '-'}</span>
                  </td>
                  <td className={BODY_CELL_CLASS}>
                    {course.studentYearStart} - {course.studentYearEnd}
                  </td>
                  <td className={BODY_CELL_CLASS}>{COURSE_LABEL[course.courseType]}</td>
                  <td className={BODY_CELL_CLASS}>{course.areaName ?? '-'}</td>
                  <td className={BODY_CELL_CLASS}>{course.subCategory ?? '-'}</td>
                  <td className={BODY_CELL_CLASS}>{course.subjectDomain ?? '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
