import type {
  TCourseClassificationDraft,
  TCourseClassificationFormState,
} from '@/components/admin/courseClassificationForm';
import type { TAdminAreaType } from '@/types/admin/TGetAdminAreaTypes';
import { COURSE_LABEL, COURSE_TYPES } from '@/types/course';

const INPUT_CLASS =
  'w-full rounded-lg border border-coolgray-20 bg-white px-3 py-2 text-body-s text-coolgray-90 outline-none placeholder:text-coolgray-60 focus:border-primary-60 disabled:bg-coolgray-10 disabled:text-coolgray-60';

const BODY_CELL_CLASS = 'px-3 py-3 align-top';

// 네이티브 화살표를 숨긴 select(appearance-none) 위에 커스텀 꺽쇠를 칸 안쪽으로 들여 그린다.
function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coolgray-60"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface ICourseClassificationFormRowProps {
  draft: TCourseClassificationDraft;
  areaTypes: TAdminAreaType[];
  isSaving: boolean;
  onChange: (clientId: string, field: keyof TCourseClassificationFormState, value: string) => void;
  onRemove: (clientId: string) => void;
}

// 과목 분류 수정 테이블의 한 행. 신규/수정 구분 배지, 입력 필드, 삭제 버튼을 렌더링한다.
export default function CourseClassificationFormRow({
  draft,
  areaTypes,
  isSaving,
  onChange,
  onRemove,
}: ICourseClassificationFormRowProps) {
  return (
    <tr className="border-t border-coolgray-10">
      <td className="px-3 py-3">
        {/* 신규로 추가한 행과 기존 데이터를 수정하는 행을 배지로 구분한다. */}
        <span className="rounded-full bg-primary-30 px-3 py-1 text-body-xs font-semibold text-primary-90">
          {draft.id === null ? '신규' : '수정'}
        </span>
      </td>
      <td className={BODY_CELL_CLASS}>
        <input
          value={draft.courseCode}
          disabled={isSaving}
          onChange={(event) => onChange(draft.clientId, 'courseCode', event.target.value)}
          className={INPUT_CLASS}
        />
      </td>
      <td className={BODY_CELL_CLASS}>
        <input
          value={draft.tag}
          disabled={isSaving}
          onChange={(event) => onChange(draft.clientId, 'tag', event.target.value)}
          className={INPUT_CLASS}
        />
      </td>
      <td className={BODY_CELL_CLASS}>
        <input
          value={draft.studentYearStart}
          disabled={isSaving}
          inputMode="numeric"
          onChange={(event) => onChange(draft.clientId, 'studentYearStart', event.target.value)}
          className={INPUT_CLASS}
        />
      </td>
      <td className={BODY_CELL_CLASS}>
        <input
          value={draft.studentYearEnd}
          disabled={isSaving}
          inputMode="numeric"
          onChange={(event) => onChange(draft.clientId, 'studentYearEnd', event.target.value)}
          className={INPUT_CLASS}
        />
      </td>
      <td className={BODY_CELL_CLASS}>
        <div className="relative">
          <select
            value={draft.courseType}
            disabled={isSaving}
            onChange={(event) => onChange(draft.clientId, 'courseType', event.target.value)}
            className={`${INPUT_CLASS} appearance-none pr-8`}
          >
            <option value="">선택</option>
            {COURSE_TYPES.map((courseType) => (
              <option key={courseType} value={courseType}>
                {COURSE_LABEL[courseType]}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </td>
      <td className={BODY_CELL_CLASS}>
        <div className="relative">
          <select
            value={draft.areaTypeId}
            disabled={isSaving}
            onChange={(event) => onChange(draft.clientId, 'areaTypeId', event.target.value)}
            className={`${INPUT_CLASS} appearance-none pr-8`}
          >
            <option value="">없음</option>
            {areaTypes.map((areaType) => (
              <option key={areaType.id} value={areaType.id}>
                {areaType.areaName}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </td>
      <td className={BODY_CELL_CLASS}>
        <input
          value={draft.subCategory}
          disabled={isSaving}
          onChange={(event) => onChange(draft.clientId, 'subCategory', event.target.value)}
          className={INPUT_CLASS}
        />
      </td>
      <td className={BODY_CELL_CLASS}>
        <input
          value={draft.subjectDomain}
          disabled={isSaving}
          onChange={(event) => onChange(draft.clientId, 'subjectDomain', event.target.value)}
          className={INPUT_CLASS}
        />
      </td>
      <td className="px-3 py-3 text-center">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => onRemove(draft.clientId)}
          className="whitespace-nowrap rounded-full px-2 py-1 text-body-s text-coolgray-60 hover:text-primary-60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          삭제
        </button>
      </td>
    </tr>
  );
}
