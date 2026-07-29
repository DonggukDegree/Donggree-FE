/**
 * [관리자 > 과목 관리] 화면 컨트롤러 훅
 * 페이지(pages/admin/courseClassifications.tsx)는 이 훅이 돌려주는 값만 컴포넌트에 꽂아 넣고,
 * 필터 상태 · 수정 대상(draft) 선택 · 저장 전 검증 · 확인 모달 · 저장은 전부 여기서 담당한다.
 * (졸업 요건 관리의 use*Editor 훅들과 같은 구조)
 */
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import type {
  TCourseClassificationDraft,
  TCourseClassificationFormState,
} from '@/components/admin/courseClassification/courseClassificationForm';
import useUpsertCourseClassifications from '@/hooks/admin/mutations/useUpsertCourseClassifications';
import useAdminAreaTypes from '@/hooks/admin/queries/useAdminAreaTypes';
import useAdminCourseClassifications from '@/hooks/admin/queries/useAdminCourseClassifications';
import { useModalStore } from '@/stores/modalStore';
import type { TCourseClassificationFilters } from '@/types/admin/TGetCourseClassifications';
import type { TCourseClassificationUpsertItem } from '@/types/admin/TPutCourseClassifications';
import { COURSE_LABEL, type TCourseType } from '@/types/course';
import {
  EMPTY_COURSE_CLASSIFICATION_DRAFT,
  optionalText,
  parseYears,
  toCourseClassificationDraft,
  toggleCourseType,
  toggleNumber,
  toPositiveInteger,
} from '@/utils/adminForm';

// 폼 draft 한 건을 업서트 요청 항목으로 변환한다. 검증 실패 시 toast 후 null.
const buildUpsertItem = (draft: TCourseClassificationDraft, index: number): TCourseClassificationUpsertItem | null => {
  const rowLabel = `${index + 1}번째 행`;
  const courseCode = draft.courseCode.trim();
  const studentYearStart = toPositiveInteger(draft.studentYearStart);
  const studentYearEnd = toPositiveInteger(draft.studentYearEnd);

  if (!courseCode) {
    toast.error(`${rowLabel}의 과목코드를 입력해주세요.`);
    return null;
  }
  if (!studentYearStart || !studentYearEnd) {
    toast.error(`${rowLabel}의 적용년도는 양수 숫자로 입력해주세요.`);
    return null;
  }
  if (studentYearStart > studentYearEnd) {
    toast.error(`${rowLabel}의 적용 시작년도는 종료년도보다 클 수 없습니다.`);
    return null;
  }
  if (!draft.courseType) {
    toast.error(`${rowLabel}의 이수구분을 선택해주세요.`);
    return null;
  }

  // 이수 영역은 선택 입력이지만, 값을 넣었는데 숫자가 아니면 잘못 입력한 것으로 본다.
  const areaTypeId = draft.areaTypeId ? toPositiveInteger(draft.areaTypeId) : null;
  if (draft.areaTypeId && !areaTypeId) {
    toast.error(`${rowLabel}의 이수 영역 값이 올바르지 않습니다.`);
    return null;
  }

  return {
    id: draft.id,
    courseCode,
    tag: optionalText(draft.tag),
    studentYearStart,
    studentYearEnd,
    courseType: draft.courseType,
    areaTypeId,
    subCategory: optionalText(draft.subCategory),
    subjectDomain: optionalText(draft.subjectDomain),
  };
};

