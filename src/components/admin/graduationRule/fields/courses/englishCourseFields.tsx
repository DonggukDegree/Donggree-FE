/** [관리자 > 졸업 규칙] ENGLISH_COURSE 설정 입력 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import MultiSelectDropdown from '@/components/admin/common/multiSelectDropdown';
import { COURSE_TYPE_OPTIONS } from '@/components/admin/graduationRule/fields/shared/fieldOptions';
import MajorRoleSelect from '@/components/admin/graduationRule/fields/shared/majorRoleSelect';
import type { IRuleFieldsProps } from '@/components/admin/graduationRule/fields/shared/ruleFieldsProps';
import type { TCourseType } from '@/types/course';

export default function EnglishCourseFields({
  draft,
  isSaving,
  onFieldChange,
}: Pick<IRuleFieldsProps, 'draft' | 'isSaving' | 'onFieldChange'>) {
  const toggleCourseType = (courseType: TCourseType) =>
    onFieldChange(
      'courseTypes',
      draft.courseTypes.includes(courseType)
        ? draft.courseTypes.filter((value) => value !== courseType)
        : [...draft.courseTypes, courseType],
    );
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1.5 md:col-span-2 md:max-w-xl">
        <FieldLabel>규칙 적용 대상</FieldLabel>
        <MajorRoleSelect draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
        <span className="text-body-xs text-coolgray-60">
          신규 규칙의 기본값은 단일전공이며 하나 이상 반드시 선택합니다. 적용 대상이 없던 기존 영어강의 규칙은
          단일전공과 복수전공자의 주전공 선택을 유지합니다.
        </span>
      </label>
      <p className="text-body-xs text-coolgray-60 md:col-span-2">
        이수구분을 비우면 복수전공을 포함한 전체 이수 과목에서 영어강의를 셉니다. 제1전공은 주전공 적용 시에는 주전공
        과목을, 복수전공자의 복수전공 적용 시에는 복수1 과목을 뜻합니다. 제2전공을 직접 선택해도 복수1 과목을 셉니다.
        여러 이수구분을 선택하면 합산하며, 학점이 아닌 과목 수로 비교합니다.
      </p>
      <p className="text-body-xs text-coolgray-60 md:col-span-2">
        영어강의 비대상자 면제는 유지합니다. 복수전공 학과의 추가 요건은 성적표의 전체 영어강의 이수 완료 표시만으로
        통과시키지 않고 실제 과목 수로 확인합니다.
      </p>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>대상 이수구분</FieldLabel>
        <MultiSelectDropdown
          options={COURSE_TYPE_OPTIONS}
          selectedValues={draft.courseTypes}
          onToggle={toggleCourseType}
          allLabel="전체 이수구분"
          disabled={isSaving}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>최소 이수 개수</FieldLabel>
        <TextInput
          value={draft.minCount}
          disabled={isSaving}
          placeholder="2"
          onChange={(value) => onFieldChange('minCount', value)}
        />
      </label>
    </div>
  );
}
