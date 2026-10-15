/** [관리자 > 졸업 규칙] TOTAL_CREDITS 설정 입력 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import type { IRuleFieldsProps } from '@/components/admin/graduationRule/fields/shared/ruleFieldsProps';

export default function TotalCreditsFields({
  draft,
  isSaving,
  onFieldChange,
}: Pick<IRuleFieldsProps, 'draft' | 'isSaving' | 'onFieldChange'>) {
  return (
    <label className="flex max-w-xs flex-col gap-1.5">
      <FieldLabel>최소 취득학점</FieldLabel>
      <TextInput
        value={draft.minCredits}
        disabled={isSaving}
        placeholder="130"
        onChange={(value) => onFieldChange('minCredits', value)}
      />
    </label>
  );
}
