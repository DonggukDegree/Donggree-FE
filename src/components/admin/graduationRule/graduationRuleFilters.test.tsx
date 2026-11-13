/** [관리자 > 졸업 요건 관리] 졸업 규칙 필터의 단과대·적용 세트 선택지 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import GraduationRuleFilters from '@/components/admin/graduationRule/graduationRuleFilters';
import type { TAdminRequirementSetSummary } from '@/types/admin/TRequirementSets';

const set: TAdminRequirementSetSummary = {
  id: 101,
  departmentId: 1,
  departmentName: '컴퓨터공학전공',
  yearStart: 2023,
  yearEnd: 2026,
  track: 'ALL',
  version: 1,
  description: null,
  sheetImageUrl: null,
  active: true,
};

const render = (selectedCollegeId: string) =>
  renderToStaticMarkup(
    <GraduationRuleFilters
      ruleTypes={[]}
      requirementSets={[set]}
      colleges={[
        { id: 10, collegeName: 'AI융합대학' },
        { id: 20, collegeName: '법과대학' },
      ]}
      departments={[{ id: 1, collegeId: 10, collegeName: 'AI융합대학', departmentName: '컴퓨터공학전공' }]}
      selectedRuleTypeIds={[]}
      selectedCourseTypes={[]}
      selectedCollegeId={selectedCollegeId}
      selectedSetId=""
      onRuleTypeToggle={vi.fn()}
      onCourseTypeToggle={vi.fn()}
      onCollegeChange={vi.fn()}
      onSetChange={vi.fn()}
      onApply={vi.fn()}
      onReset={vi.fn()}
    />,
  );

describe('GraduationRuleFilters', () => {
  it('단과대 선택지와 넘겨받은 적용 세트 선택지를 보여준다', () => {
    const html = render('');

    expect(html).toContain('단과대');
    expect(html).toContain('전체 단과대');
    expect(html).toContain('AI융합대학</option>');
    expect(html).toContain('법과대학</option>');
    expect(html).toContain('AI융합대학 / 컴퓨터공학전공 · 2023-2026');
  });

  it('고른 단과대를 선택 상태로 표시한다', () => {
    expect(render('20')).toContain('<option value="20" selected="">법과대학</option>');
  });
});
