/** [관리자 > PDF 리포트 테스트] 현재 업로드 한 건만 보관하는 미리보기 요청 */
import { useEffect, useRef } from 'react';

import postReportPreview from '@/apis/admin/reportPreview';
import { useCoreMutation } from '@/hooks/customQuery';

export default function useReportPreview() {
  const controller = useRef<AbortController | null>(null);
  const mutation = useCoreMutation(postReportPreview, {
    // 결과와 파일을 다음 진입에 재사용하지 않고, 개인 리포트 캐시도 건드리지 않는다.
    gcTime: 0,
    retry: false,
    onError: () => {}, // 오류는 업로드 화면 안에서 안내한다.
  });

  useEffect(() => () => controller.current?.abort(), []);

  const reset = () => {
    controller.current?.abort();
    controller.current = null;
    mutation.reset();
  };

  const preview = (file: File) => {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    mutation.mutate({ file, signal: next.signal });
  };

  return { ...mutation, preview, reset };
}
