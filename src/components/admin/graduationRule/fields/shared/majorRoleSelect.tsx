/** [관리자 > 졸업 규칙] 마지막 적용 대상 해제를 막는 역할 선택 */
import MultiSelectDropdown from '@/components/admin/common/multiSelectDropdown';
import type { IRuleFieldsProps } from '@/components/admin/graduationRule/fields/shared/ruleFieldsProps';
import { MAJOR_ROLE_LABEL, MAJOR_ROLES, type TMajorRole } from '@/types/admin/graduationRule/TMajorRole';

const OPTIONS = MAJOR_ROLES.map((role) => ({ value: role, label: MAJOR_ROLE_LABEL[role] }));
export default function MajorRoleSelect({
  draft,
  isSaving,
  onFieldChange,
}: Pick<IRuleFieldsProps, 'draft' | 'isSaving' | 'onFieldChange'>) {
  const toggle = (role: TMajorRole) => {
    if (draft.applicableMajorRoles.length === 1 && draft.applicableMajorRoles.includes(role)) return;
    onFieldChange(
      'applicableMajorRoles',
      draft.applicableMajorRoles.includes(role)
        ? draft.applicableMajorRoles.filter((value) => value !== role)
        : [...draft.applicableMajorRoles, role],
    );
  };
  return (
    <MultiSelectDropdown
      options={OPTIONS}
      selectedValues={draft.applicableMajorRoles}
      onToggle={toggle}
      allLabel="적용 대상 선택"
      disabled={isSaving}
    />
  );
}
