/**
 * [관리자 > FAQ 관리] 등록된 질문 목록
 * 페이지 하단의 표. 사용자 화면과 같은 목록(GET /api/faqs)을 태그 필터 없이 그대로 보여 준다.
 * 행의 '수정'을 누르면 위 폼으로 올라가고, '삭제'는 확인 모달을 거친 뒤 지운다.
 */
import TruncatedCell from '@/components/admin/common/truncatedCell';
import Button from '@/components/common/button';
import { FAQ_TAG_LABEL } from '@/constants/faq';
import type { TFaq } from '@/types/support/TFaq';

interface IFaqTableProps {
  faqs: TFaq[];
  editingId: number | null;
  isLoading: boolean;
  isError: boolean;
  isSaving: boolean;
  onEdit: (faq: TFaq) => void;
  onRemove: (faq: TFaq) => void;
}

const HEADER_CELL_CLASS = 'px-4 py-3 text-left text-body-s font-semibold text-primary-90';
const BODY_CELL_CLASS = 'px-4 py-4 text-body-s text-coolgray-90';

export default function FaqTable({ faqs, editingId, isLoading, isError, isSaving, onEdit, onRemove }: IFaqTableProps) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-5 text-coolgray-90">등록된 질문 목록</h2>
          <p className="mt-1 text-body-s text-coolgray-60">
            사용자 화면에는 최신순으로 노출됩니다. 목록 {faqs.length.toLocaleString()}건
          </p>
        </div>
      </div>

      <div className="max-h-[590px] overflow-auto rounded-xl border border-coolgray-10">
        <table className="min-w-[900px] w-full table-fixed border-collapse bg-white">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[30%]" />
            <col className="w-[44%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-primary-30">
            <tr>
              <th className={HEADER_CELL_CLASS}>태그</th>
              <th className={HEADER_CELL_CLASS}>제목 (질문)</th>
              <th className={HEADER_CELL_CLASS}>본문 (답변)</th>
              <th className={`${HEADER_CELL_CLASS} text-right`}>관리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center text-body-m text-coolgray-60">
                  FAQ를 불러오는 중입니다.
                </td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center text-body-m text-alert">
                  FAQ 목록을 불러오지 못했어요.
                </td>
              </tr>
            )}
            {!isLoading && !isError && faqs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center text-body-m text-coolgray-60">
                  아직 등록된 질문이 없습니다. 위 폼에서 첫 질문을 등록해보세요.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              faqs.map((faq) => (
                <tr
                  key={faq.id}
                  className={`border-t border-coolgray-10 transition-colors ${
                    editingId === faq.id ? 'bg-primary-30/70' : 'hover:bg-coolgray-10/50'
                  }`}
                >
                  <td className={BODY_CELL_CLASS}>
                    <span className="rounded-full bg-coolgray-10 px-3 py-1 text-body-xs text-coolgray-60">
                      {FAQ_TAG_LABEL[faq.tag]}
                    </span>
                  </td>
                  <td className={BODY_CELL_CLASS}>
                    <TruncatedCell text={faq.title} className="font-semibold" />
                  </td>
                  <td className={BODY_CELL_CLASS}>
                    {/* 본문의 줄바꿈은 표에서 공백으로 눌러 한 줄로 보여 주고, 전체는 hover 툴팁으로 확인한다. */}
                    <TruncatedCell text={faq.content.replace(/\n/g, ' ')} className="text-coolgray-60" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant={isSaving ? 'disabled' : 'outlined'}
                        disabled={isSaving}
                        onClick={() => onEdit(faq)}
                        className="w-16 py-2"
                      >
                        수정
                      </Button>
                      <Button
                        variant={isSaving ? 'disabled' : 'alert'}
                        disabled={isSaving}
                        onClick={() => onRemove(faq)}
                        className="w-16 py-2"
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
