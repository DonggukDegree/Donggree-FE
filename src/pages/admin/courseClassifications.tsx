import { useRef, useState } from 'react';
import { toast } from 'sonner';

import CourseClassificationFilters from '@/components/admin/courseClassificationFilters';
import type {
  TCourseClassificationDraft,
  TCourseClassificationFormState,
} from '@/components/admin/courseClassificationForm';
import CourseClassificationForm from '@/components/admin/courseClassificationForm';
import CourseClassificationTable from '@/components/admin/courseClassificationTable';
import useAdminAreaTypes from '@/hooks/admin/useAdminAreaTypes';
import useAdminCourseClassifications from '@/hooks/admin/useAdminCourseClassifications';
import useUpsertCourseClassifications from '@/hooks/admin/useUpsertCourseClassifications';
import { useModalStore } from '@/stores/modalStore';
import type { TAdminCourseClassification, TCourseClassificationFilters } from '@/types/admin/TGetCourseClassifications';
import type { TCourseClassificationUpsertItem } from '@/types/admin/TPutCourseClassifications';
import { COURSE_LABEL, type TCourseType } from '@/types/course';

const EMPTY_FORM: TCourseClassificationFormState = {
  id: null,
  courseCode: '',
  tag: '',
  studentYearStart: '',
  studentYearEnd: '',
  courseType: '',
  areaTypeId: '',
  subCategory: '',
  subjectDomain: '',
};

const optionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const parseYears = (value: string) => {
  const parsed = value
    .split(',')
    .map((year) => Number(year.trim()))
    .filter((year) => Number.isInteger(year) && year > 0);
  return Array.from(new Set(parsed));
};

const toDraft = (course: TAdminCourseClassification): TCourseClassificationDraft => ({
  clientId: `course-${course.id}`,
  id: course.id,
  courseCode: course.courseCode,
  tag: course.tag ?? '',
  studentYearStart: String(course.studentYearStart),
  studentYearEnd: String(course.studentYearEnd),
  courseType: course.courseType,
  areaTypeId: course.areaTypeId === null ? '' : String(course.areaTypeId),
  subCategory: course.subCategory ?? '',
  subjectDomain: course.subjectDomain ?? '',
});

