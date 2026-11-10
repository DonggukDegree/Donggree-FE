/** [관리자 > 졸업 규칙] PREREQUISITE 설정 입력 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import type { IRuleFieldsProps } from '@/components/admin/graduationRule/fields/shared/ruleFieldsProps';
import SelectChevron from '@/components/common/inputs/selectChevron';
import { ADMIN_INPUT_CLASS, SELECT_RESET_CLASS } from '@/constants/inputStyles';
import type { TGraduationRuleDraft } from '@/types/admin/forms/graduationRuleForm';

export default function PrerequisiteFields({
  draft,
  isSaving,
  onFieldChange,
}: Pick<IRuleFieldsProps, 'draft' | 'isSaving' | 'onFieldChange'>) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <FieldLabel>대상 과목코드</FieldLabel>
        <TextInput
          value={draft.targetCourseCodes}
          disabled={isSaving}
          placeholder="RGC1081"
          onChange={(value) => onFieldChange('targetCourseCodes', value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>선이수 과목코드</FieldLabel>
        <TextInput
          value={draft.prerequisiteCourseCodes}
          disabled={isSaving}
          placeholder="RGC1080"
          onChange={(value) => onFieldChange('prerequisiteCourseCodes', value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>조건 필드</FieldLabel>
        <div className="relative">
          <select
            value={draft.conditionField}
            disabled={isSaving}
            onChange={(event) =>
              onFieldChange('conditionField', event.target.value as TGraduationRuleDraft['conditionField'])
            }
            className={`${ADMIN_INPUT_CLASS} ${SELECT_RESET_CLASS}`}
          >
            <option value="">없음</option>
            <option value="englishLevel">영어 레벨</option>
          </select>
          <SelectChevron />
        </div>
      </label>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>조건 값</FieldLabel>
        <TextInput
          value={draft.conditionValue}
          disabled={isSaving}
          placeholder="S4"
          onChange={(value) => onFieldChange('conditionValue', value)}
        />
      </label>
    </div>
  );
}
