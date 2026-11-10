import type { TCommonResponse } from '@/types/common';

// GET /api/admin/area-types 응답 항목 — 과목 분류 필터/폼의 이수 영역 선택지
export type TAdminAreaType = {
  id: number;
  areaName: string;
};

export type TGetAdminAreaTypesResponse = TCommonResponse<TAdminAreaType[]>;
