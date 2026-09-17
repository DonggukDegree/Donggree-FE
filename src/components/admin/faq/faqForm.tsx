/**
 * [관리자 > FAQ 관리] 등록·수정 폼
 * 페이지 상단의 입력 영역. 목록에서 '수정'을 누르면 그 글이 여기로 올라오고, 아니면 새 글을 등록한다.
 */
import { FieldLabel, TextInput } from '@/components/admin/common/adminFormControls';
import Button from '@/components/common/button';
import SelectChevron from '@/components/common/selectChevron';
import { FAQ_TAG_DESCRIPTION, FAQ_TAG_LABEL, FAQ_TAGS } from '@/constants/faq';
import { ADMIN_INPUT_BASE_CLASS, SELECT_RESET_CLASS } from '@/constants/inputStyles';
import { FAQ_TITLE_MAX_LENGTH, type TFaqFormState } from '@/hooks/admin/editors/useFaqEditor';
import type { TFaqTag } from '@/types/support/TFaq';

interface IFaqFormProps {
  form: TFaqFormState;
  errors: Partial<Record<keyof TFaqFormState, string>>;
  isEditing: boolean;
  isSaving: boolean;
  onChange: <K extends keyof TFaqFormState>(field: K, value: TFaqFormState[K]) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export default function FaqForm({ form, errors, isEditing, isSaving, onChange, onSubmit, onReset }: IFaqFormProps) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-5 text-coolgray-90">{isEditing ? '질문 수정' : '새 질문 등록'}</h2>
          <p className="mt-1 text-body-s text-coolgray-60">
            {isEditing
              ? '목록에서 선택한 질문을 수정합니다. 취소하면 새 질문 등록으로 돌아갑니다.'
              : '태그·제목·본문을 입력해 새 질문을 등록합니다.'}
          </p>
        </div>
        <div className="flex shrink-0 gap-4">
          {isEditing && (
            <Button
              variant={isSaving ? 'disabled' : 'outlined'}
              disabled={isSaving}
              onClick={onReset}
              className="w-24 py-3.5"
            >
              취소
            </Button>
          )}
          <Button
            variant={isSaving ? 'disabled' : 'primary'}
            disabled={isSaving}
            onClick={onSubmit}
            className="w-28 py-3.5"
          >
            {isEditing ? '수정하기' : '등록하기'}
          </Button>
        </div>
      </div>

      {/* 좁은 화면에서는 미리보기가 입력 아래로 내려간다. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <FieldLabel>태그</FieldLabel>
            <div className="flex items-center gap-3">
              <div className="relative w-48 shrink-0">
                <select
                  value={form.tag}
                  disabled={isSaving}
                  onChange={(event) => onChange('tag', event.target.value as TFaqTag)}
                  className={`${ADMIN_INPUT_BASE_CLASS} border-coolgray-20 ${SELECT_RESET_CLASS}`}
                >
                  {FAQ_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {FAQ_TAG_LABEL[tag]}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
              {/* 세 태그의 경계가 헷갈리기 쉬워 고른 태그의 범위를 옆에 바로 보여 준다. */}
              <span className="text-body-s text-coolgray-60">{FAQ_TAG_DESCRIPTION[form.tag]}</span>
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <FieldLabel>제목 (질문)</FieldLabel>
              <span
                className={`text-body-xs ${form.title.length > FAQ_TITLE_MAX_LENGTH ? 'text-alert' : 'text-coolgray-60'}`}
              >
                {form.title.length} / {FAQ_TITLE_MAX_LENGTH}
              </span>
            </div>
            <TextInput
              value={form.title}
              disabled={isSaving}
              placeholder="예) 성적표는 어디서 받나요?"
              onChange={(value) => onChange('title', value)}
            />
            {errors.title && <p className="text-body-xs text-alert">{errors.title}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <FieldLabel>본문 (답변)</FieldLabel>
            <textarea
              rows={9}
              value={form.content}
              disabled={isSaving}
              onChange={(event) => onChange('content', event.target.value)}
              placeholder={
                '예) nDRIMS > 성적 > 취득교과목 영역별 분류표에서 받을 수 있어요.\n엔터를 누르면 줄바꿈이 그대로 화면에 반영됩니다.'
              }
              className={`${ADMIN_INPUT_BASE_CLASS} resize-y ${errors.content ? 'border-alert' : 'border-coolgray-20'}`}
            />
            {errors.content && <p className="text-body-xs text-alert">{errors.content}</p>}
          </label>
        </div>

        {/* 사용자 화면(/faq)에서 펼쳐졌을 때의 모습. 실제 렌더와 같은 규칙(whitespace-pre-line)을 쓴다. */}
        <div className="flex flex-col gap-2">
          <FieldLabel>미리보기</FieldLabel>
          <div className="flex-1 rounded-xl border border-coolgray-10 bg-primary-30/40 p-5">
            <div className="flex gap-3">
              <span className="shrink-0 text-heading-6 text-primary-60">Q.</span>
              <p className="flex-1 break-words text-body-m text-coolgray-90">
                {form.title.trim() || <span className="text-coolgray-60">제목을 입력하면 여기에 보여요.</span>}
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <span className="shrink-0 text-heading-6 text-coolgray-60">A.</span>
              <p className="flex-1 whitespace-pre-line break-words text-body-s text-coolgray-60">
                {form.content.trim() || '본문을 입력하면 여기에 보여요.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
