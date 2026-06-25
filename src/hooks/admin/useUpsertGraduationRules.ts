import { useQueryClient } from '@tanstack/react-query';

import { putAdminGraduationRules } from '@/apis/admin/graduationRequirement';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import type { TGraduationRuleUpsertRequest } from '@/types/admin/TPutGraduationRules';

// 졸업 규칙 등록/수정 통합 저장 훅. 저장 성공 후 규칙 목록과 세트 상세를 다시 보게 한다.
export default function useUpsertGraduationRules() {
  const queryClient = useQueryClient();

  return useCoreMutation<number[], TGraduationRuleUpsertRequest>((body) => putAdminGraduationRules(body), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_GRADUATION_RULES_ROOT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_REQUIREMENT_SETS_ROOT });
    },
  });
}
