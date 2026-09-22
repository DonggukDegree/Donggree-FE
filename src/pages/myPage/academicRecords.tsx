/**
 * [마이페이지 > 내 학업 정보 관리] 페이지 (/my-page/academic-records)
 * 업로드한 성적표에서 뽑아낸 기본 정보와 학기별 수강 내역을 보여 주고,
 * '편집 모드' 토글을 켜면 학기·수강 이력을 직접 고쳐 통째로 저장할 수 있다.
 * 저장한 내용이 곧 졸업 판정의 입력이 되므로 화면 하단에 주의 문구를 함께 둔다.
 *
 * 구성: 헤더(편집 토글) / 업로드·수정 일시 / 기본 정보 / 학기별 수강 내역 / 하단 버튼
 * 편집 상태와 저장 로직은 useAcademicRecordsEditor가 담당한다.
 */
import { Navigate, useNavigate } from 'react-router-dom';

import Edit from '@/assets/icons/edit.svg?react';
import BasicInfoSection from '@/components/academicRecords/basicInfoSection';
import SemesterSection from '@/components/academicRecords/semesterSection';
import Button from '@/components/common/button';
import Loading from '@/components/common/loading';
import Toggle from '@/components/common/toggle';
import useAcademicRecordsEditor from '@/hooks/report/useAcademicRecordsEditor';
import useUserReports from '@/hooks/report/useUserReports';
import useInView from '@/hooks/useInView';
import NotFound from '@/pages/exception/notFound';
import type { TGetUserReportsResult } from '@/types/report/TGetUserReports';
import { formatDateTime } from '@/utils/date';
import { getErrorStatus } from '@/utils/error';

// 기본 정보·학기 섹션이 공통으로 쓰는 가운데 정렬 + 구분선 레이아웃
const SECTION_CLASS = 'flex w-full max-w-5xl flex-col items-center gap-5 border-b border-coolgray-20 py-4';

export default function AcademicRecords() {
  const { data, isPending, isError, error } = useUserReports();

  // 성적표 조회 상태 처리: 로딩 → 공용 Loading, 미업로드(404) → 업로드 유도, 그 외 에러 → NotFound
  if (isPending) {
    return <Loading />;
  }
  if (isError) {
    if (getErrorStatus(error) === 404) {
      return <Navigate to="/upload" replace />;
    }
    return <NotFound />;
  }

  // 데이터가 확정된 뒤에만 편집 화면을 마운트한다. (편집 훅이 초기값을 바로 만들 수 있도록)
  return <AcademicRecordsContent data={data} />;
}

function AcademicRecordsContent({ data }: { data: TGetUserReportsResult }) {
  const navigate = useNavigate();
  // 수강 내역이 많아 화면보다 길어지면 기본 threshold(0.2)로는 20%가 한 번에 보이지 않아
  // 페이드인이 영영 켜지지 않는다. 조금이라도 보이면 켜지도록 0으로 둔다.
  const [ref, isInView] = useInView(0);
  const editor = useAcademicRecordsEditor(data);
  const { meta } = data;

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center gap-8 lg:gap-12 p-4 lg:p-20 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-8 lg:gap-12">
        <Edit className="w-10 h-10 lg:w-20 lg:h-20 shrink-0" />
        <div className="flex flex-col items-center gap-7">
          <p className="text-heading-4 lg:text-heading-2 text-coolgray-90">내 학업 정보 관리</p>
          {/* 보기/편집 전환. 켜는 순간 현재 데이터가 편집용으로 복사되고, 끄면 수정 내용이 버려진다. */}
          <div className="flex items-center gap-2">
            <span className="text-body-m text-primary-60">편집 모드</span>
            <Toggle checked={editor.editMode} onChange={editor.changeEditMode} />
          </div>
        </div>
      </div>

      {/* 최초 업로드일 / 마지막 수정일 (오른쪽 정렬) */}
      <div className="w-full max-w-5xl flex flex-col items-end">
        <p className="text-body-s lg:text-body-m text-coolgray-60">최초 업로드일: {formatDateTime(meta.createdAt)}</p>
        <p className="text-body-s lg:text-body-m text-coolgray-60">마지막 수정일: {formatDateTime(meta.updatedAt)}</p>
      </div>

      <BasicInfoSection meta={meta} className={SECTION_CLASS} />

      {editor.semesters.map((semester) => (
        <SemesterSection
          key={semester.id}
          semester={semester}
          hasDualMajor1={Boolean(meta.dualMajor1)}
          editMode={editor.editMode}
          isSaving={editor.isSaving}
          className={SECTION_CLASS}
          onNameChange={(name) => editor.changeSemesterName(semester.id, name)}
          onRemoveSemester={() => editor.removeSemester(semester.id)}
          onAddCourse={() => editor.addCourse(semester.id)}
          onCourseChange={(courseId, field, value) => editor.changeCourse(semester.id, courseId, field, value)}
          onRemoveCourse={(courseId) => editor.removeCourse(semester.id, courseId)}
        />
      ))}

      {editor.editMode && (
        <>
          <div className="w-full max-w-5xl flex justify-end">
            <Button
              variant={editor.isSaving ? 'disabled' : 'primary'}
              className="w-40 max-w-full"
              disabled={editor.isSaving}
              onClick={editor.addSemester}
            >
              새로운 학기 추가
            </Button>
          </div>

          <p className="text-body-s lg:text-body-l text-coolgray-60">
            *수정한 정보를 기준으로 졸업 판정이 진행되므로, 추가한 수강 이력이 부정확한 경우 정확한 판정이 어려울 수
            있습니다.
          </p>
        </>
      )}

      {/* 좁은 화면에서 두 버튼이 한 줄에 안 들어가면 줄바꿈한다. (PC는 항상 한 줄이라 변화 없음) */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outlined" className="w-40 max-w-full" onClick={() => navigate('/upload')}>
          PDF 새로 업로드하기
        </Button>
        {editor.editMode && (
          <Button
            variant={editor.hasCourses && !editor.isSaving ? 'primary' : 'disabled'}
            className="w-40 max-w-full"
            disabled={!editor.hasCourses || editor.isSaving}
            onClick={editor.submit}
          >
            수정하기
          </Button>
        )}
      </div>
    </div>
  );
}
