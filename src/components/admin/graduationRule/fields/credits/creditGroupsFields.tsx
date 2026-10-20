/** [관리자 > 졸업 규칙] 그룹별 최소학점과 필수 충족 그룹 수 입력 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import type { IRuleFieldsProps } from '@/components/admin/graduationRule/fields/shared/ruleFieldsProps';
import Button from '@/components/common/inputs/button';
import type { TCreditGroupDraft } from '@/types/admin/forms/graduationRuleForm';

export default function CreditGroupsFields({
  draft,
  isSaving,
  onFieldChange,
}: Pick<IRuleFieldsProps, 'draft' | 'isSaving' | 'onFieldChange'>) {
  return (
    <div className="flex flex-col gap-3 border-t border-coolgray-20 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FieldLabel>그룹별 최소학점</FieldLabel>
        <Button
          type="button"
          variant="outlined"
          disabled={isSaving}
          className="px-3 py-2 text-body-xs"
          onClick={() =>
            onFieldChange('creditGroups', [
              ...draft.creditGroups,
              { clientId: crypto.randomUUID(), courseCodes: '', minCredits: '' },
            ])
          }
        >
          + 그룹 추가
        </Button>
      </div>
      <p className="text-body-xs text-coolgray-60">
        각 그룹의 최소학점을 채운 그룹이 아래 지정한 수 이상이면 충족합니다. 한 그룹의 초과 학점은 다른 그룹을 채우지
        않습니다. 학수번호는 쉼표로 구분하며 ABC*처럼 끝에 *를 붙이면 같은 접두어의 과목을 합산합니다. 서로 다른 그룹의
        학수번호 조건은 겹칠 수 없습니다.
      </p>
      {draft.creditGroups.length === 0 && (
        <p className="text-body-xs text-coolgray-50">그룹을 추가해 학수번호 조건과 최소학점을 입력하세요.</p>
      )}
      {draft.creditGroups.map((group, index) => {
        const update = (field: Exclude<keyof TCreditGroupDraft, 'clientId'>, value: string) =>
          onFieldChange(
            'creditGroups',
            draft.creditGroups.map((row) => (row.clientId === group.clientId ? { ...row, [field]: value } : row)),
          );
        return (
          <div
            key={group.clientId}
            className="grid items-end gap-3 rounded-lg bg-white p-3 md:grid-cols-[1fr_8rem_auto]"
          >
            <label className="flex flex-col gap-1.5">
              <FieldLabel>그룹 {index + 1} 학수번호</FieldLabel>
              <TextInput
                value={group.courseCodes}
                disabled={isSaving}
                placeholder="ABC*, DEF1001"
                onChange={(value) => update('courseCodes', value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>그룹 {index + 1} 최소학점</FieldLabel>
              <TextInput
                value={group.minCredits}
                disabled={isSaving}
                placeholder="27"
                onChange={(value) => update('minCredits', value)}
              />
            </label>
            <Button
              type="button"
              variant="outlined"
              disabled={isSaving}
              className="px-3 py-2 text-body-xs"
              aria-label={`그룹 ${index + 1} 삭제`}
              onClick={() =>
                onFieldChange(
                  'creditGroups',
                  draft.creditGroups.filter((row) => row.clientId !== group.clientId),
                )
              }
            >
              삭제
            </Button>
          </div>
        );
      })}
      <label className="flex max-w-xs flex-col gap-1.5">
        <FieldLabel>필수 충족 그룹 수</FieldLabel>
        <TextInput
          value={draft.minSatisfiedGroups}
          disabled={isSaving}
          placeholder="2"
          onChange={(value) => onFieldChange('minSatisfiedGroups', value)}
        />
        <span className="text-body-xs text-coolgray-60">
          전체 {draft.creditGroups.length}개 그룹 중 지정한 수 이상 충족
        </span>
      </label>
    </div>
  );
}
