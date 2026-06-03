import { useRef, useState } from 'react';
import { toast } from 'sonner';

import Inbox from '@/assets/icons/inbox.svg?react';
import Upload from '@/assets/icons/upload.svg?react';
import UploadInfo1 from '@/assets/uploadInfo1.svg?react';
import UploadInfo2 from '@/assets/uploadInfo2.svg?react';
import UploadInfo3 from '@/assets/uploadInfo3.svg?react';
import Button from '@/components/common/button';
import useUploadTranscript from '@/hooks/report/useUploadTranscript';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadTranscript, isPending } = useUploadTranscript();

  // '졸업 판정 시작' 클릭 핸들러.
  // 파일 미선택은 프론트에서 막을 수 있는 에러이므로 요청을 보내지 않고 토스트로 안내한다. (서버 TRANSCRIPT400_5 선제 차단)
  const handleSubmit = () => {
    if (!file) {
      toast.error('성적표 PDF를 먼저 업로드해주세요.');
      return;
    }
    uploadTranscript(file);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-20 p-20 text-coolgray-90">
      <div className="flex flex-col items-center gap-20">
        <div className="flex flex-col items-center gap-8">
          <Inbox className="w-20 h-20" />
          <p className="text-heading-2">PDF 업로드</p>
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-heading-4">취득교과목 영역별 분류표 PDF를 업로드해주세요</p>
            <p className="text-heading-5">최초 1번만 업로드하면 재업로드 없이 졸업 판정이 가능합니다.</p>
          </div>
        </div>
        <p className="text-heading-3">다운로드 방법</p>
      </div>
      <div className="flex items-center gap-20">
        <UploadInfo1 className="w-150 h-90" />
        <div className="flex flex-col gap-12">
          <p className="text-heading-3">{`nDRIMS > 졸업 > 취득학점확인서 조회`}</p>
          <p className="text-body-l">{`또는 메뉴 바 상단 검색 > ‘취득학점확인서조회’ 검색`}</p>
        </div>
      </div>
      <div className="flex items-center gap-20">
        <div className="flex flex-col gap-12">
          <p className="text-heading-3">F학점 포함 후 조회하여 PDF 확인</p>
          <div className="flex flex-col text-body-l">
            <p>기본 설정에서 F학점제외만 체크박스 해제</p>
            <p>수강신청 포함 X, 학수번호 포함 O, F학점제외 X</p>
            <p>신청년도 및 학기가 최신 학기인지 확인</p>
          </div>
        </div>
        <UploadInfo2 className="w-150 h-90" />
      </div>
      <div className="flex items-center gap-20">
        <UploadInfo3 className="w-150" />
        <div className="flex flex-col gap-12">
          <p className="text-heading-3">PDF 업로드</p>
          <div className="flex flex-col text-body-l">
            <p>뷰어 왼쪽의 저장 버튼을 누르고 뜨는 팝업에서 변경 사항 없이 확인을 선택하면</p>
            <p>내 컴퓨터에 다운로드된 파일 확인 가능</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-25">
        <div className="flex flex-col items-center gap-8">
          <p className="text-heading-2">PDF 업로드</p>
          <div className="w-225 h-89 rounded-md border border-coolgray-30 flex flex-col items-center justify-center gap-8">
            {file ? (
              <>
                <p className="text-heading-4 text-primary-60">{file.name}</p>
                <p className="text-body-l text-primary-60">업로드 완료</p>
                <button
                  type="button"
                  className="text-body-m text-coolgray-60 underline cursor-pointer hover:opacity-80"
                  onClick={() => setFile(null)}
                >
                  삭제
                </button>
              </>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected && selected.type === 'application/pdf') {
                      setFile(selected);
                    } else if (selected) {
                      alert('PDF 파일만 업로드할 수 있습니다.');
                    }
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  className="p-4 cursor-pointer hover:opacity-80"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload />
                </button>
                <p className="text-body-l">다운로드 받은 최신 PDF를 업로드해주세요.</p>
              </>
            )}
          </div>
          <p className="text-body-l text-coolgray-60">
            동그리는 PDF에서 졸업 판정에 필요하지 않은 정보를 수집하지 않습니다.
          </p>
        </div>
        <Button
          className="px-15 text-body-l"
          variant={file && !isPending ? 'primary' : 'disabled'}
          disabled={!file || isPending}
          onClick={handleSubmit}
        >
          {isPending ? '판정 중...' : '졸업 판정 시작'}
        </Button>
      </div>
    </div>
  );
}
