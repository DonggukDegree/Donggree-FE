import CourseClassificationFormRow from '@/components/admin/courseClassificationFormRow';
import Button from '@/components/common/button';
import type { TAdminAreaType } from '@/types/admin/TGetAdminAreaTypes';
import type { TCourseType } from '@/types/course';

// 과목 분류 폼 한 행의 입력 상태(UI 전용). 모든 값은 입력 편의를 위해 문자열로 다룬다.
export type TCourseClassificationFormState = {
  id: number | null;
  courseCode: string;
  tag: string;
  studentYearStart: string;
  studentYearEnd: string;
  courseType: TCourseType | '';
  areaTypeId: string;
  subCategory: string;
  subjectDomain: string;
};

// 폼에서 관리하는 개별 행. clientId로 행을 구분한다.
export type TCourseClassificationDraft = TCourseClassificationFormState & {
  clientId: string;
};

interface ICourseClassificationFormProps {
  areaTypes: TAdminAreaType[];
  drafts: TCourseClassificationDraft[];
  isSaving: boolean;
  onChange: (clientId: string, field: keyof TCourseClassificationFormState, value: string) => void;
  onAddNew: () => void;
  onRemove: (clientId: string) => void;
  onSubmit: () => void;
}

const HEADER_CELL_CLASS = 'px-3 py-3 text-left text-body-s font-semibold text-primary-90';

export default function CourseClassificationForm({
  areaTypes,
  drafts,
  isSaving,
  onChange,
  onAddNew,
  onRemove,
  onSubmit,
}: ICourseClassificationFormProps) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-5 text-coolgray-90">과목 분류 수정</h2>
          <p className="mt-1 text-body-s text-coolgray-60">
            목록에서 과목을 선택하거나 신규 버튼으로 빈 행을 추가해 한 번에 저장합니다.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant={isSaving ? 'disabled' : 'outlined'}
            disabled={isSaving}
            onClick={onAddNew}
            className="w-20 py-3.5"
          >
            신규
          </Button>
          <Button
            variant={drafts.length > 0 && !isSaving ? 'primary' : 'disabled'}
            disabled={drafts.length === 0 || isSaving}
            onClick={onSubmit}
            className="w-28 py-3.5"
          >
            수정하기
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-coolgray-10">
        <table className="min-w-[1180px] w-full border-collapse">
          <thead className="bg-primary-30">
            <tr>
              <th className="w-18 px-3 py-3 text-left text-body-s font-semibold text-primary-90">구분</th>
              <th className="w-32 px-3 py-3 text-left text-body-s font-semibold text-primary-90">과목코드</th>
              <th className="w-40 px-3 py-3 text-left text-body-s font-semibold text-primary-90">표시명</th>
              <th className="w-32 px-3 py-3 text-left text-body-s font-semibold text-primary-90">시작년도</th>
              <th className="w-32 px-3 py-3 text-left text-body-s font-semibold text-primary-90">종료년도</th>
              <th className="w-40 px-3 py-3 text-left text-body-s font-semibold text-primary-90">이수구분</th>
              <th className="w-48 px-3 py-3 text-left text-body-s font-semibold text-primary-90">이수 영역</th>
              <th className={HEADER_CELL_CLASS}>세부분류</th>
              <th className={HEADER_CELL_CLASS}>학문영역</th>
              <th className="w-20 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {drafts.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-body-m text-coolgray-60">
                  수정할 과목을 선택하거나 신규 행을 추가해주세요.
                </td>
              </tr>
            ) : (
              drafts.map((draft) => (
                <CourseClassificationFormRow
                  key={draft.clientId}
                  draft={draft}
                  areaTypes={areaTypes}
                  isSaving={isSaving}
                  onChange={onChange}
                  onRemove={onRemove}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
