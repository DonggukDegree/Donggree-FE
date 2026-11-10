/** [관리자 > 졸업 규칙] 기존 옵션의 편집 왕복·검증 회귀 검사 */
import { describe, expect, it } from 'vitest';

import type { TGraduationRuleDraft } from '@/types/admin/forms/graduationRuleForm';
import type { TAdminGraduationRule, TGraduationRuleConfig } from '@/types/admin/graduationRule/TGetGraduationRules';
import type { TAdminRuleType, TRuleTypeName } from '@/types/admin/graduationRule/TGetRuleTypes';
import {
  EMPTY_RULE_DRAFT,
  hasEmptyRequiredCourseGroup,
  parseRequiredCourseSets,
  toNumber,
  toRuleDraft,
} from '@/utils/admin/adminForm';
import { buildRuleUpsertItem } from '@/utils/admin/graduationRuleConfig';

// 테스트는 순수 결과를 읽고, UI의 안내 방식에 의존하지 않는다.
const itemFromDraft = (...args: Parameters<typeof buildRuleUpsertItem>) => {
  const result = buildRuleUpsertItem(...args);
  return result.ok ? result.value : null;
};

const ruleType = (typeName: TRuleTypeName): TAdminRuleType => ({
  id: 1,
  typeName,
  courseType: 'FIRST_MAJOR',
  description: '',
});
const draft = (values: Partial<TGraduationRuleDraft> = {}): TGraduationRuleDraft => ({
  ...EMPTY_RULE_DRAFT,
  clientId: 'new',
  ruleTypeId: '1',
  ruleName: '규칙',
  ...values,
});
const fromConfig = (typeName: TRuleTypeName, ruleConfig: TGraduationRuleConfig): TGraduationRuleDraft => {
  const rule: TAdminGraduationRule = {
    id: 8,
    ruleTypeId: 1,
    typeName,
    courseType: 'FIRST_MAJOR',
    ruleName: '규칙',
    ruleConfig,
    description: null,
  };
  return toRuleDraft(rule);
};

