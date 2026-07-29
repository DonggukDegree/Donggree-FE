/**
 * [관리자 > 졸업 요건 관리] 페이지 (/admin/graduation-requirements)
 * '졸업 규칙 관리'와 '졸업 세트 관리' 두 탭으로 이루어진 화면.
 * 하단의 졸업 규칙 목록은 두 탭이 공유하며, 체크의 의미가 탭마다 다르다.
 *  - 규칙 관리 탭: 체크한 규칙이 위 수정 폼으로 올라간다.
 *  - 세트 관리 탭: 체크가 '이 세트에 포함할 규칙' 선택이 된다.
 * 탭별 상태·저장 로직은 useGraduationRuleEditor / useRequirementSetEditor가 담당한다.
 */
import { useState } from 'react';

import GraduationRuleFilters from '@/components/admin/graduationRule/graduationRuleFilters';
import GraduationRuleForm from '@/components/admin/graduationRule/graduationRuleForm';
import GraduationRuleTable from '@/components/admin/graduationRule/graduationRuleTable';
import RequirementSetFilters from '@/components/admin/requirementSet/requirementSetFilters';
import RequirementSetForm from '@/components/admin/requirementSet/requirementSetForm';
import useGraduationRuleEditor from '@/hooks/admin/editors/useGraduationRuleEditor';
import useRequirementSetEditor from '@/hooks/admin/editors/useRequirementSetEditor';

type TGraduationRequirementTab = 'rules' | 'sets';

const TABS: { key: TGraduationRequirementTab; label: string }[] = [
  { key: 'rules', label: '졸업 규칙 관리' },
  { key: 'sets', label: '졸업 세트 관리' },
];

