import { useRef, useState } from 'react';
import { toast } from 'sonner';

import type {
  TGraduationRuleDraft,
  TGraduationRuleDraftField,
  TGraduationRuleDraftValue,
} from '@/components/admin/graduationRuleForm';
import useAdminAreaTypes from '@/hooks/admin/useAdminAreaTypes';
import useAdminGraduationRules from '@/hooks/admin/useAdminGraduationRules';
import useAdminRuleTypes from '@/hooks/admin/useAdminRuleTypes';
import useUpsertGraduationRules from '@/hooks/admin/useUpsertGraduationRules';
import {
  EMPTY_RULE_DRAFT,
  nullableList,
  optionalText,
  parseRequiredCourseSets,
  splitList,
  toggleCourseType,
  toggleNumber,
  toNumber,
  toPositiveInteger,
  toRuleDraft,
} from '@/pages/admin/graduationRequirements.helpers';
import { useModalStore } from '@/stores/modalStore';
import type { TGraduationRuleConfig, TGraduationRuleFilters } from '@/types/admin/TGetGraduationRules';
import type { TAdminRuleType } from '@/types/admin/TGetRuleTypes';
import type { TGraduationRuleUpsertItem } from '@/types/admin/TPutGraduationRules';
import type { TCourseType } from '@/types/course';

// 규칙 종류(typeName)별로 폼 입력값을 검증해 API용 ruleConfig를 조립한다. 누락 시 toast 후 null.
const buildRuleConfig = (
  draft: TGraduationRuleDraft,
  ruleType: TAdminRuleType,
  rowLabel: string,
): TGraduationRuleConfig | null => {
  if (ruleType.typeName === 'TOTAL_CREDITS') {
    const minCredits = toPositiveInteger(draft.minCredits);
    if (!minCredits) {
      toast.error(`${rowLabel}의 최소 취득학점을 입력해주세요.`);
      return null;
    }
    return { minCredits };
  }

  if (ruleType.typeName === 'GPA') {
    const minGpa = toNumber(draft.minGpa);
    if (minGpa === null || minGpa <= 0) {
      toast.error(`${rowLabel}의 최소 평점평균을 입력해주세요.`);
      return null;
    }
    return { minGpa };
  }

  if (ruleType.typeName === 'MIN_AREA_CREDITS') {
    const minCredits = toPositiveInteger(draft.minCredits);
    if (!draft.courseType) {
      toast.error(`${rowLabel}의 이수구분을 선택해주세요.`);
      return null;
    }
    if (!minCredits) {
      toast.error(`${rowLabel}의 최소 학점을 입력해주세요.`);
      return null;
    }
    return {
      courseType: draft.courseType,
      areaNames: draft.areaNames.length > 0 ? draft.areaNames : null,
      minCredits,
    };
  }

  if (ruleType.typeName === 'REQUIRED_COURSE') {
    const courseCodes = splitList(draft.courseCodes);
    if (courseCodes.length === 0) {
      toast.error(`${rowLabel}의 필수 과목코드를 입력해주세요.`);
      return null;
    }
    return {
      courseCodes,
      exemptEnglishLevels: nullableList(draft.exemptEnglishLevels),
      requiredEnglishLevels: nullableList(draft.requiredEnglishLevels),
    };
  }

  if (ruleType.typeName === 'ENGLISH_COURSE') {
    const minCount = toPositiveInteger(draft.minCount);
    if (!minCount) {
      toast.error(`${rowLabel}의 최소 이수 개수를 입력해주세요.`);
      return null;
    }
    return {
      courseTypes: draft.courseTypes.length > 0 ? draft.courseTypes : null,
      minCount,
    };
  }

  if (ruleType.typeName === 'PREREQUISITE') {
    const targetCourseCodes = splitList(draft.targetCourseCodes);
    const prerequisiteCourseCodes = splitList(draft.prerequisiteCourseCodes);
    if (targetCourseCodes.length === 0 || prerequisiteCourseCodes.length === 0) {
      toast.error(`${rowLabel}의 대상/선이수 과목코드를 입력해주세요.`);
      return null;
    }
    if (draft.conditionField && !draft.conditionValue.trim()) {
      toast.error(`${rowLabel}의 조건 값을 입력해주세요.`);
      return null;
    }
    return {
      targetCourseCodes,
      prerequisiteCourseCodes,
      conditionField: draft.conditionField || null,
      conditionValue: draft.conditionField ? draft.conditionValue.trim() : null,
    };
  }

  if (ruleType.typeName === 'SCIENCE_EXPERIMENT') {
    const minCount = toPositiveInteger(draft.minCount);
    if (!minCount) {
      toast.error(`${rowLabel}의 최소 이수 개수를 입력해주세요.`);
      return null;
    }
    return { minCount };
  }

  if (ruleType.typeName === 'SCIENCE_CONFLICT') {
    return {};
  }

  const requiredCourseSets = parseRequiredCourseSets(draft.requiredCourseSetsText);
  if (requiredCourseSets.length === 0) {
    toast.error(`${rowLabel}의 필수 과목 세트를 입력해주세요.`);
    return null;
  }
  return {
    exemptStudentTypes: splitList(draft.exemptStudentTypes),
    requiredCourseSets,
  };
};