describe('기존 규칙의 편집·저장 호환', () => {
  it.each<[TRuleTypeName, TGraduationRuleConfig]>([
    ['TOTAL_CREDITS', { minCredits: 130 }],
    ['GPA', { minGpa: 2.0, gpaScope: 'TOTAL' }],
    ['GPA', { minGpa: 2.5, gpaScope: 'MAJOR' }],
    ['GPA', { minGpa: 2.75, gpaScope: 'TEACHING' }],
    ['TEACHING_APTITUDE', { minCount: 2 }],
    ['MIN_CREDITS', { minCredits: 12, courseType: 'SECOND_MAJOR', applicableMajorRoles: ['SECONDARY'] }],
    ['MIN_CREDITS', { creditSource: 'TEACHING_SUMMARY', minCredits: 22, applicableMajorRoles: ['SINGLE_PRIMARY'] }],
    [
      'MIN_CREDITS',
      {
        courseType: 'FIRST_MAJOR',
        pdfCourseTypeNames: ['전필', '전선'],
        creditGroups: [
          { courseCodes: ['ABC*', '7777700'], minCredits: 27 },
          { courseCodes: ['DEF*'], minCredits: 27 },
          { courseCodes: ['GHI*'], minCredits: 24 },
          { courseCodes: ['JKL*', 'DEV11079'], minCredits: 21 },
        ],
        minSatisfiedGroups: 2,
        applicableMajorRoles: ['SINGLE_PRIMARY', 'SECONDARY'],
      },
    ],
    [
      'MIN_CREDITS',
      { minCount: 2, pdfCourseTypeNames: ['직필'], pdfAreaNames: ['교직필수'], applicableMajorRoles: ['DUAL_PRIMARY'] },
    ],
    [
      'MIN_CREDITS',
      {
        minCredits: 12,
        applicableMajorRoles: ['SINGLE_PRIMARY'],
        creditAdjustments: [{ requiredCourseCodes: ['A'], replacementCourseCodes: ['B', 'C'], credits: 3 }],
      },
    ],
    [
      'REQUIRED_COURSE',
      {
        courseCodes: ['A', 'B'],
        exemptEnglishLevels: null,
        requiredEnglishLevels: null,
        applicableMajorRoles: ['SINGLE_PRIMARY'],
      },
    ],
    [
      'REQUIRED_COURSE',
      {
        requiredCourseSets: [[['A', 'B'], ['C']], [['D']]],
        exemptEnglishLevels: ['S0'],
        requiredEnglishLevels: ['S1'],
        applicableMajorRoles: ['SECONDARY'],
      },
    ],
    ['ENGLISH_COURSE', { courseTypes: ['SECOND_MAJOR'], minCount: 2, applicableMajorRoles: ['DUAL_PRIMARY'] }],
    [
      'PREREQUISITE',
      {
        targetCourseCodes: ['A'],
        prerequisiteCourseCodes: ['B'],
        conditionField: 'englishLevel',
        conditionValue: 'S1',
      },
    ],
    ['SCIENCE_CONFLICT', {}],
    [
      'THESIS',
      {
        applicableMajorRoles: ['SECONDARY'],
        exemptStudentTypes: ['학석사연계과정'],
        exemptCourseCodes: ['A'],
        requiredCourseSets: [[['A'], ['B', 'C']]],
      },
    ],
  ])('%s의 기존 옵션을 보존', (typeName, config) => {
    const item = itemFromDraft(fromConfig(typeName, config), 0, [ruleType(typeName)]);
    expect(item?.ruleConfig).toEqual(config);
    expect(item?.id).toBe(8);
  });

  it.each(['THESIS', 'ENGLISH_COURSE'] as const)('%s의 역할 누락은 두 주전공 범위 유지', (typeName) => {
    const value = fromConfig(typeName, typeName === 'THESIS' ? {} : { minCount: 2 });
    expect(value.applicableMajorRoles).toEqual(['SINGLE_PRIMARY', 'DUAL_PRIMARY']);
    expect(itemFromDraft(value, 0, [ruleType(typeName)])?.ruleConfig).toMatchObject({
      applicableMajorRoles: value.applicableMajorRoles,
    });
  });

  it('빈 MIN_CREDITS 선택자는 제한 없음으로 키 생략', () => {
    expect(itemFromDraft(draft({ minCredits: '12' }), 0, [ruleType('MIN_CREDITS')])?.ruleConfig).toEqual({
      minCredits: 12,
      applicableMajorRoles: ['SINGLE_PRIMARY'],
    });
  });

  it.each(['A &', '& A', 'A | | B'])('빈 AND 그룹 저장 차단: %s', (text) => {
    expect(hasEmptyRequiredCourseGroup(text)).toBe(true);
    expect(itemFromDraft(draft({ requiredCourseSetsText: text }), 0, [ruleType('REQUIRED_COURSE')])).toBeNull();
  });

  it('줄바꿈 OR·기존 | AND·쉼표 대체 과목 입력 유지', () => {
    expect(parseRequiredCourseSets(' A, B | C \n D & E ')).toEqual([
      [['A', 'B'], ['C']],
      [['D'], ['E']],
    ]);
  });

  it.each(['MIN_CREDITS', 'REQUIRED_COURSE', 'THESIS', 'ENGLISH_COURSE'] as const)(
    '%s의 적용 대상 누락 차단',
    (typeName) => {
      expect(
        itemFromDraft(
          draft({ minCredits: '12', minCount: '2', requiredCourseSetsText: 'A', applicableMajorRoles: [] }),
          0,
          [ruleType(typeName)],
        ),
      ).toBeNull();
    },
  );

  it('부분 면제에 학생유형 누락 차단', () => {
    expect(itemFromDraft(draft({ exemptCourseCodes: 'A' }), 0, [ruleType('THESIS')])).toBeNull();
  });

  it('공백 이름·설명의 기존 정규화 유지', () => {
    expect(
      itemFromDraft(draft({ ruleName: ' 규칙 ', description: ' ', minCredits: '130' }), 0, [ruleType('TOTAL_CREDITS')]),
    ).toMatchObject({ ruleName: '규칙', description: null });
  });

  it('빈 숫자와 실제 0 구분', () => {
    expect(toNumber(' ')).toBeNull();
    expect(toNumber('0')).toBe(0);
    expect(itemFromDraft(draft({ minGpa: '0' }), 0, [ruleType('GPA')])).toBeNull();
  });
});

