import TruncatedCell from '@/components/admin/truncatedCell';
import type { TAdminGraduationRule } from '@/types/admin/TGetGraduationRules';
import { COURSE_LABEL } from '@/types/course';

interface IGraduationRuleTableProps {
  rules: TAdminGraduationRule[];
  selectedIds: Set<number>;
  isLoading: boolean;
  isError: boolean;
  mode: 'rule' | 'set';
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (ruleId: number, checked: boolean) => void;
}

const HEADER_CELL_CLASS = 'px-4 py-3 text-left text-body-s font-semibold text-primary-90';
const BODY_CELL_CLASS = 'px-4 py-4 text-body-s text-coolgray-90';

const formatConfig = (config: Record<string, unknown>) => {
  const entries = Object.entries(config);
  if (entries.length === 0) return '{}';
  return entries
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${value.flat(3).join(', ') || '[]'}`;
      if (value === null || value === undefined) return `${key}: null`;
      return `${key}: ${String(value)}`;
    })
    .join(' · ');
};

export default function GraduationRuleTable({
  rules,
  selectedIds,
  isLoading,
  isError,
  mode,
  onToggleAll,
  onToggleRow,
}: IGraduationRuleTableProps) {
  const allChecked = rules.length > 0 && rules.every((rule) => selectedIds.has(rule.id));
  const selectionLabel = mode === 'rule' ? '편집' : '세트 선택';

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-5 text-coolgray-90">졸업 규칙 목록</h2>
          <p className="mt-1 text-body-s text-coolgray-60">조회 결과 {rules.length.toLocaleString()}건</p>
        </div>
        <span className="rounded-full bg-primary-30 px-4 py-2 text-button-s text-primary-90">
          {selectionLabel} {selectedIds.size.toLocaleString()}건
        </span>
      </div>

      <div className="max-h-[590px] overflow-auto rounded-xl border border-coolgray-10">
        <table className="min-w-[1120px] w-full table-fixed border-collapse bg-white">
          <colgroup>
            <col className="w-12" />
            <col className="w-[32%]" />
            <col className="w-[18%]" />
            <col className="w-[8%]" />
            <col className="w-[28%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-primary-30">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allChecked}
                  disabled={rules.length === 0}
                  onChange={(event) => onToggleAll(event.target.checked)}
                  className="h-4 w-4 accent-primary-60"
                  aria-label="전체 졸업 규칙 선택"
                />
              </th>
              <th className={HEADER_CELL_CLASS}>규칙명</th>
              <th className={HEADER_CELL_CLASS}>규칙 종류</th>
              <th className={HEADER_CELL_CLASS}>이수구분</th>
              <th className={HEADER_CELL_CLASS}>설정값</th>
              <th className={HEADER_CELL_CLASS}>설명</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-body-m text-coolgray-60">
                  졸업 규칙을 불러오는 중입니다.
                </td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-body-m text-alert">
                  졸업 규칙을 불러오지 못했어요.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rules.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-body-m text-coolgray-60">
                  조건에 맞는 졸업 규칙이 없습니다.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rules.map((rule) => (
                <tr
                  key={rule.id}
                  className={`border-t border-coolgray-10 transition-colors ${
                    selectedIds.has(rule.id) ? 'bg-primary-30/70' : 'hover:bg-coolgray-10/50'
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(rule.id)}
                      onChange={(event) => onToggleRow(rule.id, event.target.checked)}
                      className="h-4 w-4 accent-primary-60"
                      aria-label={`${rule.ruleName} 선택`}
                    />
                  </td>
                  <td className={BODY_CELL_CLASS}>
                    {/* 규칙명이 길어 ...로 잘릴 때 커서를 올리면 전체 규칙명을 툴팁으로 보여준다. */}
                    <TruncatedCell text={rule.ruleName} className="font-semibold" />
                  </td>
                  <td className={BODY_CELL_CLASS}>{rule.typeName}</td>
                  <td className={BODY_CELL_CLASS}>{rule.courseType ? COURSE_LABEL[rule.courseType] : '전체'}</td>
                  <td className={BODY_CELL_CLASS}>
                    {/* 설정값도 길어지면 잘리므로 hover 시 전체 값을 툴팁으로 노출한다. */}
                    <TruncatedCell text={formatConfig(rule.ruleConfig)} />
                  </td>
                  <td className={BODY_CELL_CLASS}>
                    {/* 설명도 동일하게 hover 시 전체 내용을 확인할 수 있게 한다. */}
                    <TruncatedCell text={rule.description ?? '-'} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
