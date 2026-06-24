import { ADMIN_INPUT_CLASS, FieldLabel, SelectChevron, TextInput } from '@/components/admin/adminFormControls';
import type {
  TGraduationRuleDraft,
  TGraduationRuleDraftField,
  TGraduationRuleDraftValue,
} from '@/components/admin/graduationRuleForm';
import MultiSelectDropdown from '@/components/admin/multiSelectDropdown';
import type { TAdminAreaType } from '@/types/admin/TGetAdminAreaTypes';
import type { TAdminRuleType } from '@/types/admin/TGetRuleTypes';
import { COURSE_LABEL, COURSE_TYPES, type TCourseType } from '@/types/course';

const COURSE_TYPE_OPTIONS = COURSE_TYPES.map((courseType) => ({ value: courseType, label: COURSE_LABEL[courseType] }));

interface IGraduationRuleConfigFieldsProps {
  selectedRuleType: TAdminRuleType | null;
  draft: TGraduationRuleDraft;
  areaTypes: TAdminAreaType[];
  isSaving: boolean;
  // 이미 clientId가 바인딩된 변경 핸들러. 필드와 값만 넘기면 된다.
  onFieldChange: (field: TGraduationRuleDraftField, value: TGraduationRuleDraftValue) => void;
}

// 규칙 종류(typeName)에 따라 달라지는 ruleConfig 입력칸. 종류별로 필요한 필드만 노출한다.
export default function GraduationRuleConfigFields({
  selectedRuleType,
  draft,
  areaTypes,
  isSaving,
  onFieldChange,
}: IGraduationRuleConfigFieldsProps) {
  const areaNameOptions = areaTypes.map((areaType) => ({ value: areaType.areaName, label: areaType.areaName }));

  const toggleAreaName = (areaName: string) => {
    onFieldChange(
      'areaNames',
      draft.areaNames.includes(areaName)
        ? draft.areaNames.filter((value) => value !== areaName)
        : [...draft.areaNames, areaName],
    );
  };

  const toggleCourseType = (courseType: TCourseType) => {
    onFieldChange(
      'courseTypes',
      draft.courseTypes.includes(courseType)
        ? draft.courseTypes.filter((value) => value !== courseType)
        : [...draft.courseTypes, courseType],
    );
  };

  return (
    <div className="mt-4 rounded-xl bg-primary-30/40 p-4">
      {!selectedRuleType && (
        <p className="text-body-s text-coolgray-60">규칙 종류를 선택하면 설정 입력칸이 나타납니다.</p>
      )}

      {selectedRuleType?.typeName === 'TOTAL_CREDITS' && (
        <label className="flex max-w-xs flex-col gap-1.5">
          <FieldLabel>최소 취득학점</FieldLabel>
          <TextInput
            value={draft.minCredits}
            disabled={isSaving}
            placeholder="130"
            onChange={(value) => onFieldChange('minCredits', value)}
          />
        </label>
      )}

      {selectedRuleType?.typeName === 'GPA' && (
        <label className="flex max-w-xs flex-col gap-1.5">
          <FieldLabel>최소 평점평균</FieldLabel>
          <TextInput
            value={draft.minGpa}
            disabled={isSaving}
            placeholder="2.0"
            onChange={(value) => onFieldChange('minGpa', value)}
          />
        </label>
      )}

      {selectedRuleType?.typeName === 'MIN_AREA_CREDITS' && (
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <FieldLabel>이수구분</FieldLabel>
            <div className="relative">
              <select
                value={draft.courseType}
                disabled={isSaving}
                onChange={(event) => onFieldChange('courseType', event.target.value)}
                className={`${ADMIN_INPUT_CLASS} appearance-none pr-8`}
              >
                <option value="">선택</option>
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
            <FieldLabel>영역명</FieldLabel>
            <MultiSelectDropdown
              options={areaNameOptions}
              selectedValues={draft.areaNames}
              onToggle={toggleAreaName}
              allLabel="전체 영역"
              disabled={isSaving}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>최소 학점</FieldLabel>
            <TextInput
              value={draft.minCredits}
              disabled={isSaving}
              placeholder="17"
              onChange={(value) => onFieldChange('minCredits', value)}
            />
          </label>
        </div>
      )}

      {selectedRuleType?.typeName === 'REQUIRED_COURSE' && (
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <FieldLabel>필수 과목코드</FieldLabel>
            <TextInput
              value={draft.courseCodes}
              disabled={isSaving}
              placeholder="RGC0003"
              onChange={(value) => onFieldChange('courseCodes', value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>면제 영어레벨</FieldLabel>
            <TextInput
              value={draft.exemptEnglishLevels}
              disabled={isSaving}
              placeholder="S0, S4"
              onChange={(value) => onFieldChange('exemptEnglishLevels', value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>적용 영어레벨</FieldLabel>
            <TextInput
              value={draft.requiredEnglishLevels}
              disabled={isSaving}
              placeholder="S4"
              onChange={(value) => onFieldChange('requiredEnglishLevels', value)}
            />
          </label>
        </div>
      )}

      {selectedRuleType?.typeName === 'ENGLISH_COURSE' && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <FieldLabel>대상 이수구분</FieldLabel>
            <MultiSelectDropdown
              options={COURSE_TYPE_OPTIONS}
              selectedValues={draft.courseTypes}
              onToggle={toggleCourseType}
              allLabel="전체 이수구분"
              disabled={isSaving}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>최소 이수 개수</FieldLabel>
            <TextInput
              value={draft.minCount}
              disabled={isSaving}
              placeholder="2"
              onChange={(value) => onFieldChange('minCount', value)}
            />
          </label>
        </div>
      )}

      {selectedRuleType?.typeName === 'PREREQUISITE' && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <FieldLabel>대상 과목코드</FieldLabel>
            <TextInput
              value={draft.targetCourseCodes}
              disabled={isSaving}
              placeholder="RGC1081"
              onChange={(value) => onFieldChange('targetCourseCodes', value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>선이수 과목코드</FieldLabel>
            <TextInput
              value={draft.prerequisiteCourseCodes}
              disabled={isSaving}
              placeholder="RGC1080"
              onChange={(value) => onFieldChange('prerequisiteCourseCodes', value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>조건 필드</FieldLabel>
            <div className="relative">
              <select
                value={draft.conditionField}
                disabled={isSaving}
                onChange={(event) => onFieldChange('conditionField', event.target.value)}
                className={`${ADMIN_INPUT_CLASS} appearance-none pr-8`}
              >
                <option value="">없음</option>
                <option value="englishLevel">영어 레벨</option>
              </select>
              <SelectChevron />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>조건 값</FieldLabel>
            <TextInput
              value={draft.conditionValue}
              disabled={isSaving}
              placeholder="S4"
              onChange={(value) => onFieldChange('conditionValue', value)}
            />
          </label>
        </div>
      )}

      {selectedRuleType?.typeName === 'SCIENCE_EXPERIMENT' && (
        <label className="flex max-w-xs flex-col gap-1.5">
          <FieldLabel>최소 이수 개수</FieldLabel>
          <TextInput
            value={draft.minCount}
            disabled={isSaving}
            placeholder="1"
            onChange={(value) => onFieldChange('minCount', value)}
          />
        </label>
      )}

      {selectedRuleType?.typeName === 'SCIENCE_CONFLICT' && (
        <p className="text-body-s text-coolgray-60">입력값이 없는 고정 규칙입니다. 저장 시 빈 객체가 전송됩니다.</p>
      )}

      {selectedRuleType?.typeName === 'THESIS' && (
        <div className="grid gap-3">
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
            <FieldLabel>필수 과목 세트</FieldLabel>
            <textarea
              value={draft.requiredCourseSetsText}
              disabled={isSaving}
              placeholder={'한 줄이 하나의 세트입니다.\n예: CSE4066,CSC4018 | CSE4067,CSC4019'}
              onChange={(event) => onFieldChange('requiredCourseSetsText', event.target.value)}
              className={`${ADMIN_INPUT_CLASS} min-h-24 resize-y`}
            />
          </label>
        </div>
      )}
    </div>
  );
}
