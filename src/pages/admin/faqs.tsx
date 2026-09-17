/**
 * [관리자 > FAQ 관리] 페이지 (/admin/faqs)
 * 사용자 화면(/faq)에 노출되는 자주 묻는 질문을 등록·수정·삭제하는 화면.
 * 구성: 작성 가이드 콜아웃 / 등록·수정 폼 / 등록된 질문 목록.
 * 상태·검증·저장은 useFaqEditor가 담당하고, 이 파일은 배치만 한다.
 */
import FaqForm from '@/components/admin/faq/faqForm';
import FaqTable from '@/components/admin/faq/faqTable';
import useFaqEditor from '@/hooks/admin/editors/useFaqEditor';

export default function AdminFaqs() {
  const editor = useFaqEditor();

  return (
    <main className="flex-1 bg-primary-30/30 px-10 py-12">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-3 text-coolgray-90">FAQ 관리</h1>
          <p className="text-body-m text-coolgray-90">
            사용자 화면의 <span className="font-semibold">자주 묻는 질문</span>에 노출되는 글을 등록·수정·삭제합니다.
          </p>
        </div>

        {/* 작성 가이드. 글의 품질이 화면 품질을 그대로 결정하므로 폼 위에 상주시킨다. */}
        <div className="flex flex-col gap-3 rounded-2xl border border-primary-60/20 bg-white p-8 shadow-sm">
          <p className="text-body-l text-primary-90">작성 가이드</p>

          <div className="flex flex-col gap-2 text-body-m text-coolgray-90">
            <p>
              <span className="font-semibold">제목은 사용자가 실제로 던질 법한 질문 형태로</span> 씁니다. 화면에서 제목
              앞에 <span className="font-semibold text-primary-60">Q.</span>가 붙고, 이 줄만 먼저 보인 뒤 눌러야 답변이
              펼쳐집니다. &apos;성적표 안내&apos;처럼 명사로 끝내면 무엇을 묻는 글인지 알 수 없습니다.
            </p>
            <p>
              <span className="font-semibold">줄바꿈이 그대로 화면에 반영됩니다.</span> 단계가 여러 개면 엔터로 나누어
              쓰세요. 다만 <span className="font-semibold">굵게·링크·목록 같은 서식은 지원하지 않습니다</span>(평문만
              저장). 링크를 안내해야 하면 주소를 그대로 적습니다.
            </p>
            <div className="flex flex-col gap-1">
              <p>
                <span className="font-semibold">태그</span>는 &apos;무엇에 대한 질문인가&apos;로 고릅니다. 사용자 화면
                상단 칩이 이 태그로 목록을 걸러냅니다.
              </p>
              <ul className="ml-4 flex list-disc flex-col gap-0.5">
                <li>
                  <span className="font-semibold">서비스</span> — 동그리 서비스 자체. 가입·로그인, 성적표 업로드,
                  학업정보수정처럼 <span className="font-semibold">졸업 요건과 무관한</span> 사용법 질문
                </li>
                <li>
                  <span className="font-semibold">공통</span> — 공통 졸업 요건. 교양·학문기초·총 취득학점·평점 등 전공과
                  무관하게 모든 학생에게 적용되는 요건
                </li>
                <li>
                  <span className="font-semibold">전공</span> — 전공 졸업 요건. 전공 최저이수학점, 전공필수 과목,
                  복수전공·부전공처럼 학과에 따라 갈리는 요건
                </li>
              </ul>
            </div>
            <p>
              <span className="font-semibold">정렬은 최신순 고정입니다.</span> 순서를 직접 지정할 수 없으므로, 위로
              올리고 싶은 글은 지우고 다시 등록해야 합니다.
            </p>
          </div>

          <p className="text-body-m text-primary-90">
            * 등록·수정·삭제는 DB에 즉시 반영되어 사용자 화면에 바로 노출됩니다. 미리보기와 확인 창의 내용을 꼭 검토한 뒤
            저장해주세요.
          </p>
        </div>

        <FaqForm
          form={editor.form}
          errors={editor.errors}
          isEditing={editor.isEditing}
          isSaving={editor.isSaving}
          onChange={editor.changeField}
          onSubmit={editor.submit}
          onReset={editor.reset}
        />

        <FaqTable
          faqs={editor.faqs}
          editingId={editor.editingId}
          isLoading={editor.isLoading}
          isError={editor.isError}
          isSaving={editor.isSaving}
          onEdit={editor.startEdit}
          onRemove={editor.remove}
        />
      </div>
    </main>
  );
}