export default function useCourseClassificationEditor() {
  const newDraftIndex = useRef(0);
  const openConfirm = useModalStore((state) => state.openConfirm);

  // 필터는 "입력 중인 값"과 "적용된 값"을 나눠 둔다. 적용된 값만 query key에 들어가므로
  // 사용자가 선택하는 도중에는 조회가 발생하지 않는다.
  const [selectedAreaTypeIds, setSelectedAreaTypeIds] = useState<number[]>([]);
  const [selectedCourseTypes, setSelectedCourseTypes] = useState<TCourseType[]>([]);
  const [yearInput, setYearInput] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<TCourseClassificationFilters>({});
  // 목록에서 체크한 행(id)과, 그 행들을 편집 중인 폼 draft.
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [drafts, setDrafts] = useState<TCourseClassificationDraft[]>([]);

  const { data: areaTypes = [], isError: isAreaTypeError } = useAdminAreaTypes();
  const {
    data: courses = [],
    isPending: isCourseLoading,
    isError: isCourseError,
  } = useAdminCourseClassifications(appliedFilters);
  const { mutate: upsertCourseClassifications, isPending: isSaving } = useUpsertCourseClassifications();

  const clearDrafts = () => {
    setSelectedIds(new Set());
    setDrafts([]);
  };

  const onAreaTypeToggle = (areaTypeId: number) => {
    setSelectedAreaTypeIds((prev) => toggleNumber(prev, areaTypeId));
  };

  const onCourseTypeToggle = (courseType: TCourseType) => {
    setSelectedCourseTypes((prev) => toggleCourseType(prev, courseType));
  };

  // 필터를 다시 적용하면 목록이 바뀌므로, 화면에 없는 행을 편집 중인 상태가 남지 않도록 draft를 비운다.
  const applyFilters = () => {
    const years = parseYears(yearInput);
    clearDrafts();
    setAppliedFilters({
      ...(selectedAreaTypeIds.length > 0 ? { areaTypeIds: selectedAreaTypeIds } : {}),
      ...(selectedCourseTypes.length > 0 ? { courseTypes: selectedCourseTypes } : {}),
      ...(years.length > 0 ? { years } : {}),
    });
  };

  const resetFilters = () => {
    setSelectedAreaTypeIds([]);
    setSelectedCourseTypes([]);
    setYearInput('');
    setAppliedFilters({});
    clearDrafts();
  };

  // 목록의 "전체 선택". 신규로 추가한 draft(id === null)는 유지하고, 기존 행만 추가/제거한다.
  const selectRows = (checked: boolean) => {
    setSelectedIds(checked ? new Set(courses.map((course) => course.id)) : new Set<number>());
    setDrafts((prev) => {
      const newDrafts = prev.filter((draft) => draft.id === null);
      if (!checked) return newDrafts;

      const existingDraftIds = new Set(prev.filter((draft) => draft.id !== null).map((draft) => draft.id));
      const addedDrafts = courses
        .filter((course) => !existingDraftIds.has(course.id))
        .map((course) => toCourseClassificationDraft(course));
      return [...prev, ...addedDrafts];
    });
  };

  // 목록의 행 하나를 체크/해제. 체크하면 폼에 편집 행이 생기고, 해제하면 사라진다.
  const selectRow = (courseId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(courseId);
      } else {
        next.delete(courseId);
      }
      return next;
    });
    setDrafts((prev) => {
      if (!checked) return prev.filter((draft) => draft.id !== courseId);

      const selectedCourse = courses.find((course) => course.id === courseId);
      if (!selectedCourse || prev.some((draft) => draft.id === courseId)) return prev;
      return [...prev, toCourseClassificationDraft(selectedCourse)];
    });
  };

  const addDraft = () => {
    const clientId = `new-course-${newDraftIndex.current++}`;
    setDrafts((prev) => [...prev, { ...EMPTY_COURSE_CLASSIFICATION_DRAFT, clientId }]);
  };

  // 폼에서 행을 지우면 목록의 체크도 함께 풀어 준다. (신규 행은 체크 대상이 아니므로 그냥 제거)
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

  const changeDraft = (clientId: string, field: keyof TCourseClassificationFormState, value: string) => {
    setDrafts((prev) => prev.map((draft) => (draft.clientId === clientId ? { ...draft, [field]: value } : draft)));
  };

  // 저장: 전체 draft를 검증해 하나라도 실패하면 중단하고, 통과하면 확인 모달을 띄운다.
  const submit = () => {
    if (drafts.length === 0) {
      toast.error('수정하거나 추가할 과목을 먼저 선택해주세요.');
      return;
    }

    const items: TCourseClassificationUpsertItem[] = [];
    for (const [index, draft] of drafts.entries()) {
      const item = buildUpsertItem(draft, index);
      if (!item) return;
      items.push(item);
    }

    const createCount = items.filter((item) => item.id === null).length;
    const updateCount = items.length - createCount;
    // 모달 목록의 React key로 draft의 clientId를 그대로 쓴다. (과목코드는 중복될 수 있음)
    const summaries = items.map((item, index) => ({
      clientId: drafts[index]?.clientId ?? item.courseCode,
      item,
    }));

    openConfirm({
      title: '과목 분류 수정',
      action: `총 ${items.length}건 저장 (수정 ${updateCount}건, 신규 ${createCount}건)`,
      description: '이 작업은 관리자 커리큘럼 데이터에 즉시 반영됩니다. 내용을 확인한 뒤 저장해주세요.',
      confirmText: '수정하기',
      cancelText: '취소하기',
      details: (
        <div className="flex max-h-52 flex-col gap-2 overflow-y-auto text-body-s">
          {summaries.map(({ clientId, item }) => {
            const areaName = areaTypes.find((areaType) => areaType.id === item.areaTypeId)?.areaName ?? '없음';
            return (
              <div key={clientId} className="rounded-lg bg-white px-4 py-3">
                <p className="font-semibold text-coolgray-90">
                  {item.id === null ? '신규' : `ID ${item.id}`} · {item.courseCode}
                </p>
                <p className="mt-1 text-coolgray-60">
                  {item.tag ?? '-'} · {item.studentYearStart}-{item.studentYearEnd} · {COURSE_LABEL[item.courseType]} ·{' '}
                  {areaName}
                </p>
              </div>
            );
          })}
        </div>
      ),
      onConfirm: () => {
        upsertCourseClassifications(
          { items },
          {
            // 목록 재조회는 useUpsertCourseClassifications의 invalidateQueries가 처리한다. (중복 요청 방지)
            onSuccess: () => {
              toast.success('과목 분류를 수정했어요.');
              clearDrafts();
            },
          },
        );
      },
    });
  };

  return {
    areaTypes,
    isAreaTypeError,
    courses,
    isCourseLoading,
    isCourseError,
    selectedAreaTypeIds,
    selectedCourseTypes,
    yearInput,
    onAreaTypeToggle,
    onCourseTypeToggle,
    onYearInputChange: setYearInput,
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