// 폼 draft 한 건을 업서트 요청 항목으로 변환한다. 검증 실패 시 toast 후 null.
const buildRuleUpsertItem = (
  draft: TGraduationRuleDraft,
  index: number,
  ruleTypes: TAdminRuleType[],
): TGraduationRuleUpsertItem | null => {
  const rowLabel = `${index + 1}번째 규칙`;
  const ruleTypeId = toPositiveInteger(draft.ruleTypeId);
  const ruleType = ruleTypeId ? ruleTypes.find((type) => type.id === ruleTypeId) : null;
  const ruleName = draft.ruleName.trim();

  if (!ruleTypeId || !ruleType) {
    toast.error(`${rowLabel}의 규칙 종류를 선택해주세요.`);
    return null;
  }
  if (!ruleName) {
    toast.error(`${rowLabel}의 규칙명을 입력해주세요.`);
    return null;
  }

  const ruleConfig = buildRuleConfig(draft, ruleType, rowLabel);
  if (!ruleConfig) return null;

  return {
    id: draft.id,
    ruleTypeId,
    ruleName,
    ruleConfig,
    description: optionalText(draft.description),
  };
};

// 졸업 규칙 탭의 상태·쿼리·검증·저장 로직을 모은 컨트롤러 훅.
// rules 쿼리는 하단 공유 테이블도 사용하므로 여기서 소유하고 결과를 그대로 반환한다.
export default function useGraduationRuleEditor() {
  const ruleDraftIndex = useRef(0);
  const openConfirm = useModalStore((state) => state.openConfirm);

  const [selectedRuleTypeIds, setSelectedRuleTypeIds] = useState<number[]>([]);
  const [selectedCourseTypes, setSelectedCourseTypes] = useState<TCourseType[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<TGraduationRuleFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [drafts, setDrafts] = useState<TGraduationRuleDraft[]>([]);

  const { data: areaTypes = [] } = useAdminAreaTypes();
  const { data: ruleTypes = [], isError: isRuleTypeError } = useAdminRuleTypes();
  const {
    data: rules = [],
    isPending: isRulesLoading,
    isError: isRulesError,
    refetch: refetchRules,
  } = useAdminGraduationRules(appliedFilters);
  const { mutate: upsertGraduationRules, isPending: isSaving } = useUpsertGraduationRules();

  const clearDrafts = () => {
    setSelectedIds(new Set());
    setDrafts([]);
  };

  const onRuleTypeToggle = (ruleTypeId: number) => {
    setSelectedRuleTypeIds((prev) => toggleNumber(prev, ruleTypeId));
  };

  const onCourseTypeToggle = (courseType: TCourseType) => {
    setSelectedCourseTypes((prev) => toggleCourseType(prev, courseType));
  };

  const applyFilters = () => {
    clearDrafts();
    setAppliedFilters({
      ...(selectedRuleTypeIds.length > 0 ? { ruleTypeIds: selectedRuleTypeIds } : {}),
      ...(selectedCourseTypes.length > 0 ? { courseTypes: selectedCourseTypes } : {}),
    });
  };

  const resetFilters = () => {
    setSelectedRuleTypeIds([]);
    setSelectedCourseTypes([]);
    setAppliedFilters({});
    clearDrafts();
  };

  const addDraft = () => {
    const clientId = `new-rule-${ruleDraftIndex.current++}`;
    setDrafts((prev) => [...prev, { ...EMPTY_RULE_DRAFT, clientId }]);
  };

  const removeDraft = (clientId: string) => {
    const removedDraft = drafts.find((draft) => draft.clientId === clientId);
    if (removedDraft?.id !== null && removedDraft?.id !== undefined) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(removedDraft.id as number);
        return next;
      });
    }
    setDrafts((prev) => prev.filter((draft) => draft.clientId !== clientId));
  };

  const changeDraft = (clientId: string, field: TGraduationRuleDraftField, value: TGraduationRuleDraftValue) => {
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.clientId !== clientId) return draft;
        const next = { ...draft, [field]: value };
        // 규칙 종류를 바꾸면 종류별 설정값이 의미를 잃으므로 모두 초기화한다.
        if (field === 'ruleTypeId') {
          return {
            ...next,
            minCredits: '',
            minGpa: '',
            minCount: '',
            courseType: '',
            areaNames: [],
            courseCodes: '',
            exemptEnglishLevels: '',
            requiredEnglishLevels: '',
            courseTypes: [],
            targetCourseCodes: '',
            prerequisiteCourseCodes: '',
            conditionField: '',
            conditionValue: '',
            exemptStudentTypes: '',
            requiredCourseSetsText: '',
          };
        }
        return next;
      }),
    );
  };

  // 하단 공유 테이블에서 "전체 선택"을 눌렀을 때(규칙 편집 모드) 현재 목록을 draft로 시딩한다.
  const selectRows = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      rules.forEach((rule) => {
        if (checked) {
          next.add(rule.id);
        } else {
          next.delete(rule.id);
        }
      });
      return next;
    });
    setDrafts((prev) => {
      const newDrafts = prev.filter((draft) => draft.id === null);
      if (!checked) return newDrafts;
      const existingDraftIds = new Set(prev.filter((draft) => draft.id !== null).map((draft) => draft.id));
      const visibleDrafts = rules.filter((rule) => !existingDraftIds.has(rule.id)).map((rule) => toRuleDraft(rule));
      return [...prev, ...visibleDrafts];
    });
  };

  // 하단 공유 테이블에서 행 하나를 토글했을 때(규칙 편집 모드) draft를 추가/제거한다.
  const selectRow = (ruleId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(ruleId);
      } else {
        next.delete(ruleId);
      }
      return next;
    });
    setDrafts((prev) => {
      if (!checked) return prev.filter((draft) => draft.id !== ruleId);
      const selectedRule = rules.find((rule) => rule.id === ruleId);
      if (!selectedRule || prev.some((draft) => draft.id === ruleId)) return prev;
      return [...prev, toRuleDraft(selectedRule)];
    });
  };

  const submit = () => {
    if (drafts.length === 0) {
      toast.error('수정하거나 추가할 졸업 규칙을 먼저 선택해주세요.');
      return;
    }

    const items: TGraduationRuleUpsertItem[] = [];
    for (const [index, draft] of drafts.entries()) {
      const item = buildRuleUpsertItem(draft, index, ruleTypes);
      if (!item) return;
      items.push(item);
    }

    const createCount = items.filter((item) => item.id === null).length;
    const updateCount = items.length - createCount;
    const summaries = items.map((item, index) => ({
      clientId: drafts[index]?.clientId ?? item.ruleName,
      item,
    }));

    openConfirm({
      title: '졸업 규칙 수정',
      action: `총 ${items.length}건 저장 (수정 ${updateCount}건, 신규 ${createCount}건)`,
      description: '규칙 설정값은 졸업 판정에 바로 사용됩니다. 저장 전 내용을 확인해주세요.',
      confirmText: '수정하기',
      cancelText: '취소하기',
      details: (
        <div className="flex max-h-52 flex-col gap-2 overflow-y-auto text-body-s">
          {summaries.map(({ clientId, item }) => {
            const ruleType = ruleTypes.find((type) => type.id === item.ruleTypeId);
            return (
              <div key={clientId} className="rounded-lg bg-white px-4 py-3">
                <p className="font-semibold text-coolgray-90">
                  {item.id === null ? '신규' : `ID ${item.id}`} · {item.ruleName}
                </p>
                <p className="mt-1 text-coolgray-60">{ruleType?.typeName ?? item.ruleTypeId}</p>
              </div>
            );
          })}
        </div>
      ),
      onConfirm: () => {
        upsertGraduationRules(
          { items },
          {
            onSuccess: () => {
              toast.success('졸업 규칙을 수정했어요.');
              clearDrafts();
              refetchRules();
            },
          },
        );
      },
    });
  };

  return {
    areaTypes,
    ruleTypes,
    isRuleTypeError,
    rules,
    isRulesLoading,
    isRulesError,
    selectedRuleTypeIds,
    selectedCourseTypes,
    onRuleTypeToggle,
    onCourseTypeToggle,
    applyFilters,
    resetFilters,
    drafts,
    selectedIds,
    addDraft,
    removeDraft,
    changeDraft,
    submit,
    isSaving,
    selectRows,
    selectRow,
  };
}
