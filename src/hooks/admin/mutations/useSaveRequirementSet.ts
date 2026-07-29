import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { postAdminRequirementSet, putAdminRequirementSet } from '@/apis/admin/graduationRequirement';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import type { TRequirementSetCreateRequest, TRequirementSetUpdateRequest } from '@/types/admin/TRequirementSets';
import { getErrorCode, getErrorMessage } from '@/utils/error';

type TSaveRequirementSetVariables =
  | {
      id: null;
      body: TRequirementSetCreateRequest;
    }
  | {
      id: number;
      body: TRequirementSetUpdateRequest;
    };

// 졸업 요건 세트 생성/수정 저장 훅. id가 있으면 수정, 없으면 생성한다.
export default function useSaveRequirementSet() {
  const queryClient = useQueryClient();

  return useCoreMutation<number | null, TSaveRequirementSetVariables>(
    ({ id, body }) => (id === null ? postAdminRequirementSet(body) : putAdminRequirementSet(id, body)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_REQUIREMENT_SETS_ROOT });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_ADMIN_COLLEGES });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DEPARTMENTS_ROOT });
      },
      onError: (error) => {
        if (getErrorCode(error) === 'CURRICULUM409_3') {
          toast.error('적용년도가 겹치는 기존 활성 세트를 먼저 비활성화해주세요.');
          return;
        }
        toast.error(getErrorMessage(error) ?? '졸업 요건 세트 저장 중 오류가 발생했습니다.');
      },
    },
  );
}
