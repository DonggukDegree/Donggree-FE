/**
 * [내 학업 정보 관리] 수강 이력 표의 한 줄
 * 학기 섹션 표 안에서 과목 하나를 그린다. 보기 모드에서는 고정 텍스트,
 * 편집 모드에서는 열 성격에 맞는 입력(이수구분·성적은 드롭다운, 재수강은 체크박스, 나머지는 텍스트)을 보여 준다.
 * 어떤 열이 있는지는 constants/report/academicRecords의 COLUMNS가 정한다.
 */
import RowDeleteButton from '@/components/academicRecords/rowDeleteButton';
import Select from '@/components/common/select';
import TextField from '@/components/common/textField';
import {
  ACTION_COLUMN_WIDTH,
  ALLOWED_GRADES,
  COLUMNS,
  COURSE_TYPE_OPTIONS,
  type TCourseField,
} from '@/constants/report/academicRecords';
import type { TEditCourse } from '@/hooks/report/useAcademicRecordsEditor';

interface ICourseRowProps {
  course: TEditCourse;
  editMode: boolean;
  isSaving: boolean;
  onChange: (field: TCourseField, value: string | number) => void;
  onRemove: () => void;
}

export default function CourseRow({ course, editMode, isSaving, onChange, onRemove }: ICourseRowProps) {
  // 편집 모드의 입력 셀. 열마다 필요한 입력 형태가 다르다.
  const renderEditField = (column: (typeof COLUMNS)[number]) => {
    if (column.key === 'retake') {
      return (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={course.retake === 'O'}
            disabled={isSaving}
            onChange={(event) => onChange('retake', event.target.checked ? 'O' : 'X')}
            className="h-4 w-4 accent-primary-60"
          />
        </div>
      );
    }
    if (column.key === 'category') {
      return (
        <Select
          options={COURSE_TYPE_OPTIONS}
          placeholder="이수 구분"
          value={course.category}
          disabled={isSaving}
          onChange={(event) => onChange('category', event.target.value)}
        />
      );
    }
    if (column.key === 'grade') {
      return (
        <Select
          options={ALLOWED_GRADES}
          placeholder="성적"
          value={course.grade}
          disabled={isSaving}
          onChange={(event) => onChange('grade', event.target.value)}
        />
      );
    }
    return (
      <TextField
        className="w-full"
        placeholder={column.label}
        value={course[column.key]}
        disabled={isSaving}
        onChange={(event) => onChange(column.key, event.target.value)}
        {...(column.key === 'credits' && { type: 'number', min: 0 })}
      />
    );
  };

  // 보기 모드의 고정 텍스트 셀. (재수강만 비활성 체크박스로 표시)
  const renderViewField = (column: (typeof COLUMNS)[number]) => {
    if (column.key === 'retake') {
      return <input type="checkbox" checked={course.retake === 'O'} disabled className="h-4 w-4 accent-primary-60" />;
    }
    return course[column.key];
  };

  return (
    <div
      className={`flex w-full items-center border-b border-coolgray-10 transition-colors ${
        // 편집 모드는 입력칸 높이 때문에 여백을 조금 더 주고, 어느 줄을 만지는지 보이도록 hover 배경을 넣는다.
        editMode ? 'py-2.5 hover:bg-primary-30/60' : 'py-2'
      }`}
    >
      {COLUMNS.map((column) => (
        <div
          key={column.key}
          className={editMode ? `${column.width} px-1` : `${column.width} text-center text-body-l text-coolgray-90`}
        >
          {editMode ? renderEditField(column) : renderViewField(column)}
        </div>
      ))}
      <div className={`flex ${ACTION_COLUMN_WIDTH} justify-center`}>
        {editMode && <RowDeleteButton label="수강 이력 삭제" disabled={isSaving} onClick={onRemove} />}
      </div>
    </div>
  );
}