export default function AdminGraduationRequirements() {
  const [activeTab, setActiveTab] = useState<TGraduationRequirementTab>('rules');
  const ruleEditor = useGraduationRuleEditor();
  const setEditor = useRequirementSetEditor();

  // 하단 규칙 테이블은 두 탭이 공유한다. 현재 탭에 따라 해당 컨트롤러로 선택을 위임한다.
  const handleTableToggleAll = (checked: boolean) => {
    if (activeTab === 'sets') {
      setEditor.toggleAllRules(ruleEditor.rules, checked);
      return;
    }
    ruleEditor.selectRows(checked);
  };

  const handleTableToggleRow = (ruleId: number, checked: boolean) => {
    if (activeTab === 'sets') {
      setEditor.toggleRule(ruleId, checked);
      return;
    }
    ruleEditor.selectRow(ruleId, checked);
  };

  const selectedTableIds = activeTab === 'rules' ? ruleEditor.selectedIds : setEditor.ruleIds;

  return (
    <main className="flex-1 bg-primary-30/30 px-10 py-12">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-3 text-coolgray-90">졸업 요건 관리</h1>
          <p className="text-body-m text-coolgray-90">
            졸업 규칙을 관리하고, 선택한 규칙들을 조합해 학과별 졸업 요건 세트를 구성합니다.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="flex rounded-full bg-white p-1 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-8 py-3 text-button-m transition-colors ${
                  activeTab === tab.key ? 'bg-primary-30 text-primary-90' : 'text-coolgray-60 hover:text-primary-60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {ruleEditor.isRuleTypeError && (
          <div className="rounded-2xl border border-alert/30 bg-white px-6 py-4 text-body-m text-alert">
            규칙 종류 목록을 불러오지 못했습니다. 새 규칙 추가는 제한될 수 있습니다.
          </div>
        )}

        {activeTab === 'rules' ? (
          <>
            {/* 안내 콜아웃. 필터가 목록 위로 내려가면서 이 박스가 가로를 꽉 채운다. */}
            <div className="flex flex-col gap-2 rounded-2xl border border-primary-60/20 bg-white p-8 shadow-sm">
              <p className="text-body-l text-primary-90">졸업 규칙은 졸업 판정에 쓰이는 단일 조건을 정의합니다.</p>
              <p className="text-body-m text-coolgray-90">
                규칙 종류마다 필요한 설정값이 다르므로, 규칙 종류를 먼저 고른 뒤 나타나는 입력칸을 채워 저장합니다. 이미
                존재하는 규칙이 있는지 반드시 확인 후 신규 등록해주세요.
              </p>
              <p className="text-body-m text-coolgray-90">없는 유형의 규칙인 경우 관리자에게 문의하세요.</p>
              <p className="text-body-m text-primary-90">
                * 규칙명은 해당 규칙을 통과하지 못한 학생에게 미충족 사유로 안내되므로 명확한 문장으로 작성해주세요.
              </p>
              <p className="text-body-m text-primary-90">
                * 수정 시 DB에 즉시 반영되므로, 반드시 수정 내용을 검토한 뒤 저장해주세요.
              </p>
            </div>

            <GraduationRuleForm
              areaTypes={ruleEditor.areaTypes}
              ruleTypes={ruleEditor.ruleTypes}
              drafts={ruleEditor.drafts}
              isSaving={ruleEditor.isSaving}
              onAddNew={ruleEditor.addDraft}
              onRemove={ruleEditor.removeDraft}
              onChange={ruleEditor.changeDraft}
              onSubmit={ruleEditor.submit}
            />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2 rounded-2xl border border-primary-60/20 bg-white p-8 shadow-sm">
              <p className="text-body-l text-primary-90">
                졸업 세트는 여러 졸업 규칙을 묶어 특정 학과-학번에 적용하는 졸업 판정 기준입니다.
              </p>
              <p className="text-body-m text-coolgray-90">
                기존 세트를 불러오거나 신규로 작성한 뒤, 아래 졸업 규칙 목록에서 포함할 규칙을 체크해 저장합니다.
              </p>
              <p className="text-body-m text-primary-90">
                * 수정 시 DB에 즉시 반영되므로, 반드시 수정 내용을 검토한 뒤 저장해주세요.
              </p>
            </div>

            <RequirementSetForm
              colleges={setEditor.colleges}
              departments={setEditor.formDepartments}
              sets={setEditor.requirementSets}
              selectedRuleCount={setEditor.ruleIds.size}
              form={setEditor.form}
              isSaving={setEditor.isSaving}
              isLoadingDetail={setEditor.isLoadingDetail}
              onChange={setEditor.changeForm}
              onNew={setEditor.newSet}
              onLoadSet={setEditor.loadSet}
              onSubmit={setEditor.submit}
              // 기존 졸업 세트 필터는 세트 폼 내부(버전·활성 정책 콜아웃 아래)에 한 줄로 배치한다.
              filterSlot={
                <RequirementSetFilters
                  colleges={setEditor.colleges}
                  departments={setEditor.filterDepartments}
                  selectedCollegeId={setEditor.filterCollegeId}
                  selectedDepartmentId={setEditor.filterDepartmentId}
                  yearInput={setEditor.filterYear}
                  isLoadingDepartments={setEditor.isFilterDepartmentsLoading}
                  onCollegeChange={setEditor.onCollegeChange}
                  onDepartmentChange={setEditor.onDepartmentChange}
                  onYearChange={setEditor.onYearChange}
                  onSearch={setEditor.searchSets}
                />
              }
            />
          </>
        )}

        {/* 졸업 규칙 필터와 목록은 두 탭이 공유한다. 필터 바를 목록 바로 위에 가로로 길게 둔다. */}
        <GraduationRuleFilters
          ruleTypes={ruleEditor.ruleTypes}
          requirementSets={ruleEditor.requirementSets}
          selectedRuleTypeIds={ruleEditor.selectedRuleTypeIds}
          selectedCourseTypes={ruleEditor.selectedCourseTypes}
          selectedSetId={ruleEditor.selectedSetId}
          onRuleTypeToggle={ruleEditor.onRuleTypeToggle}
          onCourseTypeToggle={ruleEditor.onCourseTypeToggle}
          onSetChange={ruleEditor.onSetChange}
          onApply={ruleEditor.applyFilters}
          onReset={ruleEditor.resetFilters}
        />

        <GraduationRuleTable
          rules={ruleEditor.rules}
          selectedIds={selectedTableIds}
          isLoading={ruleEditor.isRulesLoading}
          isError={ruleEditor.isRulesError}
          mode={activeTab === 'rules' ? 'rule' : 'set'}
          onToggleAll={handleTableToggleAll}
          onToggleRow={handleTableToggleRow}
        />
      </div>
    </main>
  );
}
