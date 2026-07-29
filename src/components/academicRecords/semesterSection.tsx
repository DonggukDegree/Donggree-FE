/**
 * [내 학업 정보 관리] 학기 하나의 수강 내역 섹션
 * 학기 제목(편집 모드에서는 학기명 입력 + 학기 삭제) 아래에 열 헤더와 수강 이력 표를 그린다.
 * 편집 모드에서는 표 아래에 '추가' 버튼이 붙어 이 학기에 빈 행을 넣을 수 있다.
 * 행 자체는 CourseRow가 그리고, 이 컴포넌트는 학기 단위 구조와 헤더만 담당한다.
 */
import CourseRow from '@/components/academicRecords/courseRow';
import RowDeleteButton from '@/components/academicRecords/rowDeleteButton';
import Button from '@/components/common/button';
import TextField from '@/components/common/textField';
import { ACTION_COLUMN_WIDTH, COLUMNS, type TCourseField } from '@/constants/report/academicRecords';
import type { TEditSemester } from '@/hooks/report/useAcademicRecordsEditor';

interface ISemesterSectionProps {
  semester: TEditSemester;
  editMode: boolean;
  isSaving: boolean;
  className?: string;
  onNameChange: (name: string) => void;
  onRemoveSemester: () => void;
  onAddCourse: () => void;
  onCourseChange: (courseId: string, field: TCourseField, value: string | number) => void;
  onRemoveCourse: (courseId: string) => void;
}

export default function SemesterSection({
  semester,
  editMode,
  isSaving,
  className = '',
  onNameChange,
  onRemoveSemester,
  onAddCourse,
  onCourseChange,
  onRemoveCourse,
}: ISemesterSectionProps) {
  return (
    <div className={className}>
      {editMode ? (
        <div className="flex items-center gap-3">
          <TextField
            placeholder="학기 (예: 2024-1)"
            value={semester.name}
            disabled={isSaving}
            onChange={(event) => onNameChange(event.target.value)}
          />
          <RowDeleteButton label="학기 삭제" disabled={isSaving} onClick={onRemoveSemester} />
        </div>
      ) : (
        <p className="text-heading-3 text-coolgray-90">{semester.name}</p>
      )}

      <div className="w-full">
        {/* 열 헤더. 마지막 빈 칸은 각 행의 삭제 버튼 자리와 폭을 맞추기 위한 것이다. */}
        <div className="flex w-full border-b border-coolgray-20 py-3">
          {COLUMNS.map((column) => (
            <div key={column.key} className={`${column.width} text-center text-heading-6 text-coolgray-90`}>
              {column.label}
            </div>
          ))}
          <div className={ACTION_COLUMN_WIDTH} />
        </div>

        {semester.courses.map((course) => (
          <CourseRow
            key={course.id}
            course={course}
            editMode={editMode}
            isSaving={isSaving}
            onChange={(field, value) => onCourseChange(course.id, field, value)}
            onRemove={() => onRemoveCourse(course.id)}
          />
        ))}

        {editMode && (
          <div className="flex w-full justify-end py-3">
            <Button
              variant={isSaving ? 'disabled' : 'outlined'}
              className="h-10 w-16"
              disabled={isSaving}
              onClick={onAddCourse}
            >
              추가
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
