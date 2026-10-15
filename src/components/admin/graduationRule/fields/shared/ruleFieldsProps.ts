/** [관리자 > 졸업 규칙] 종류별 설정 입력의 공통 계약 */
import type { TAdminAreaType } from '@/types/admin/courseClassification/TGetAdminAreaTypes';
import type { TGraduationRuleDraft, TGraduationRuleFieldChange } from '@/types/admin/forms/graduationRuleForm';
import type { TAdminRuleType } from '@/types/admin/graduationRule/TGetRuleTypes';

export interface IRuleFieldsProps {
  draft: TGraduationRuleDraft;
  selectedRuleType: TAdminRuleType;
  areaTypes: TAdminAreaType[];
  isSaving: boolean;
  onFieldChange: TGraduationRuleFieldChange;
}
