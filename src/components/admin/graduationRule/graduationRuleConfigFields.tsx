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
import { MAJOR_ROLE_LABEL, MAJOR_ROLES, type TMajorRole } from '@/types/admin/TMajorRole';
import { COURSE_LABEL, COURSE_TYPES, type TCourseType } from '@/types/course';

const COURSE_TYPE_OPTIONS = COURSE_TYPES.map((courseType) => ({ value: courseType, label: COURSE_LABEL[courseType] }));
const MAJOR_ROLE_OPTIONS = MAJOR_ROLES.map((role) => ({ value: role, label: MAJOR_ROLE_LABEL[role] }));

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

  const toggleMajorRole = (role: TMajorRole) => {
    if (draft.applicableMajorRoles.length === 1 && draft.applicableMajorRoles.includes(role)) return;
    onFieldChange(
      'applicableMajorRoles',
      draft.applicableMajorRoles.includes(role)
        ? draft.applicableMajorRoles.filter((value) => value !== role)
        : [...draft.applicableMajorRoles, role],
    );
  };

  return (
    <div className="mt-4 rounded-xl bg-primary-30/40 p-4">
      {!selectedRuleType && (
        <p className="text-body-s text-coolgray-60">규칙 종류를 선택하면 설정 입력칸이 나타납니다.</p>
      )}

      {selectedRuleType &&
        ['MIN_CREDITS', 'REQUIRED_COURSE', 'THESIS', 'ENGLISH_COURSE'].includes(selectedRuleType.typeName) && (
          <p className="mb-3 text-body-xs text-coolgray-60">
            주전공 학과의 세트에서는 단일전공 또는 복수전공자의 주전공 옵션을 적용합니다. 복수전공 학과의 세트에서는
            복수전공자의 복수전공을 선택한 규칙만 추가 검사합니다. 적용 대상 옵션이 없는 종류의 규칙은 주전공에서만
            검사합니다. 미충족 사유는 단일전공·복수전공자의 주전공이면 제1전공 탭에, 복수전공자의 복수전공이면 제2전공
            탭에 표시됩니다. 과목 목록과 이수·목표학점은 원래 이수구분에 유지됩니다.
          </p>
        )}

      {selectedRuleType?.courseType === 'ACADEMIC_FOUNDATION' &&
        ['MIN_CREDITS', 'REQUIRED_COURSE'].includes(selectedRuleType.typeName) && (
          <p className="mb-3 text-body-xs text-coolgray-60">
            이 학과를 복수전공하는 학생에게도 학문기초 요건이 필요하면 복수전공자의 복수전공을 함께 선택합니다. 최소
            이수 규칙의 이수구분은 학문기초로 지정하고, 학과별 대상이 정해져 있으면 영역·학수번호 조건을 추가합니다.
            필수과목은 지정한 학수번호로 확인합니다. 과목·학점 현황은 학문기초에 유지되며, 미충족 사유는 적용 대상에
            따라 제1전공·제2전공 탭에 표시됩니다.
          </p>
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
        선택자끼리는 AND(교집합)로 좁혀지고, 한 선택자 안의 여러 값은 OR(합집합)이다.
        비운 선택자는 그 항목에 제약을 걸지 않는다. 임계값 2종은 AND이며 최소 하나가 있어야 한다.
        pdf* 선택자는 성적표 PDF의 원문 문자열이라 값 목록을 프론트가 확정할 수 없어 콤마 입력으로 받는다.
      */}
      {selectedRuleType?.typeName === 'MIN_CREDITS' && (
        <div className="flex flex-col gap-3">
          <p className="text-body-xs text-coolgray-60">
            채운 조건을 <b>모두 만족하는</b> 과목만 집계합니다(선택자 간 AND). 한 칸에 콤마로 여러 값을 넣으면 그중{' '}
            <b>하나만 맞아도</b> 됩니다(값 사이 OR). <b>비운 칸은 제한 없음</b>입니다. 임계값(최소 학점 · 최소 과목
            수)은 지정한 것을 모두 충족해야 하며 최소 하나는 필요합니다.
          </p>
          <label className="flex w-full flex-col gap-1.5">
            <FieldLabel>규칙 적용 대상</FieldLabel>
            <MultiSelectDropdown
              options={MAJOR_ROLE_OPTIONS}
              selectedValues={draft.applicableMajorRoles}
              onToggle={toggleMajorRole}
              allLabel="적용 대상 선택"
              disabled={isSaving}
            />
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
                allLabel="제한 없음"
                disabled={isSaving}
              />
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
                placeholder="공교, 전공, 전필"
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
        </div>
      )}

      {selectedRuleType?.typeName === 'REQUIRED_COURSE' && (
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1.5 md:col-span-3 md:max-w-xl">
            <FieldLabel>규칙 적용 대상</FieldLabel>
            <MultiSelectDropdown
              options={MAJOR_ROLE_OPTIONS}
              selectedValues={draft.applicableMajorRoles}
              onToggle={toggleMajorRole}
              allLabel="적용 대상 선택"
              disabled={isSaving}
            />
            <span className="text-body-xs text-coolgray-60">
              어떤 학생의 어느 전공에 이 필수과목 규칙을 적용할지 선택합니다. 기본값은 단일전공이며 하나 이상 반드시
              선택합니다.
            </span>
          </label>
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
          <label className="flex flex-col gap-1.5 md:col-span-2 md:max-w-xl">
            <FieldLabel>규칙 적용 대상</FieldLabel>
            <MultiSelectDropdown
              options={MAJOR_ROLE_OPTIONS}
              selectedValues={draft.applicableMajorRoles}
              onToggle={toggleMajorRole}
              allLabel="적용 대상 선택"
              disabled={isSaving}
            />
            <span className="text-body-xs text-coolgray-60">
              신규 규칙의 기본값은 단일전공이며 하나 이상 반드시 선택합니다. 적용 대상이 없던 기존 영어강의 규칙은
              단일전공과 복수전공자의 주전공 선택을 유지합니다.
            </span>
          </label>
          <p className="text-body-xs text-coolgray-60 md:col-span-2">
            이수구분을 비우면 복수전공을 포함한 전체 이수 과목에서 영어강의를 셉니다. 제1전공은 주전공 적용 시에는
            주전공 과목을, 복수전공자의 복수전공 적용 시에는 복수1 과목을 뜻합니다. 제2전공을 직접 선택해도 복수1 과목을
            셉니다. 여러 이수구분을 선택하면 합산하며, 학점이 아닌 과목 수로 비교합니다.
          </p>
          <p className="text-body-xs text-coolgray-60 md:col-span-2">
            영어강의 비대상자 면제는 유지합니다. 복수전공 학과의 추가 요건은 성적표의 전체 영어강의 이수 완료 표시만으로
            통과시키지 않고 실제 과목 수로 확인합니다.
          </p>
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
        비워 두면 선택한 전공 역할의 졸업논문·시험 심사 결과로 판정한다.
        적용 학과는 규칙이 아니라 졸업 요건 세트가 정하므로 여기에 학과 입력은 없다.
      */}
      {selectedRuleType?.typeName === 'THESIS' && (
        <div className="grid gap-3">
          <label className="flex flex-col gap-1.5 md:max-w-xl">
            <FieldLabel>규칙 적용 대상</FieldLabel>
            <MultiSelectDropdown
              options={MAJOR_ROLE_OPTIONS}
              selectedValues={draft.applicableMajorRoles}
              onToggle={toggleMajorRole}
              allLabel="적용 대상 선택"
              disabled={isSaving}
            />
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
