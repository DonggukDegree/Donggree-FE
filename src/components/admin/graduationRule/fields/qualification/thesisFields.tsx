/** [관리자 > 졸업 규칙] THESIS 설정 입력 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import MajorRoleSelect from '@/components/admin/graduationRule/fields/shared/majorRoleSelect';
import type { IRuleFieldsProps } from '@/components/admin/graduationRule/fields/shared/ruleFieldsProps';
import { ADMIN_INPUT_CLASS } from '@/constants/inputStyles';

export default function ThesisFields({
  draft,
  isSaving,
  onFieldChange,
}: Pick<IRuleFieldsProps, 'draft' | 'isSaving' | 'onFieldChange'>) {
  return (
    <div className="grid gap-3">
      <label className="flex flex-col gap-1.5 md:max-w-xl">
        <FieldLabel>규칙 적용 대상</FieldLabel>
        <MajorRoleSelect draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
        <span className="text-body-xs text-coolgray-60">
          신규 규칙의 기본값은 단일전공이며 하나 이상 반드시 선택합니다. 적용 대상이 없던 기존 논문·시험 규칙은
          단일전공과 복수전공자의 주전공 선택을 유지합니다.
        </span>
      </label>
      <p className="text-body-xs text-coolgray-60">
        필수 과목 세트를 <b>비워 두면</b> 성적표의 졸업논문·시험 심사 합격으로 판정합니다. 주전공 적용 시에는 주전공
        결과를, 복수전공자의 복수전공 적용 시에는 복수1 결과를 확인합니다. 채우면 해당 전공 역할의 과목 이수로
        판정합니다. 면제 학생유형은 두 경우 모두 우선 적용됩니다.
      </p>
      <p className="text-body-xs text-coolgray-60">
        면제 과목코드를 <b>비워 두면</b> 면제 학생유형은 이 규칙 전체를 면제받습니다. 채우면 <b>그 과목만</b> 이수한
        것으로 간주하고 나머지 과목은 그대로 요구합니다.
      </p>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>면제 학생유형</FieldLabel>
        <TextInput
          value={draft.exemptStudentTypes}
          disabled={isSaving}
          placeholder="학석사연계과정"
          onChange={(value) => onFieldChange('exemptStudentTypes', value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>면제 과목코드</FieldLabel>
        <TextInput
          value={draft.exemptCourseCodes}
          disabled={isSaving}
          placeholder="CSE4067, CSC4019, DAI*"
          onChange={(value) => onFieldChange('exemptCourseCodes', value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>필수 과목 세트</FieldLabel>
        <textarea
          value={draft.requiredCourseSetsText}
          disabled={isSaving}
          placeholder={'한 줄이 하나의 세트입니다.\n예: CSE4066,CSC4018 & CSE4067,CSC4019'}
          onChange={(event) => onFieldChange('requiredCourseSetsText', event.target.value)}
          className={`${ADMIN_INPUT_CLASS} min-h-24 resize-y`}
        />
        <span className="text-body-xs text-coolgray-60">
          쉼표(,)는 하나만 이수(OR), &amp;는 모두 이수(AND), 줄바꿈은 세트 중 하나 완성(OR)을 뜻합니다.
        </span>
      </label>
    </div>
  );
}
