/** [관리자 > 졸업 규칙] TEACHING_APTITUDE 설정 입력 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import type { IRuleFieldsProps } from '@/components/admin/graduationRule/fields/shared/ruleFieldsProps';

export default function TeachingAptitudeFields({
  draft,
  isSaving,
  onFieldChange,
}: Pick<IRuleFieldsProps, 'draft' | 'isSaving' | 'onFieldChange'>) {
  return (
    <label className="flex max-w-xs flex-col gap-1.5">
      <FieldLabel>최소 합격 횟수</FieldLabel>
      <TextInput
        value={draft.minCount}
        disabled={isSaving}
        placeholder="2"
        onChange={(value) => onFieldChange('minCount', value)}
      />
    </label>
  );
}
