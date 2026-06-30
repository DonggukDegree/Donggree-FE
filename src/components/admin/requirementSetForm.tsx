import type { ReactNode } from 'react';

import { ADMIN_COMPACT_INPUT_CLASS, ADMIN_INPUT_CLASS } from '@/components/admin/adminFormControls';
import Button from '@/components/common/button';
import type { TAdminCollege, TAdminDepartment } from '@/types/admin/TGetAcademicOrganizations';
import type { TAdminRequirementSetSummary } from '@/types/admin/TRequirementSets';

export type TRequirementSetFormState = {
  id: number | null;
  departmentId: number | null;
  collegeName: string;
  departmentName: string;
  yearStart: string;
  yearEnd: string;
  version: string;
  description: string;
  sheetImageUrl: string;
  active: boolean;
};

interface IRequirementSetFormProps {
  colleges: TAdminCollege[];
  departments: TAdminDepartment[];
  sets: TAdminRequirementSetSummary[];
  selectedRuleCount: number;
  form: TRequirementSetFormState;
  isSaving: boolean;
  isLoadingDetail: boolean;
  onChange: (field: keyof TRequirementSetFormState, value: string | boolean | number | null) => void;
  onNew: () => void;
  onLoadSet: (setId: number) => void;
  onSubmit: () => void;
  // 버전·활성 정책 콜아웃 아래에 한 줄로 노출할 졸업 세트 필터 슬롯. (인라인 형태의 RequirementSetFilters)
  filterSlot?: ReactNode;
}

const INPUT_CLASS = ADMIN_INPUT_CLASS;

export default function RequirementSetForm({
  colleges,
  departments,
  sets,
  selectedRuleCount,
  form,
  isSaving,
  isLoadingDetail,
  onChange,
  onNew,
  onLoadSet,
  onSubmit,
  filterSlot,
}: IRequirementSetFormProps) {
  const isEditMode = form.id !== null;

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-5 text-coolgray-90">졸업 세트 관리</h2>
          <p className="mt-1 text-body-s text-coolgray-60">
            아래 졸업 규칙 목록에서 선택한 규칙 {selectedRuleCount}건으로 요건 세트를 저장합니다.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant={isSaving ? 'disabled' : 'outlined'}
            disabled={isSaving}
            onClick={onNew}
            className="w-20 py-3.5"
          >
            신규
          </Button>
          <Button
            variant={selectedRuleCount > 0 && !isSaving ? 'primary' : 'disabled'}
            disabled={selectedRuleCount === 0 || isSaving}
            onClick={onSubmit}
            className="w-28 py-3.5"
          >
            저장하기
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-primary-30/50 px-5 py-4 text-body-s text-coolgray-90">
        <p className="font-semibold text-primary-90">버전·활성 정책</p>
        <p className="mt-1">
          버전은 서버가 자동 채번하므로 입력하지 않습니다. 활성 세트는 같은 학과에서 적용년도가 겹치면 저장이 거부되며,
          비활성 세트끼리는 겹쳐도 함께 둘 수 있습니다.
        </p>
      </div>

      {/* 졸업 세트 필터 + 기존 세트 불러오기: 본문 입력값과 구분되도록 primary-30 음영·테두리 박스로 묶고, 불러오기는 오른쪽에 둔다. */}
      <div className="flex flex-col gap-2 rounded-xl border border-primary-60/20 bg-primary-30 p-4">
        <span className="text-body-s font-semibold text-primary-90">졸업 세트 필터</span>
        <div className="flex flex-wrap items-end gap-4">
          {filterSlot}
          <label className="ml-auto flex flex-col gap-1">
            <span className="text-body-xs font-semibold text-coolgray-60">기존 세트 불러오기</span>
            <select
              value={form.id ?? ''}
              disabled={isSaving || isLoadingDetail}
              onChange={(event) => {
                if (!event.target.value) return;
                onLoadSet(Number(event.target.value));
              }}
              className={`${ADMIN_COMPACT_INPUT_CLASS} w-64`}
            >
              <option value="">선택</option>
              {sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.departmentName} · {set.yearStart}-{set.yearEnd} · v{set.version}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
        <label className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">단과대</span>
          <input
            value={form.collegeName}
            disabled={isSaving || isEditMode}
            list="admin-college-options"
            placeholder="예: 첨단융합대학"
            onChange={(event) => onChange('collegeName', event.target.value)}
            className={INPUT_CLASS}
          />
          <datalist id="admin-college-options">
            {colleges.map((college) => (
              <option key={college.id} value={college.collegeName} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">학과</span>
          <input
            value={form.departmentName}
            disabled={isSaving || isEditMode}
            list="admin-department-options"
            placeholder="예: 컴퓨터·AI학부"
            onChange={(event) => onChange('departmentName', event.target.value)}
            className={INPUT_CLASS}
          />
          <datalist id="admin-department-options">
            {departments.map((department) => (
              <option key={department.id} value={department.departmentName} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">버전</span>
          <input value={form.version || '자동 채번'} disabled className={INPUT_CLASS} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">적용 시작년도</span>
          <input
            value={form.yearStart}
            disabled={isSaving}
            inputMode="numeric"
            placeholder="2023"
            onChange={(event) => onChange('yearStart', event.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">적용 종료년도</span>
          <input
            value={form.yearEnd}
            disabled={isSaving}
            inputMode="numeric"
            placeholder="2023"
            onChange={(event) => onChange('yearEnd', event.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex items-end gap-2 pb-2">
          <input
            type="checkbox"
            checked={form.active}
            disabled={isSaving}
            onChange={(event) => onChange('active', event.target.checked)}
            className="h-4 w-4 accent-primary-60"
          />
          <span className="text-body-s font-semibold text-coolgray-90">활성 세트</span>
        </label>

        <label className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-body-s font-semibold text-coolgray-90">설명</span>
          <input
            value={form.description}
            disabled={isSaving}
            placeholder="컴퓨터·AI학부 23학번 일반과정 졸업요건"
            onChange={(event) => onChange('description', event.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-coolgray-90">시트 이미지 URL</span>
          <input
            value={form.sheetImageUrl}
            disabled={isSaving}
            placeholder="비워두면 시트 이미지 없음"
            onChange={(event) => onChange('sheetImageUrl', event.target.value)}
            className={INPUT_CLASS}
          />
        </label>
      </div>
    </section>
  );
}
