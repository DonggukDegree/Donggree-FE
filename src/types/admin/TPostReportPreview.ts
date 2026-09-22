import type { TCommonResponse } from '@/types/common';
import type { TCourseType } from '@/types/course';
import type { TGetReportDetailResult } from '@/types/report/TGetReportDetail';
import type { TGetReportSummaryResult } from '@/types/report/TGetReportSummary';

export type TReportPreviewDetails = Partial<Record<TCourseType, TGetReportDetailResult>>;
export type TReportPreview = {
  report: TGetReportSummaryResult;
  details: TReportPreviewDetails;
};
export type TPostReportPreviewResponse = TCommonResponse<TReportPreview>;
