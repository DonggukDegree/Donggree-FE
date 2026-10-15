/** [관리자 > 졸업 규칙] MIN_CREDITS 설정 입력 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import MultiSelectDropdown from '@/components/admin/common/multiSelectDropdown';
import { TEACHING_AREA_OPTIONS } from '@/components/admin/graduationRule/fields/shared/fieldOptions';
import MajorRoleSelect from '@/components/admin/graduationRule/fields/shared/majorRoleSelect';
import type { IRuleFieldsProps } from '@/components/admin/graduationRule/fields/shared/ruleFieldsProps';
import Button from '@/components/common/inputs/button';
import SelectChevron from '@/components/common/inputs/selectChevron';
import { ADMIN_INPUT_CLASS, SELECT_RESET_CLASS } from '@/constants/inputStyles';
import type { TCreditAdjustmentDraft, TGraduationRuleDraft } from '@/types/admin/forms/graduationRuleForm';
import { COURSE_LABEL, COURSE_TYPES } from '@/types/course';

export default function MinCreditsFields({
  draft,
  selectedRuleType,
  areaTypes,
  isSaving,
  onFieldChange,
}: Pick<IRuleFieldsProps, 'draft' | 'selectedRuleType' | 'areaTypes' | 'isSaving' | 'onFieldChange'>) {
  const areaNameOptions = [
    ...areaTypes.map((areaType) => ({ value: areaType.areaName, label: areaType.areaName })),
    ...TEACHING_AREA_OPTIONS.filter((option) => !areaTypes.some((areaType) => areaType.areaName === option.value)),
  ];
  const toggleAreaName = (areaName: string) =>
    onFieldChange(
      'areaNames',
      draft.areaNames.includes(areaName)
        ? draft.areaNames.filter((value) => value !== areaName)
        : [...draft.areaNames, areaName],
    );
  return (
    <div className="flex flex-col gap-3">
      {selectedRuleType.courseType === 'FIRST_MAJOR' && (
        <label className="flex max-w-xs flex-col gap-1.5">
          <FieldLabel>학점 집계 기준</FieldLabel>
          <select
            value={draft.creditSource}
            disabled={isSaving}
            onChange={(event) =>
              onFieldChange('creditSource', event.target.value as TGraduationRuleDraft['creditSource'])
            }
            className={`${ADMIN_INPUT_CLASS} ${SELECT_RESET_CLASS}`}
          >
            <option value="">수강 과목에서 집계</option>
            <option value="TEACHING_SUMMARY">PDF 교직 요약 학점</option>
          </select>
        </label>
      )}
      {draft.creditSource === 'TEACHING_SUMMARY' && selectedRuleType.courseType === 'FIRST_MAJOR' ? (
        <>
          <p className="text-body-xs text-coolgray-60">
            PDF 하단의 직필·직선 합계 학점을 사용합니다. 교직 영역별 학점 기준과는 별도로 설정할 수 있습니다.
          </p>
          <label className="flex max-w-xs flex-col gap-1.5">
            <FieldLabel>최소 교직 학점</FieldLabel>
            <TextInput
              value={draft.minCredits}
              disabled={isSaving}
              placeholder="22"
              onChange={(value) => onFieldChange('minCredits', value)}
            />
          </label>
          <label className="flex w-full flex-col gap-1.5">
            <FieldLabel>규칙 적용 대상</FieldLabel>
            <MajorRoleSelect draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
          </label>
        </>
      ) : (
        <>
          <p className="text-body-xs text-coolgray-60">
            채운 조건을 <b>모두 만족하는</b> 과목만 집계합니다(선택자 간 AND). 한 칸에 콤마로 여러 값을 넣으면 그중{' '}
            <b>하나만 맞아도</b> 됩니다(값 사이 OR). <b>비운 칸은 제한 없음</b>입니다. 임계값(최소 학점 · 최소 과목
            수)은 지정한 것을 모두 충족해야 하며 최소 하나는 필요합니다.
          </p>
          <label className="flex w-full flex-col gap-1.5">
            <FieldLabel>규칙 적용 대상</FieldLabel>
            <MajorRoleSelect draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
            <span className="text-body-xs text-coolgray-60">
              어떤 학생의 어느 전공에 적용할지를 정합니다. 기본값은 단일전공이며 하나 이상 반드시 선택합니다.
            </span>
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <FieldLabel>이수구분</FieldLabel>
              <div className="relative">
                <select
                  value={draft.courseType}
                  disabled={isSaving}
                  onChange={(event) =>
                    onFieldChange('courseType', event.target.value as TGraduationRuleDraft['courseType'])
                  }
                  className={`${ADMIN_INPUT_CLASS} ${SELECT_RESET_CLASS}`}
                >
                  <option value="">지정 안 함</option>
                  {COURSE_TYPES.map((courseType) => (
                    <option key={courseType} value={courseType}>
                      {COURSE_LABEL[courseType]}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>영역명 (선택자)</FieldLabel>
              <MultiSelectDropdown
                options={areaNameOptions}
                selectedValues={draft.areaNames}
                onToggle={toggleAreaName}
                allLabel="제한 없음"
                disabled={isSaving}
              />
              <span className="text-body-xs text-coolgray-60">
                제1전공 교직 과목 기준은 교직선택(직선) 또는 교직필수(직필) 영역으로 선택할 수 있습니다.
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>소분류 (선택자)</FieldLabel>
              <TextInput
                value={draft.subCategories}
                disabled={isSaving}
                placeholder="실험, 개론"
                onChange={(value) => onFieldChange('subCategories', value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>PDF 이수구분 (선택자)</FieldLabel>
              <TextInput
                value={draft.pdfCourseTypeNames}
                disabled={isSaving}
                placeholder="공교, 전공, 전필, 직선, 직필"
                onChange={(value) => onFieldChange('pdfCourseTypeNames', value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>PDF 영역 (선택자)</FieldLabel>
              <TextInput
                value={draft.pdfAreaNames}
                disabled={isSaving}
                placeholder="기초, 전문"
                onChange={(value) => onFieldChange('pdfAreaNames', value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>학수번호 (선택자)</FieldLabel>
              <TextInput
                value={draft.courseCodes}
                disabled={isSaving}
                placeholder="DAI* (끝의 *는 접두어 일치)"
                onChange={(value) => onFieldChange('courseCodes', value)}
              />
            </label>
          </div>

          {/* 임계값은 선택자와 성격이 달라 줄을 나눠 둔다. */}
          <div className="grid gap-3 border-t border-coolgray-20 pt-3 md:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <FieldLabel>최소 학점 (임계값)</FieldLabel>
              <TextInput
                value={draft.minCredits}
                disabled={isSaving}
                placeholder="17"
                onChange={(value) => onFieldChange('minCredits', value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>최소 과목 수 (임계값)</FieldLabel>
              <TextInput
                value={draft.minCount}
                disabled={isSaving}
                placeholder="1"
                onChange={(value) => onFieldChange('minCount', value)}
              />
            </label>
          </div>
          <div className="flex flex-col gap-3 border-t border-coolgray-20 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <FieldLabel>대체 이수 시 목표학점 감면 (선택)</FieldLabel>
                <p className="mt-1 text-body-xs text-coolgray-60">
                  원 필수과목은 미이수이고 대체과목을 이수하면 지정 학점만큼 목표를 낮춥니다.
                </p>
              </div>
              <Button
                type="button"
                variant="outlined"
                disabled={isSaving}
                className="px-3 py-2 text-body-xs"
                onClick={() =>
                  onFieldChange('creditAdjustments', [
                    ...draft.creditAdjustments,
                    {
                      clientId: crypto.randomUUID(),
                      requiredCourseCodes: '',
                      replacementCourseCodes: '',
                      credits: '',
                    },
                  ])
                }
              >
                + 행 추가
              </Button>
            </div>
            {draft.creditAdjustments.length === 0 ? (
              <p className="text-body-xs text-coolgray-50">대체 인정 규칙이 있으면 행을 추가해 입력하세요.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {draft.creditAdjustments.map((adjustment) => {
                  const updateAdjustment = (field: keyof TCreditAdjustmentDraft, value: string) => {
                    onFieldChange(
                      'creditAdjustments',
                      draft.creditAdjustments.map((row) =>
                        row.clientId === adjustment.clientId ? { ...row, [field]: value } : row,
                      ),
                    );
                  };

                  return (
                    <div
                      key={adjustment.clientId}
                      className="grid items-end gap-3 rounded-lg bg-white p-3 md:grid-cols-[1fr_1fr_8rem_auto]"
                    >
                      <label className="flex flex-col gap-1.5">
                        <FieldLabel>요구 과목 코드</FieldLabel>
                        <TextInput
                          value={adjustment.requiredCourseCodes}
                          disabled={isSaving}
                          placeholder="예: ABC1001"
                          onChange={(value) => updateAdjustment('requiredCourseCodes', value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <FieldLabel>대체 가능 과목 코드</FieldLabel>
                        <TextInput
                          value={adjustment.replacementCourseCodes}
                          disabled={isSaving}
                          placeholder="여러 과목은 쉼표로 구분"
                          onChange={(value) => updateAdjustment('replacementCourseCodes', value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <FieldLabel>감면 학점</FieldLabel>
                        <TextInput
                          value={adjustment.credits}
                          disabled={isSaving}
                          placeholder="3"
                          onChange={(value) => updateAdjustment('credits', value)}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="outlined"
                        disabled={isSaving}
                        className="px-3 py-2 text-body-xs"
                        onClick={() =>
                          onFieldChange(
                            'creditAdjustments',
                            draft.creditAdjustments.filter((row) => row.clientId !== adjustment.clientId),
                          )
                        }
                      >
                        삭제
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <span className="text-body-xs text-coolgray-60">
              대체 과목 코드는 쉼표로 여러 개 입력할 수 있습니다. 필수과목 규칙에도 동일한 대체 과목 코드를 등록해야
              필수 이수로 인정됩니다.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