const toPositiveInteger = (value: string) => {
  const parsed = Number(value.trim());
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

export default function AdminCourseClassifications() {
  const newDraftIndex = useRef(0);
  const openConfirm = useModalStore((state) => state.openConfirm);
  const [selectedAreaTypeIds, setSelectedAreaTypeIds] = useState<number[]>([]);
  const [selectedCourseTypes, setSelectedCourseTypes] = useState<TCourseType[]>([]);
  const [yearInput, setYearInput] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<TCourseClassificationFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [drafts, setDrafts] = useState<TCourseClassificationDraft[]>([]);

  const { data: areaTypes = [], isError: isAreaTypeError } = useAdminAreaTypes();
  const {
    data: courses = [],
    isPending: isCourseLoading,
    isError: isCourseError,
    refetch: refetchCourseClassifications,
  } = useAdminCourseClassifications(appliedFilters);
  const { mutate: upsertCourseClassifications, isPending: isSaving } = useUpsertCourseClassifications();

  const clearDrafts = () => {
    setSelectedIds(new Set());
    setDrafts([]);
  };

  const handleApplyFilters = () => {
    const years = parseYears(yearInput);
    clearDrafts();
    setAppliedFilters({
      ...(selectedAreaTypeIds.length > 0 ? { areaTypeIds: selectedAreaTypeIds } : {}),
      ...(selectedCourseTypes.length > 0 ? { courseTypes: selectedCourseTypes } : {}),
      ...(years.length > 0 ? { years } : {}),
    });
  };

  const handleResetFilters = () => {
    setSelectedAreaTypeIds([]);
    setSelectedCourseTypes([]);
    setYearInput('');
    setAppliedFilters({});
    clearDrafts();
  };

  const handleToggleAll = (checked: boolean) => {
    const next = checked ? new Set(courses.map((course) => course.id)) : new Set<number>();
    setSelectedIds(next);
    setDrafts((prev) => {
      const newDrafts = prev.filter((draft) => draft.id === null);
      if (!checked) return newDrafts;

      const existingDraftIds = new Set(prev.filter((draft) => draft.id !== null).map((draft) => draft.id));
      const visibleDrafts = courses
        .filter((course) => !existingDraftIds.has(course.id))
        .map((course) => toDraft(course));
      return [...prev, ...visibleDrafts];
    });
  };

  const handleToggleRow = (courseId: number, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(courseId);
    } else {
      next.delete(courseId);
    }
    setSelectedIds(next);
    setDrafts((prev) => {
      if (!checked) return prev.filter((draft) => draft.id !== courseId);

      const selectedCourse = courses.find((course) => course.id === courseId);
      if (!selectedCourse || prev.some((draft) => draft.id === courseId)) return prev;
      return [...prev, toDraft(selectedCourse)];
    });
  };

  const handleAddNewDraft = () => {
    const clientId = `new-${newDraftIndex.current++}`;
    setDrafts((prev) => [...prev, { ...EMPTY_FORM, clientId }]);
  };

  const handleRemoveDraft = (clientId: string) => {
    const removedDraft = drafts.find((draft) => draft.clientId === clientId);
    if (removedDraft?.id !== null && removedDraft?.id !== undefined) {
      const nextSelectedIds = new Set(selectedIds);
      nextSelectedIds.delete(removedDraft.id);
      setSelectedIds(nextSelectedIds);
    }
    setDrafts((prev) => prev.filter((draft) => draft.clientId !== clientId));
  };

  const handleDraftChange = (clientId: string, field: keyof TCourseClassificationFormState, value: string) => {
    setDrafts((prev) => prev.map((draft) => (draft.clientId === clientId ? { ...draft, [field]: value } : draft)));
  };

  const buildUpsertItem = (
    draft: TCourseClassificationDraft,
    index: number,
  ): TCourseClassificationUpsertItem | null => {
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

  const handleSubmit = () => {
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
    const itemSummaries = items.map((item, index) => ({
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
          {itemSummaries.map(({ clientId, item }) => {
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
            onSuccess: () => {
              toast.success('과목 분류를 수정했어요.');
              clearDrafts();
              refetchCourseClassifications();
            },
          },
        );
      },
    });
  };

  return (
    <main className="flex-1 bg-primary-30/30 px-10 py-12">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-3 text-coolgray-90">과목 관리</h1>
          <p className="text-body-m text-coolgray-90">
            과목 분류를 필터로 조회하고, 선택한 분류를 수정하거나 새 분류를 추가합니다.
          </p>
        </div>

        {isAreaTypeError && (
          <div className="rounded-2xl border border-alert/30 bg-white px-6 py-4 text-body-m text-alert">
            이수 영역 목록을 불러오지 못했습니다. 영역 필터와 영역 선택 없이 작업해주세요.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="min-h-72 rounded-2xl border border-primary-60/20 bg-white p-8 shadow-sm flex flex-col gap-2">
            <p className="text-body-l text-primary-90">
              과목 관리는 매년 바뀌는 학업이수 가이드의 과목에 대한 이수 영역 구분을 관리하는 데이터베이스입니다.
            </p>
            <p className="text-body-m text-coolgray-90">
              PDF에서 표시되는 이수 영역이 수강년도에 의해 결정되는 것과 달리, 졸업 판정은 학생의 입학년도를 기준으로
              진행되기 때문에 PDF 상 이수 영역을 다시 분류하는 작업이 필요합니다.
            </p>
            <p className="text-body-m text-coolgray-90">
              따라서 해당 페이지에서는 학업 이수 가이드를 기준으로 공통교양이나 학문기초 과목의 이수 영역을 적용년도에
              대해 분류하고 관리합니다.
            </p>
            <p className="text-body-m text-primary-90">
              * 수정 시 DB에 즉시 반영되므로, 반드시 수정 내용을 검토한 뒤 저장해주세요.
            </p>
          </div>

          <CourseClassificationFilters
            areaTypes={areaTypes}
            selectedAreaTypeIds={selectedAreaTypeIds}
            selectedCourseTypes={selectedCourseTypes}
            yearInput={yearInput}
            onAreaTypeToggle={(areaTypeId) =>
              setSelectedAreaTypeIds((prev) =>
                prev.includes(areaTypeId) ? prev.filter((id) => id !== areaTypeId) : [...prev, areaTypeId],
              )
            }
            onCourseTypeToggle={(courseType) =>
              setSelectedCourseTypes((prev) =>
                prev.includes(courseType) ? prev.filter((type) => type !== courseType) : [...prev, courseType],
              )
            }
            onYearInputChange={setYearInput}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </div>

        <CourseClassificationForm
          areaTypes={areaTypes}
          drafts={drafts}
          isSaving={isSaving}
          onChange={handleDraftChange}
          onAddNew={handleAddNewDraft}
          onRemove={handleRemoveDraft}
          onSubmit={handleSubmit}
        />

        <CourseClassificationTable
          courses={courses}
          selectedIds={selectedIds}
          isLoading={isCourseLoading}
          isError={isCourseError}
          onToggleAll={handleToggleAll}
          onToggleRow={handleToggleRow}
        />
      </div>
    </main>
  );
}
