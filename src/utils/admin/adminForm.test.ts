/** [관리자 > 졸업 요건 관리 > 졸업 규칙 관리] 목록 전체 선택과 작성 중인 규칙(draft)의 독립성 검사 */
import { describe, expect, it } from 'vitest';

import type { TAdminGraduationRule } from '@/types/admin/graduationRule/TGetGraduationRules';
import { EMPTY_RULE_DRAFT, toggleVisibleRuleDrafts, toRuleDraft } from '@/utils/admin/adminForm';

const rule = (id: number): TAdminGraduationRule => ({
  id,
  ruleTypeId: 1,
  typeName: 'MIN_CREDITS',
  courseType: null,
  ruleName: `규칙 ${id}`,
  ruleConfig: { minCredits: 12 },
  description: null,
});

const newDraft = { ...EMPTY_RULE_DRAFT, clientId: 'new-rule-0' };

describe('toggleVisibleRuleDrafts', () => {
  it('전체 해제는 지금 보이는 규칙의 draft만 빼고, 필터로 가려진 규칙과 신규 draft는 남긴다', () => {
    const hiddenDraft = toRuleDraft(rule(9));
    const drafts = [hiddenDraft, toRuleDraft(rule(1)), toRuleDraft(rule(2)), newDraft];

    const result = toggleVisibleRuleDrafts(drafts, [rule(1), rule(2)], false);

    expect(result.map((draft) => draft.clientId)).toEqual(['rule-9', 'new-rule-0']);
  });

  it('전체 선택은 보이는 규칙 중 아직 없는 것만 뒤에 추가하고 기존 작성 내용은 유지한다', () => {
    const editing = { ...toRuleDraft(rule(1)), ruleName: '수정 중인 이름' };

    const result = toggleVisibleRuleDrafts([editing, newDraft], [rule(1), rule(2)], true);

    expect(result.map((draft) => draft.clientId)).toEqual(['rule-1', 'new-rule-0', 'rule-2']);
    expect(result[0]?.ruleName).toBe('수정 중인 이름');
  });
});
