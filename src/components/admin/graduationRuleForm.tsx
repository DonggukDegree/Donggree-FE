import { ADMIN_INPUT_CLASS, FieldLabel, SelectChevron, TextInput } from '@/components/admin/adminFormControls';
import GraduationRuleConfigFields from '@/components/admin/graduationRuleConfigFields';
import Button from '@/components/common/button';
import type { TAdminAreaType } from '@/types/admin/TGetAdminAreaTypes';
import type { TAdminRuleType } from '@/types/admin/TGetRuleTypes';
import type { TCourseType } from '@/types/course';

export type TGraduationRuleDraft = {
  clientId: string;
  id: number | null;
  ruleTypeId: string;
  ruleName: string;
  description: string;
  minCredits: string;
  minGpa: string;
  minCount: string;
  courseType: TCourseType | '';
  areaNames: string[];
  courseCodes: string;
  exemptEnglishLevels: string;
  requiredEnglishLevels: string;
  courseTypes: TCourseType[];
  targetCourseCodes: string;
  prerequisiteCourseCodes: string;
  conditionField: '' | 'englishLevel';
  conditionValue: string;
  exemptStudentTypes: string;
  requiredCourseSetsText: string;
};

export type TGraduationRuleDraftField = keyof TGraduationRuleDraft;
export type TGraduationRuleDraftValue = string | string[] | TCourseType[];

interface IGraduationRuleFormProps {
  areaTypes: TAdminAreaType[];
  ruleTypes: TAdminRuleType[];
  drafts: TGraduationRuleDraft[];
  isSaving: boolean;
  onAddNew: () => void;
  onRemove: (clientId: string) => void;
  onChange: (clientId: string, field: TGraduationRuleDraftField, value: TGraduationRuleDraftValue) => void;
  onSubmit: () => void;
}

const toRuleTypeLabel = (ruleType: TAdminRuleType) => {
  if (!ruleType.description) return ruleType.typeName;
  return `${ruleType.typeName} · ${ruleType.description}`;
};

interface IGraduationRuleFormRowProps {
  areaTypes: TAdminAreaType[];
  ruleTypes: TAdminRuleType[];
  draft: TGraduationRuleDraft;
  isSaving: boolean;
  onRemove: (clientId: string) => void;
  onChange: (clientId: string, field: TGraduationRuleDraftField, value: TGraduationRuleDraftValue) => void;
}

function GraduationRuleFormRow({
  areaTypes,
  ruleTypes,
  draft,
  isSaving,
  onRemove,
  onChange,
}: IGraduationRuleFormRowProps) {
  const selectedRuleType = ruleTypes.find((ruleType) => String(ruleType.id) === draft.ruleTypeId) ?? null;

  // clientId를 미리 바인딩한 변경 핸들러. 공통 필드와 설정 필드에서 공유한다.
  const update = (field: TGraduationRuleDraftField, value: TGraduationRuleDraftValue) => {
    onChange(draft.clientId, field, value);
  };

  return (
    <div className="rounded-xl border border-coolgray-10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-30 px-3 py-1 text-body-xs font-semibold text-primary-90">
            {draft.id === null ? '신규' : '수정'}
          </span>
          {draft.id !== null && <span className="text-body-s text-coolgray-60">ID {draft.id}</span>}
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => onRemove(draft.clientId)}
          className="rounded-full px-2 py-1 text-body-s text-coolgray-60 hover:text-primary-60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          삭제
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr]">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>규칙 종류</FieldLabel>
          <div className="relative">
            <select
              value={draft.ruleTypeId}
              disabled={isSaving}
              onChange={(event) => update('ruleTypeId', event.target.value)}
              className={`${ADMIN_INPUT_CLASS} appearance-none pr-8`}
            >
              <option value="">선택</option>
              {ruleTypes.map((ruleType) => (
                <option key={ruleType.id} value={ruleType.id}>
                  {toRuleTypeLabel(ruleType)}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>규칙명</FieldLabel>
          <TextInput
            value={draft.ruleName}
            disabled={isSaving}
            placeholder="총 취득학점이 130학점 이상이어야 합니다."
            onChange={(value) => update('ruleName', value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>설명</FieldLabel>
          <TextInput
            value={draft.description}
            disabled={isSaving}
            placeholder="총 취득학점 규칙"
            onChange={(value) => update('description', value)}
          />
        </label>
      </div>

      <GraduationRuleConfigFields
        selectedRuleType={selectedRuleType}
        draft={draft}
        areaTypes={areaTypes}
        isSaving={isSaving}
        onFieldChange={update}
      />
    </div>
  );
}

export default function GraduationRuleForm({
  areaTypes,
  ruleTypes,
  drafts,
  isSaving,
  onAddNew,
  onRemove,
  onChange,
  onSubmit,
}: IGraduationRuleFormProps) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-5 text-coolgray-90">졸업 규칙 수정</h2>
          <p className="mt-1 text-body-s text-coolgray-60">
            규칙 종류별 입력값을 채우면 프론트가 API 스키마에 맞는 ruleConfig를 조립합니다.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant={isSaving ? 'disabled' : 'outlined'}
            disabled={isSaving}
            onClick={onAddNew}
            className="w-20 py-3.5"
          >
            신규
          </Button>
          <Button
            variant={drafts.length > 0 && !isSaving ? 'primary' : 'disabled'}
            disabled={drafts.length === 0 || isSaving}
            onClick={onSubmit}
            className="w-28 py-3.5"
          >
            수정하기
          </Button>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-xl border border-coolgray-10 px-4 py-10 text-center text-body-m text-coolgray-60">
          수정할 규칙을 선택하거나 신규 행을 추가해주세요.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {drafts.map((draft) => (
            <GraduationRuleFormRow
              key={draft.clientId}
              areaTypes={areaTypes}
              ruleTypes={ruleTypes}
              draft={draft}
              isSaving={isSaving}
              onChange={onChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  );
}
