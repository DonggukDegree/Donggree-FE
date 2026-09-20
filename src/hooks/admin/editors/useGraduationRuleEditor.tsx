/**
 * [관리자 > 졸업 요건 관리 > 졸업 규칙 관리] 탭 컨트롤러 훅
 * 필터 상태 · 수정 대상(draft) 선택 · 저장 확인 모달 · 저장을 담당한다.
 * 규칙 종류별 설정값 검증과 rule_config 조립은 utils/graduationRuleConfig가 맡는다.
 * 하단 규칙 목록 조회는 세트 관리 탭도 함께 쓰므로 이 훅이 소유하고 결과를 그대로 넘겨준다.
 */
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import type {
  TGraduationRuleDraft,
  TGraduationRuleDraftField,
  TGraduationRuleDraftValue,
} from '@/components/admin/graduationRule/graduationRuleForm';
import useUpsertGraduationRules from '@/hooks/admin/mutations/useUpsertGraduationRules';
import useAdminAreaTypes from '@/hooks/admin/queries/useAdminAreaTypes';
import useAdminGraduationRules from '@/hooks/admin/queries/useAdminGraduationRules';
import useAdminRequirementSets from '@/hooks/admin/queries/useAdminRequirementSets';
import useAdminRuleTypes from '@/hooks/admin/queries/useAdminRuleTypes';
import { useModalStore } from '@/stores/modalStore';
import type { TGraduationRuleFilters } from '@/types/admin/TGetGraduationRules';
import type { TGraduationRuleUpsertItem } from '@/types/admin/TPutGraduationRules';
import type { TCourseType } from '@/types/course';
import { EMPTY_RULE_DRAFT, toggleCourseType, toggleNumber, toPositiveInteger, toRuleDraft } from '@/utils/adminForm';
import { buildRuleUpsertItem } from '@/utils/graduationRuleConfig';

export default function useGraduationRuleEditor() {
  const ruleDraftIndex = useRef(0);
  const openConfirm = useModalStore((state) => state.openConfirm);

  // 필터는 '고르는 중인 값'과 '적용된 값'을 나눠 둔다. 적용된 값만 조회에 쓰이므로
  // 드롭다운을 만지는 동안에는 목록이 흔들리지 않는다.
  const [selectedRuleTypeIds, setSelectedRuleTypeIds] = useState<number[]>([]);
  const [selectedCourseTypes, setSelectedCourseTypes] = useState<TCourseType[]>([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<TGraduationRuleFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [drafts, setDrafts] = useState<TGraduationRuleDraft[]>([]);

  const { data: areaTypes = [] } = useAdminAreaTypes();
  const { data: ruleTypes = [], isError: isRuleTypeError } = useAdminRuleTypes();
  // '적용 세트' 필터의 선택지. 필터 없이 전체 세트를 받는다.
  const { data: requirementSets = [] } = useAdminRequirementSets({});
  // 규칙 종류·이수구분·적용 세트 모두 서버가 AND로 걸러 준다. (requirementSetId 파라미터 지원)
  const {
    data: rules = [],
    isPending: isRulesLoading,
    isError: isRulesError,
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

  // 목록이 바뀌면 화면에 없는 규칙을 편집 중인 상태가 남지 않도록 draft를 비운다.
  const applyFilters = () => {
    clearDrafts();
    const requirementSetId = toPositiveInteger(selectedSetId);
    setAppliedFilters({
      ...(selectedRuleTypeIds.length > 0 ? { ruleTypeIds: selectedRuleTypeIds } : {}),
      ...(selectedCourseTypes.length > 0 ? { courseTypes: selectedCourseTypes } : {}),
      ...(requirementSetId ? { requirementSetId } : {}),
    });
  };

  const resetFilters = () => {
    setSelectedRuleTypeIds([]);
    setSelectedCourseTypes([]);
    setSelectedSetId('');
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
            subCategories: '',
            pdfCourseTypeNames: '',
            pdfAreaNames: '',
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
            // 목록 재조회는 useUpsertGraduationRules의 invalidateQueries가 처리한다. (중복 요청 방지)
            onSuccess: () => {
              toast.success('졸업 규칙을 수정했어요.');
              clearDrafts();
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
    requirementSets,
    rules,
    isRulesLoading,
    isRulesError,
    selectedRuleTypeIds,
    selectedCourseTypes,
    selectedSetId,
    onRuleTypeToggle,
    onCourseTypeToggle,
    onSetChange: setSelectedSetId,
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
