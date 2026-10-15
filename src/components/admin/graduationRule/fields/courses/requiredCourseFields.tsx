/** [관리자 > 졸업 규칙] REQUIRED_COURSE 설정 입력 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import MajorRoleSelect from '@/components/admin/graduationRule/fields/shared/majorRoleSelect';
import type { IRuleFieldsProps } from '@/components/admin/graduationRule/fields/shared/ruleFieldsProps';
import { ADMIN_INPUT_CLASS } from '@/constants/inputStyles';

export default function RequiredCourseFields({
  draft,
  isSaving,
  onFieldChange,
}: Pick<IRuleFieldsProps, 'draft' | 'isSaving' | 'onFieldChange'>) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <label className="flex flex-col gap-1.5 md:col-span-3 md:max-w-xl">
        <FieldLabel>규칙 적용 대상</FieldLabel>
        <MajorRoleSelect draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
        <span className="text-body-xs text-coolgray-60">
          어떤 학생의 어느 전공에 이 필수과목 규칙을 적용할지 선택합니다. 기본값은 단일전공이며 하나 이상 반드시
          선택합니다.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 md:col-span-3">
        <FieldLabel>필수 과목 세트</FieldLabel>
        <textarea
          value={draft.requiredCourseSetsText}
          disabled={isSaving}
          placeholder={'물리1학수번호 & 물리2학수번호\n생물1학수번호 & 생물2학수번호'}
          onChange={(event) => onFieldChange('requiredCourseSetsText', event.target.value)}
          className={`${ADMIN_INPUT_CLASS} min-h-24 resize-y`}
        />
        <span className="text-body-xs text-coolgray-60">
          쉼표(,)는 하나만 이수(OR), &amp;는 모두 이수(AND), 줄바꿈은 세트 중 하나 완성(OR)을 뜻합니다. 한 과목이나 대체
          과목만 필요하면 기존처럼 학수번호를 쉼표로 입력하세요.
        </span>
      </label>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>면제 영어레벨</FieldLabel>
        <TextInput
          value={draft.exemptEnglishLevels}
          disabled={isSaving}
          placeholder="S0, S4"
          onChange={(value) => onFieldChange('exemptEnglishLevels', value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>적용 영어레벨</FieldLabel>
        <TextInput
          value={draft.requiredEnglishLevels}
          disabled={isSaving}
          placeholder="S4"
          onChange={(value) => onFieldChange('requiredEnglishLevels', value)}
        />
      </label>
    </div>
  );
}
