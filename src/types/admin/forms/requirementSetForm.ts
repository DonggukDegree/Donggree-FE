/** [관리자 > 폼 모델] requirementSet 입력 상태와 변경 계약 */
import type { TRequirementTrack } from '@/types/admin/TRequirementSets';

export type TRequirementSetFormState = {
  id: number | null;
  departmentId: number | null;
  collegeName: string;
  departmentName: string;
  yearStart: string;
  yearEnd: string;
  track: TRequirementTrack;
  version: string;
  description: string;
  studentNotice: string;
  sheetImageUrl: string;
  active: boolean;
};
