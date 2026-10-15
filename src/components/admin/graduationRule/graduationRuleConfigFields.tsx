/**
 * [관리자 > 졸업 요건 관리 > 졸업 규칙 관리] 규칙 종류별 설정 입력칸
 * 규칙 폼 한 행 안에서 typeName(TOTAL_CREDITS·GPA·PREREQUISITE 등)에 따라 필요한 입력만 보여 준다.
 * 여기서 채운 값이 저장 직전 ruleConfig(JSON)로 조립된다.
 */
import EnglishCourseFields from '@/components/admin/graduationRule/fields/courses/englishCourseFields';
import PrerequisiteFields from '@/components/admin/graduationRule/fields/courses/prerequisiteFields';
import RequiredCourseFields from '@/components/admin/graduationRule/fields/courses/requiredCourseFields';
import ScienceConflictFields from '@/components/admin/graduationRule/fields/courses/scienceConflictFields';
import GpaFields from '@/components/admin/graduationRule/fields/credits/gpaFields';
import MinCreditsFields from '@/components/admin/graduationRule/fields/credits/minCreditsFields';
import TotalCreditsFields from '@/components/admin/graduationRule/fields/credits/totalCreditsFields';
import TeachingAptitudeFields from '@/components/admin/graduationRule/fields/qualification/teachingAptitudeFields';
import ThesisFields from '@/components/admin/graduationRule/fields/qualification/thesisFields';
import type { TAdminAreaType } from '@/types/admin/courseClassification/TGetAdminAreaTypes';
import type { TGraduationRuleDraft, TGraduationRuleFieldChange } from '@/types/admin/forms/graduationRuleForm';
import type { TAdminRuleType } from '@/types/admin/graduationRule/TGetRuleTypes';

interface IGraduationRuleConfigFieldsProps {
  selectedRuleType: TAdminRuleType | null;
  draft: TGraduationRuleDraft;
  areaTypes: TAdminAreaType[];
  isSaving: boolean;
  // 이미 clientId가 바인딩된 변경 핸들러. 필드와 값만 넘기면 된다.
  onFieldChange: TGraduationRuleFieldChange;
}

// 규칙 종류(typeName)에 따라 달라지는 ruleConfig 입력칸. 종류별로 필요한 필드만 노출한다.
export default function GraduationRuleConfigFields({
  selectedRuleType,
  draft,
  areaTypes,
  isSaving,
  onFieldChange,
}: IGraduationRuleConfigFieldsProps) {
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
            검사합니다. 주전공 규칙의 미충족 사유는 원래 이수구분 탭에 표시하며, 이수구분이 없는 졸업 요건은 요약에
            표시합니다. 복수전공 학과에서 추가 검사한 규칙의 사유는 제2전공 탭에 표시합니다. 과목 목록과 이수·목표학점은
            원래 이수구분에 유지됩니다.
          </p>
        )}

      {selectedRuleType?.courseType === 'ACADEMIC_FOUNDATION' &&
        ['MIN_CREDITS', 'REQUIRED_COURSE'].includes(selectedRuleType.typeName) && (
          <p className="mb-3 text-body-xs text-coolgray-60">
            이 학과를 복수전공하는 학생에게도 학문기초 요건이 필요하면 복수전공자의 복수전공을 함께 선택합니다. 최소
            이수 규칙의 이수구분은 학문기초로 지정하고, 학과별 대상이 정해져 있으면 영역·학수번호 조건을 추가합니다.
            필수과목은 지정한 학수번호로 확인합니다. 과목·학점 현황과 주전공 규칙의 미충족 사유는 학문기초에 표시하며,
            복수전공 학과에서 추가 검사한 규칙의 사유만 제2전공 탭에 표시합니다.
          </p>
        )}

      {selectedRuleType?.typeName === 'TOTAL_CREDITS' && (
        <TotalCreditsFields draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
      )}

      {selectedRuleType?.typeName === 'GPA' && (
        <GpaFields draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
      )}

      {selectedRuleType?.typeName === 'TEACHING_APTITUDE' && (
        <TeachingAptitudeFields draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
      )}

      {/*
        MIN_CREDITS: 옛 MIN_AREA_CREDITS + SCIENCE_EXPERIMENT를 합친 규칙.
        선택자끼리는 AND(교집합)로 좁혀지고, 한 선택자 안의 여러 값은 OR(합집합)이다.
        비운 선택자는 그 항목에 제약을 걸지 않는다. 임계값 2종은 AND이며 최소 하나가 있어야 한다.
        pdf* 선택자는 성적표 PDF의 원문 문자열이라 값 목록을 프론트가 확정할 수 없어 콤마 입력으로 받는다.
      */}
      {selectedRuleType?.typeName === 'MIN_CREDITS' && (
        <MinCreditsFields
          draft={draft}
          selectedRuleType={selectedRuleType}
          areaTypes={areaTypes}
          isSaving={isSaving}
          onFieldChange={onFieldChange}
        />
      )}

      {selectedRuleType?.typeName === 'REQUIRED_COURSE' && (
        <RequiredCourseFields draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
      )}

      {selectedRuleType?.typeName === 'ENGLISH_COURSE' && (
        <EnglishCourseFields draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
      )}

      {selectedRuleType?.typeName === 'PREREQUISITE' && (
        <PrerequisiteFields draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
      )}

      {selectedRuleType?.typeName === 'SCIENCE_CONFLICT' && <ScienceConflictFields />}

      {/*
        THESIS: 필수 과목 세트를 채우면 그 과목 이수로 판정하고(컴퓨터·AI학부 종합설계),
        비워 두면 선택한 전공 역할의 졸업논문·시험 심사 결과로 판정한다.
        적용 학과는 규칙이 아니라 졸업 요건 세트가 정하므로 여기에 학과 입력은 없다.
      */}
      {selectedRuleType?.typeName === 'THESIS' && (
        <ThesisFields draft={draft} isSaving={isSaving} onFieldChange={onFieldChange} />
      )}
    </div>
  );
}
