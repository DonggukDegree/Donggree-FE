/**
 * [관리자 > 과목 관리] 페이지 (/admin/course-classifications)
 * 학업이수 가이드 기준의 과목별 이수 영역 분류를 조회·수정·추가하는 화면.
 * 구성: 안내 콜아웃 / 수정 폼 / 필터 바 + 조회 결과 목록.
 * 상태·검증·저장은 useCourseClassificationEditor가 담당하고, 이 파일은 배치만 한다.
 */
import CourseClassificationFilters from '@/components/admin/courseClassification/courseClassificationFilters';
import CourseClassificationForm from '@/components/admin/courseClassification/courseClassificationForm';
import CourseClassificationTable from '@/components/admin/courseClassification/courseClassificationTable';
import useCourseClassificationEditor from '@/hooks/admin/editors/useCourseClassificationEditor';

export default function AdminCourseClassifications() {
  const editor = useCourseClassificationEditor();

  return (
    <main className="flex-1 bg-primary-30/30 px-10 py-12">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-3 text-coolgray-90">과목 관리</h1>
          <p className="text-body-m text-coolgray-90">
            과목 분류를 필터로 조회하고, 선택한 분류를 수정하거나 새 분류를 추가합니다.
          </p>
        </div>

        {/* 이수 영역 목록 조회가 실패하면 영역 선택이 불가능하므로 미리 알려 준다. */}
        {editor.isAreaTypeError && (
          <div className="rounded-2xl border border-alert/30 bg-white px-6 py-4 text-body-m text-alert">
            이수 영역 목록을 불러오지 못했습니다. 영역 필터와 영역 선택 없이 작업해주세요.
          </div>
        )}

        {/* 안내 콜아웃. 필터가 목록 위로 내려가면서 이 박스가 가로를 꽉 채운다. */}
        <div className="flex flex-col gap-2 rounded-2xl border border-primary-60/20 bg-white p-8 shadow-sm">
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

        <CourseClassificationForm
          areaTypes={editor.areaTypes}
          drafts={editor.drafts}
          isSaving={editor.isSaving}
          onChange={editor.changeDraft}
          onAddNew={editor.addDraft}
          onRemove={editor.removeDraft}
          onSubmit={editor.submit}
        />

        {/* 필터 바는 조회 결과 목록 바로 위에 둔다. */}
        <CourseClassificationFilters
          areaTypes={editor.areaTypes}
          selectedAreaTypeIds={editor.selectedAreaTypeIds}
          selectedCourseTypes={editor.selectedCourseTypes}
          yearInput={editor.yearInput}
          onAreaTypeToggle={editor.onAreaTypeToggle}
          onCourseTypeToggle={editor.onCourseTypeToggle}
          onYearInputChange={editor.onYearInputChange}
          onApply={editor.applyFilters}
          onReset={editor.resetFilters}
        />

        {/* 목록에서 행을 체크하면 위 수정 폼에 해당 행이 편집 상태로 추가된다. */}
        <CourseClassificationTable
          courses={editor.courses}
          selectedIds={editor.selectedIds}
          isLoading={editor.isCourseLoading}
          isError={editor.isCourseError}
          onToggleAll={editor.selectRows}
          onToggleRow={editor.selectRow}
        />
      </div>
    </main>
  );
}
