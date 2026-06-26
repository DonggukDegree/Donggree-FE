// 성적표 업로드(PUT /api/users/me/reports) 실패 시 alert 모달로 안내할 에러 코드별 문구.
// 모달을 띄우는 에러만 정의한다. (404·500은 NotFound로 이동, 파일 누락 등은 토스트로 처리)
// icon/buttonText 등은 훅에서 일괄 부여하고, 여기서는 텍스트만 관리한다.
export const TRANSCRIPT_ERROR_MODAL: Record<string, { title: string; subtitle: string; description: string }> = {
  // PDF 텍스트 추출 실패 (INVALID_PDF_FILE)
  TRANSCRIPT400_2: {
    title: '파일 읽기에 실패했어요',
    subtitle: '파일이 손상되었거나 형식이 올바르지 않아요',
    description:
      '안내된 다운로드 방법에 따라 정확한 파일을 업로드해주세요.\n다른 문제가 있다면 고객지원에 문의해주세요.',
  },
  // 필수 메타 필드(학번·성명 등) 누락 (PDF_PARSING_FAILED)
  TRANSCRIPT400_1: {
    title: 'PDF 형식이 올바르지 않아요',
    subtitle: '업로드한 파일이 취득교과목 영역별 분류표가 맞나요?',
    description:
      '안내된 다운로드 방법에 따라 정확한 파일을 업로드해주세요.\n다른 문제가 있다면 고객지원에 문의해주세요.',
  },
  // PDF 학과가 커리큘럼에 미등록 (DEPARTMENT_NOT_FOUND)
  TRANSCRIPT400_3: {
    title: '동그리가 아직 지원하지 않는 학과예요',
    subtitle: '해당 학과의 졸업 요건이 등록되어 있지 않아요',
    description:
      '고객지원에 PDF 데이터를 제공하면 더 빠른 지원이 가능해요.\n다른 문제가 있다면 고객지원에 문의해주세요.',
  },
  // 본인 인증 정보와 PDF 학번/이름 불일치 (PDF_OWNER_MISMATCH)
  USER403_1: {
    title: '사용자 정보와 PDF 정보가 일치하지 않아요',
    subtitle: '동그리는 타인의 PDF 업로드를 허용하지 않아요.',
    description:
      '사용자 정보를 잘못 입력했다면 마이페이지에서 수정해주세요.\n다른 문제가 있다면 고객지원에 문의해주세요.',
  },
};
