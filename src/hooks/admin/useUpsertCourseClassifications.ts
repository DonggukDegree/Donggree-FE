import { useQueryClient } from '@tanstack/react-query';

import { putAdminCourseClassifications } from '@/apis/admin/courseClassification';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import type { TCourseClassificationUpsertRequest } from '@/types/admin/TPutCourseClassifications';

// 과목 분류 등록/수정 통합 저장 훅. 저장 성공 후 과목 분류 조회 캐시를 모두 무효화한다.
export default function useUpsertCourseClassifications() {
  const queryClient = useQueryClient();

  return useCoreMutation<number[], TCourseClassificationUpsertRequest>((body) => putAdminCourseClassifications(body), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_COURSE_CLASSIFICATIONS_ROOT });
    },
  });
}
