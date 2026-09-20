/**
 * [성적표 업로드] 페이지 (/upload)
 * '취득교과목 영역별 분류표' PDF를 올려 학업 리포트를 만드는 화면.
 * 성적표가 없는 회원은 ReportGate가 이리로 보낸다. 업로드 성공/실패 후의 안내와 이동은
 * useUploadTranscript가 담당한다. (학점 정합성 안내 모달 · 에러 모달 등)
 */
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import Inbox from '@/assets/icons/inbox.svg?react';
import Upload from '@/assets/icons/upload.svg?react';
import uploadInfo1 from '@/assets/uploadInfo1.svg';
import uploadInfo2 from '@/assets/uploadInfo2.svg';
import uploadInfo3 from '@/assets/uploadInfo3.svg';
import Button from '@/components/common/button';
import useUploadTranscript from '@/hooks/report/useUploadTranscript';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadTranscript, isPending } = useUploadTranscript();

  // '졸업 판정 시작' 클릭 핸들러.
  // 파일이 없으면 버튼이 비활성화되므로 이 핸들러는 파일이 있을 때만 호출된다.
  // (아래 null 가드는 타입 안전을 위한 방어 코드)
  const handleSubmit = () => {
    if (!file) return;
    uploadTranscript(file);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-10 lg:gap-20 p-6 lg:p-20 text-coolgray-90">
      <div className="flex flex-col items-center gap-10 lg:gap-20">
        <div className="flex flex-col items-center gap-6 lg:gap-8">
          <Inbox className="w-10 h-10 lg:w-20 lg:h-20 shrink-0" />
          <p className="text-heading-4 lg:text-heading-2">PDF 업로드</p>
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-heading-6 lg:text-heading-4">취득교과목 영역별 분류표 PDF를 업로드해주세요</p>
            <p className="text-body-s lg:text-heading-5">최초 1번만 업로드하면 재업로드 없이 졸업 판정이 가능합니다.</p>
          </div>
        </div>
        <p className="text-heading-5 lg:text-heading-3">다운로드 방법</p>
      </div>
      {/*
        안내 3블록. PC는 이미지와 설명이 좌우로 붙지만, 모바일에서는 600px짜리 안내 이미지가
        가로로 들어가지 않으므로 세로로 쌓고 이미지 폭을 컨테이너에 맞춘다.
      */}
      <div className="w-full lg:w-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-20">
        <img src={uploadInfo1} alt="nDRIMS 취득학점확인서 조회 메뉴 위치" className="w-full lg:w-150 h-auto lg:h-90" />
        <div className="flex flex-col gap-3 lg:gap-12">
          <p className="text-heading-6 lg:text-heading-3">{`nDRIMS > 졸업 > 취득학점확인서 조회`}</p>
          <p className="text-body-s lg:text-body-l">{`또는 메뉴 바 상단 검색 > ‘취득학점확인서조회’ 검색`}</p>
        </div>
      </div>
      {/*
        두 번째 블록만 PC에서 텍스트가 왼쪽에 온다. 모바일 세로 스택에서 다른 블록과 순서가 어긋나지 않도록
        DOM은 '이미지 → 텍스트'로 통일하고, PC에서만 flex-row-reverse로 되돌려 좌우 배치를 유지한다.
      */}
      <div className="w-full lg:w-auto flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-20">
        <img src={uploadInfo2} alt="F학점 제외 체크 해제 후 조회하는 화면" className="w-full lg:w-150 h-auto lg:h-90" />
        <div className="flex flex-col gap-3 lg:gap-12">
          <p className="text-heading-6 lg:text-heading-3">F학점 포함 후 조회하여 PDF 확인</p>
          <div className="flex flex-col text-body-s lg:text-body-l">
            <p>기본 설정에서 F학점제외만 체크박스 해제</p>
            <p>수강신청 포함 X, 학수번호 포함 O, F학점제외 X</p>
            <p>신청년도 및 학기가 최신 학기인지 확인</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-20">
        <img src={uploadInfo3} alt="PDF 뷰어에서 저장 버튼을 눌러 내려받는 화면" className="w-full lg:w-150 h-auto" />
        <div className="flex flex-col gap-3 lg:gap-12">
          <p className="text-heading-6 lg:text-heading-3">PDF 업로드</p>
          <div className="flex flex-col text-body-s lg:text-body-l">
            <p>뷰어 왼쪽의 저장 버튼을 누르고 뜨는 팝업에서 변경 사항 없이 확인을 선택하면</p>
            <p>내 컴퓨터에 다운로드된 파일 확인 가능</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-auto flex flex-col items-center gap-10 lg:gap-25">
        <div className="w-full lg:w-auto flex flex-col items-center gap-6 lg:gap-8">
          <p className="text-heading-4 lg:text-heading-2">PDF 업로드</p>
          <div className="w-full lg:w-225 h-64 lg:h-89 rounded-md border border-coolgray-30 flex flex-col items-center justify-center gap-6 lg:gap-8">
            {file ? (
              <>
                {/* 긴 파일명이 좁은 화면에서 박스를 뚫지 않도록 모바일에서만 강제 줄바꿈한다. */}
                <p className="text-heading-6 lg:text-heading-4 text-primary-60 max-lg:px-4 max-lg:text-center max-lg:break-all">
                  {file.name}
                </p>
                <p className="text-body-s lg:text-body-l text-primary-60">업로드 완료</p>
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
                      toast.error('PDF 파일만 업로드할 수 있습니다.');
                    }
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  className="p-4 cursor-pointer hover:opacity-80"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 lg:w-24 lg:h-24" />
                </button>
                <p className="text-body-s lg:text-body-l max-lg:px-4 max-lg:text-center">
                  다운로드 받은 최신 PDF를 업로드해주세요.
                </p>
              </>
            )}
          </div>
          <p className="text-body-s lg:text-body-l text-coolgray-60 max-lg:text-center">
            동그리는 PDF에서 졸업 판정에 필요하지 않은 정보를 수집하지 않습니다.
          </p>
        </div>
        <Button
          className="px-15 max-w-full text-body-m lg:text-body-l"
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
