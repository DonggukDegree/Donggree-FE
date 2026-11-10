/** [관리자 > 졸업 규칙] GPA 설정 입력 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import type { IRuleFieldsProps } from '@/components/admin/graduationRule/fields/shared/ruleFieldsProps';
import { ADMIN_INPUT_CLASS, SELECT_RESET_CLASS } from '@/constants/inputStyles';
import type { TGraduationRuleDraft } from '@/types/admin/forms/graduationRuleForm';

export default function GpaFields({
  draft,
  isSaving,
  onFieldChange,
}: Pick<IRuleFieldsProps, 'draft' | 'isSaving' | 'onFieldChange'>) {
  return (
    <div className="grid max-w-xl gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <FieldLabel>평점 기준</FieldLabel>
        <select
          value={draft.gpaScope}
          disabled={isSaving}
          onChange={(event) => onFieldChange('gpaScope', event.target.value as TGraduationRuleDraft['gpaScope'])}
          className={`${ADMIN_INPUT_CLASS} ${SELECT_RESET_CLASS}`}
        >
          <option value="TOTAL">총 평점</option>
          <option value="MAJOR">전공 평점(주전공)</option>
          <option value="TEACHING">교직 평점</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>최소 평점평균</FieldLabel>
        <TextInput
          value={draft.minGpa}
          disabled={isSaving}
          placeholder="2.0"
          onChange={(value) => onFieldChange('minGpa', value)}
        />
      </label>
    </div>
  );
}
