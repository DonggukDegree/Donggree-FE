import axiosInstance from '@/apis/axiosInstance';
import type { TPostReportPreviewResponse } from '@/types/admin/TPostReportPreview';

export default async function postReportPreview({ file, signal }: { file: File; signal: AbortSignal }) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosInstance.post<TPostReportPreviewResponse>('/api/admin/reports/preview', form, { signal });
  return data.result;
}
