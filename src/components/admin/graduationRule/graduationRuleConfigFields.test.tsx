/** [관리자 > 졸업 규칙] 종류별 입력의 선택·안내·저장 중 잠금 검증 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import GraduationRuleConfigFields from '@/components/admin/graduationRule/graduationRuleConfigFields';
import type { TGraduationRuleDraft } from '@/types/admin/forms/graduationRuleForm';
import type { TAdminRuleType, TRuleTypeName } from '@/types/admin/graduationRule/TGetRuleTypes';
import { EMPTY_RULE_DRAFT } from '@/utils/admin/adminForm';

const render = (typeName: TRuleTypeName | null, isSaving = false, values: Partial<TGraduationRuleDraft> = {}) => {
  const selectedRuleType: TAdminRuleType | null = typeName
    ? { id: 1, typeName, courseType: 'FIRST_MAJOR', description: '' }
    : null;
  return renderToStaticMarkup(
    <GraduationRuleConfigFields
      selectedRuleType={selectedRuleType}
      draft={{ ...EMPTY_RULE_DRAFT, clientId: 'new', ...values }}
      areaTypes={[]}
      isSaving={isSaving}
      onFieldChange={vi.fn()}
    />,
  );
};

describe('규칙 종류별 입력', () => {
  it.each<[TRuleTypeName, string]>([
    ['TOTAL_CREDITS', '최소 취득학점'],
    ['GPA', '평점 기준'],
    ['TEACHING_APTITUDE', '최소 합격 횟수'],
    ['MIN_CREDITS', '학점 집계 기준'],
    ['REQUIRED_COURSE', '필수 과목'],
    ['ENGLISH_COURSE', '대상 이수구분'],
    ['PREREQUISITE', '선이수'],
    ['SCIENCE_CONFLICT', '입력'],
    ['THESIS', '면제 학생유형'],
  ])('%s의 입력 표시', (kind, label) => {
    expect(render(kind)).toContain(label);
  });

  it('종류 미선택 시 안내만 표시', () => {
    expect(render(null)).toContain('규칙 종류를 선택하면');
    expect(render(null)).not.toContain('<input');
  });

  it('저장 중 텍스트·선택 입력 잠금', () => {
    const html = render('GPA', true);
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });

  it('영어강의의 직접 제2전공 안내 보존', () => {
    expect(render('ENGLISH_COURSE')).toContain('제2전공을 직접 선택해도 복수1 과목');
  });

  it('그룹별 모드에서는 그룹 입력을 노출하고 합산 임계값과 감면 입력을 숨김', () => {
    const html = render('MIN_CREDITS', true, {
      creditCalculation: 'GROUPS',
      creditGroups: [
        { clientId: 'a', courseCodes: 'ABC*', minCredits: '27' },
        { clientId: 'b', courseCodes: 'DEF*', minCredits: '27' },
      ],
      minSatisfiedGroups: '2',
    });
    expect(html).toContain('그룹 1 학수번호');
    expect(html).toContain('그룹 2 최소학점');
    expect(html).toContain('필수 충족 그룹 수');
    expect(html).not.toContain('최소 과목 수 (임계값)');
    expect(html).not.toContain('대체 이수 시 목표학점 감면');
    const controls = html.match(/<(?:input|select|button)\b[^>]*>/g) ?? [];
    expect(controls.length).toBeGreaterThan(5);
    expect(controls.every((control) => control.includes('disabled=""'))).toBe(true);
  });

  it('교직 요약 모드에서는 그룹 입력을 노출하지 않음', () => {
    const html = render('MIN_CREDITS', false, { creditCalculation: 'GROUPS', creditSource: 'TEACHING_SUMMARY' });
    expect(html).toContain('최소 교직 학점');
    expect(html).not.toContain('필수 충족 그룹 수');
  });
});
