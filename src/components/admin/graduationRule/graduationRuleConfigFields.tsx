/**
 * [관리자 > 졸업 요건 관리 > 졸업 규칙 관리] 규칙 종류별 설정 입력칸
 * 규칙 폼 한 행 안에서 typeName(TOTAL_CREDITS·GPA·PREREQUISITE 등)에 따라 필요한 입력만 보여 준다.
 * 여기서 채운 값이 저장 직전 ruleConfig(JSON)로 조립된다.
 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import MultiSelectDropdown from '@/components/admin/common/multiSelectDropdown';
import type {
  TGraduationRuleDraft,
  TGraduationRuleDraftField,
  TGraduationRuleDraftValue,
} from '@/components/admin/graduationRule/graduationRuleForm';
import SelectChevron from '@/components/common/selectChevron';
import { ADMIN_INPUT_CLASS, SELECT_RESET_CLASS } from '@/constants/inputStyles';
import type { TAdminAreaType } from '@/types/admin/TGetAdminAreaTypes';
import type { TAdminRuleType } from '@/types/admin/TGetRuleTypes';
import { COURSE_LABEL, COURSE_TYPES, type TCourseType } from '@/types/course';

const COURSE_TYPE_OPTIONS = COURSE_TYPES.map((courseType) => ({ value: courseType, label: COURSE_LABEL[courseType] }));

// MIN_CREDITS의 pdfAreaNames 선택지. 전공 과목은 과목 분류에 등록되어 있지 않아
// 전공기초/전공전문 구분이 성적표 PDF의 영역 원문에만 있어서 쓰는 선택자다.
const PDF_AREA_NAME_OPTIONS = [
  { value: '기초', label: '기초 (전공기초)' },
  { value: '전문', label: '전문 (전공전문)' },
];

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

  const togglePdfAreaName = (pdfAreaName: string) => {
    onFieldChange(
      'pdfAreaNames',
      draft.pdfAreaNames.includes(pdfAreaName)
        ? draft.pdfAreaNames.filter((value) => value !== pdfAreaName)
        : [...draft.pdfAreaNames, pdfAreaName],
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

      {/*
        MIN_CREDITS: 옛 MIN_AREA_CREDITS + SCIENCE_EXPERIMENT를 합친 규칙.
        선택자 4종은 서로 OR(합집합)로 묶이고, 임계값 2종은 AND(둘 다 지정하면 둘 다 충족)다.
        선택자를 모두 비우면 이수구분 전체가 대상이 된다. 임계값은 최소 하나가 있어야 한다.
      */}
      {selectedRuleType?.typeName === 'MIN_CREDITS' && (
        <div className="flex flex-col gap-3">
          <p className="text-body-xs text-coolgray-60">
            선택자(영역명 · 소분류 · PDF 영역 · 학수번호)는 <b>OR로 합쳐지고</b>, 모두 비우면 이수구분 전체가
            대상입니다. 임계값(최소 학점 · 최소 과목 수)은 <b>지정한 것을 모두 충족</b>해야 하며 최소 하나는 필요합니다.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <FieldLabel>이수구분</FieldLabel>
              <div className="relative">
                <select
                  value={draft.courseType}
                  disabled={isSaving}
                  onChange={(event) => onFieldChange('courseType', event.target.value)}
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
                allLabel="전체 영역"
                disabled={isSaving}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>PDF 영역 (선택자)</FieldLabel>
              <MultiSelectDropdown
                options={PDF_AREA_NAME_OPTIONS}
                selectedValues={draft.pdfAreaNames}
                onToggle={togglePdfAreaName}
                allLabel="지정 안 함"
                disabled={isSaving}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>소분류 (선택자)</FieldLabel>
              <TextInput
                value={draft.subCategories}
                disabled={isSaving}
                placeholder="실험"
                onChange={(value) => onFieldChange('subCategories', value)}
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
                className={`${ADMIN_INPUT_CLASS} ${SELECT_RESET_CLASS}`}
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

      {selectedRuleType?.typeName === 'SCIENCE_CONFLICT' && (
        <p className="text-body-s text-coolgray-60">입력값이 없는 고정 규칙입니다. 저장 시 빈 객체가 전송됩니다.</p>
      )}

      {/*
        THESIS: 필수 과목 세트를 채우면 그 과목 이수로 판정하고(컴퓨터·AI학부 종합설계),
        비워 두면 성적표 PDF의 졸업논문심사 합격 여부로 판정한다(대부분의 학과).
        적용 학과는 규칙이 아니라 졸업 요건 세트가 정하므로 여기에 학과 입력은 없다.
      */}
      {selectedRuleType?.typeName === 'THESIS' && (
        <div className="grid gap-3">
          <p className="text-body-xs text-coolgray-60">
            필수 과목 세트를 <b>비워 두면</b> 성적표의 졸업논문심사 합격으로 판정합니다. 채우면 그 과목들의 이수로
            판정합니다. 면제 학생유형은 두 경우 모두 우선 적용됩니다.
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
