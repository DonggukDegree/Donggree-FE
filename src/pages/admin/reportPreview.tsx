/** [관리자 > PDF 리포트 테스트] 업로드 → 사용자와 동일한 리포트 → 다시 하기 */
import { useRef, useState } from 'react';

import Button from '@/components/common/button';
import Loading from '@/components/common/loading';
import GraduationReport from '@/components/report/graduationReport';
import { ERROR_CODE } from '@/constants/errorCodes';
import { TRANSCRIPT_ERROR_MODAL, UNSUPPORTED_CURRICULUM_MODAL } from '@/constants/report/reportModals';
import useReportPreview from '@/hooks/admin/mutations/useReportPreview';
import { getErrorCode, getErrorMessage } from '@/utils/error';

export default function AdminReportPreview() {
  const [file, setFile] = useState<File | null>(null);
  const [inputVersion, setInputVersion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isPending, error, preview, reset } = useReportPreview();

  const restart = () => {
    reset();
    setFile(null);
    setInputVersion((value) => value + 1);
    window.scrollTo({ top: 0 });
  };

  const errorCode = getErrorCode(error);
  // 사용자 화면의 모달 문구를 그대로 재사용하되 테스트는 화면 이동 없이 다시 시도할 수 있게 한다.
  const errorContent =
    errorCode === ERROR_CODE.NO_REQUIREMENT
      ? UNSUPPORTED_CURRICULUM_MODAL
      : errorCode
        ? TRANSCRIPT_ERROR_MODAL[errorCode]
        : undefined;

  return (
    <div className="w-full max-w-160 lg:max-w-none mx-auto">
      <section className="p-4 lg:px-20 lg:pt-12 flex flex-col gap-4">
        <h1 className="text-heading-4 text-coolgray-90">PDF 리포트 테스트</h1>
        <p className="text-body-m text-coolgray-60">
          계정의 이름·학번과 관계없이 PDF를 테스트합니다. 파일과 결과는 DB에 저장하지 않으며, 내 성적표도 변경하지
          않습니다. 다시 하거나 화면을 나가면 미리보기가 초기화됩니다.
        </p>
        {data && (
          <Button variant="outlined" className="self-start" onClick={restart}>
            다시 하기
          </Button>
        )}
      </section>

      {data ? (
        <GraduationReport data={data.report} preview={{ details: data.details, onRestart: restart }} />
      ) : (
        <form
          className="p-4 lg:p-20 flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (file && !isPending) preview(file);
          }}
        >
          <h2 id="preview-pdf-label" className="text-heading-6 text-coolgray-90">
            취득교과목 영역별 분류표 PDF
          </h2>
          <input
            key={inputVersion}
            ref={inputRef}
            id="preview-pdf"
            type="file"
            accept="application/pdf,.pdf"
            disabled={isPending}
            aria-labelledby="preview-pdf-label"
            className="hidden"
            onChange={(event) => {
              reset();
              setFile(event.target.files?.[0] ?? null);
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outlined"
              disabled={isPending}
              className="shrink-0"
              aria-describedby="preview-pdf-filename"
              onClick={() => inputRef.current?.click()}
            >
              PDF 업로드
            </Button>
            <Button type="submit" variant={!file || isPending ? 'disabled' : 'primary'}>
              {isPending ? '리포트 생성 중' : '리포트 보기'}
            </Button>
            {isPending && (
              <Button type="button" variant="outlined" onClick={restart}>
                취소
              </Button>
            )}
          </div>
          <p id="preview-pdf-filename" aria-live="polite" className="break-all text-body-m text-coolgray-60">
            {file ? file.name : '선택한 PDF가 없습니다.'}
          </p>
          {error && (
            <div role="alert" className="flex flex-col gap-2 text-body-m text-alert">
              {errorContent ? (
                <>
                  <p className="font-bold">{errorContent.title}</p>
                  <p>{errorContent.subtitle}</p>
                  <p className="whitespace-pre-line">{errorContent.description}</p>
                </>
              ) : (
                <p>{getErrorMessage(error) ?? '업로드 중 오류가 발생했습니다.'}</p>
              )}
            </div>
          )}
          {isPending && <Loading variant="inline" />}
        </form>
      )}
    </div>
  );
}
