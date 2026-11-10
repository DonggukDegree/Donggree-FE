import axiosInstance from '@/apis/axiosInstance';
import type {
  TFaq,
  TFaqMutationResponse,
  TFaqRequest,
  TFaqTag,
  TGetFaqsResponse,
  TPostFaqResponse,
} from '@/types/support/TFaq';

// FAQ 목록 조회(최신순)
// tag를 넘기지 않으면 전체를 반환한다.
export const getFaqs = async (tag?: TFaqTag | null): Promise<TFaq[]> => {
  const { data } = await axiosInstance.get<TGetFaqsResponse>('/api/faqs', {
    params: tag ? { tag } : undefined,
  });
  return data.result;
};

// FAQ 등록(관리자)
export const postAdminFaq = async (body: TFaqRequest): Promise<number> => {
  const { data } = await axiosInstance.post<TPostFaqResponse>('/api/admin/faqs', body);
  return data.result;
};

// FAQ 수정(관리자)
export const putAdminFaq = async (id: number, body: TFaqRequest): Promise<void> => {
  await axiosInstance.put<TFaqMutationResponse>(`/api/admin/faqs/${id}`, body);
};

// FAQ 삭제(관리자)
export const deleteAdminFaq = async (id: number): Promise<void> => {
  await axiosInstance.delete<TFaqMutationResponse>(`/api/admin/faqs/${id}`);
};
