import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { patchReportCourses } from '@/apis/report/report';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import type { TResponseError } from '@/types/common';
import type { TPatchReportRequest } from '@/types/report/TPatchReport';

// 수강 이력 수동 추가 훅.
// 성공 시 학업 리포트와 졸업 판정 캐시를 무효화하고 안내 토스트를 띄운다.
export default function useAddCourses() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCoreMutation((body: TPatchReportRequest) => patchReportCourses(body), {
    onSuccess: () => {
      // 수강 이력이 바뀌었으므로 성적표 조회와 졸업 판정(요약·영역상세) 캐시를 무효화한다.
      // ['reports'] 접두사로 요약(['reports','summary'])·영역상세(['reports',{courseType}])를 한 번에 무효화한다.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_REPORTS });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('수강 이력이 추가되었어요.');
    },
    onError: (error: TResponseError) => {
      const status = error.response?.status;
      const code = error.response?.data?.code;

      // 성적표가 없으면(404 TRANSCRIPT404_1) 업로드로 유도.
      if (status === 404) {
        navigate('/upload', { replace: true });
        return;
      }
      // 허용되지 않은 성적 값.
      if (code === 'TRANSCRIPT400_4') {
        toast.error('성적 값이 올바르지 않아요. (예: A+, B0, P)');
        return;
      }
      // 그 외(필수 누락 등)는 서버 메시지를 토스트로 안내.
      toast.error(error.response?.data?.message ?? '수강 이력 추가 중 오류가 발생했어요.');
    },
  });
}