describe('그룹별 최소학점 설정', () => {
  const grouped = (overrides: Partial<TGraduationRuleDraft> = {}) =>
    draft({
      creditCalculation: 'GROUPS',
      creditGroups: [
        { clientId: 'a', courseCodes: 'ABC*', minCredits: '27' },
        { clientId: 'b', courseCodes: 'DEF*', minCredits: '27' },
      ],
      minSatisfiedGroups: '2',
      ...overrides,
    });
  const build = (value: TGraduationRuleDraft) => buildRuleUpsertItem(value, 0, [ruleType('MIN_CREDITS')]);

  it.each(['ABC*', 'ABC1*', 'ABC1001', 'AB*'])('다른 그룹의 겹치는 패턴 %s 차단', (pattern) => {
    expect(
      build(
        grouped({
          creditGroups: [
            { clientId: 'a', courseCodes: 'ABC*', minCredits: '27' },
            { clientId: 'b', courseCodes: pattern, minCredits: '27' },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, error: expect.stringContaining('겹칩니다') });
  });

  it.each(['', '0', '-1', '3', '1.5'])('잘못된 충족 그룹 수 %s 차단', (count) => {
    expect(build(grouped({ minSatisfiedGroups: count })).ok).toBe(false);
  });

  it.each(['', 'abc*', '*', 'AB*C', 'ABC-01', 'ABCDEFGHI', 'ABC**'])('잘못된 그룹 학수번호 %s 차단', (pattern) => {
    expect(
      build(
        grouped({ creditGroups: [{ clientId: 'a', courseCodes: pattern, minCredits: '27' }], minSatisfiedGroups: '1' }),
      ).ok,
    ).toBe(false);
  });

  it.each(['', '0', '-1', '1.5', '2147483648'])('잘못된 그룹 최소학점 %s 차단', (credits) => {
    expect(
      build(
        grouped({
          creditGroups: [{ clientId: 'a', courseCodes: 'ABC*', minCredits: credits }],
          minSatisfiedGroups: '1',
        }),
      ).ok,
    ).toBe(false);
  });

  it('그룹 삭제로 충족 그룹 수가 전체보다 커지면 저장 차단', () => {
    expect(build(grouped({ creditGroups: [{ clientId: 'a', courseCodes: 'ABC*', minCredits: '27' }] })).ok).toBe(false);
  });

  it('합산 입력과 감면을 남겨두고 모드를 바꿔도 그룹 설정만 전송', () => {
    const result = build(
      grouped({
        minCredits: '54',
        minCount: '2',
        courseCodes: 'ZZZ*',
        creditAdjustments: [{ clientId: 'old', requiredCourseCodes: 'A', replacementCourseCodes: 'B', credits: '3' }],
      }),
    );
    expect(result).toMatchObject({
      ok: true,
      value: {
        ruleConfig: {
          creditGroups: [
            { courseCodes: ['ABC*'], minCredits: 27 },
            { courseCodes: ['DEF*'], minCredits: 27 },
          ],
          minSatisfiedGroups: 2,
          applicableMajorRoles: ['SINGLE_PRIMARY'],
        },
      },
    });
    if (result.ok) {
      expect(result.value.ruleConfig).not.toHaveProperty('minCredits');
      expect(result.value.ruleConfig).not.toHaveProperty('minCount');
      expect(result.value.ruleConfig).not.toHaveProperty('courseCodes');
      expect(result.value.ruleConfig).not.toHaveProperty('creditAdjustments');
    }
  });

  it('합산 모드로 바꾸면 이전 그룹 조건은 전송하지 않음', () => {
    const result = build(grouped({ creditCalculation: 'TOTAL', minCredits: '54' }));
    expect(result).toMatchObject({ ok: true });
    if (result.ok)
      expect(result.value.ruleConfig).toEqual({ minCredits: 54, applicableMajorRoles: ['SINGLE_PRIMARY'] });
  });
});
