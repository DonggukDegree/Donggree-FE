import type { ReactNode } from 'react';

/**
 * [학업 리포트] alert 모달 문구 모음
 *
 * 성적표 업로드·졸업 판정 화면에서 띄우는 안내 모달의 텍스트를 한곳에 모은다.
 * icon/buttonText/onConfirm 등 동작은 호출부가 정하고, 여기서는 문구만 관리한다.
 *
 * 상황은 크게 둘로 나뉜다.
 *  - 리포트를 못 만든 경우: 업로드가 실패해 되돌아가야 한다. (파일 오류·미지원·본인 불일치)
 *  - 리포트는 만들었지만 부정확할 수 있는 경우: 화면은 보여 주되 신뢰도를 알린다. (학점 불일치·복수전공)
 *
 * 서버 에러 코드로 찾아야 하는 문구는 아래 TRANSCRIPT_ERROR_MODAL 맵이 이름 상수를 가리킨다.
 * 화면에서 직접 쓸 때는 맵이 아니라 이름 상수를 참조할 것. (코드만 보고 무슨 문구인지 알 수 있도록)
 */
export type TReportModalContent = {
  title: string;
  subtitle: ReactNode;
  description: string;
};

// ── 리포트를 만들지 못한 경우 ────────────────────────────────

/** PDF 텍스트 추출 실패 (TRANSCRIPT400_2 / INVALID_PDF_FILE) */
export const PDF_READ_FAILED_MODAL: TReportModalContent = {
  title: '파일 읽기에 실패했어요',
  subtitle: '파일이 손상되었거나 형식이 올바르지 않아요',
  description: `안내된 다운로드 방법에 따라 정확한 파일을 업로드해주세요.\n다른 문제가 있다면 고객지원에 문의해주세요.`,
};

/** 필수 메타 필드(학번·성명 등) 누락 (TRANSCRIPT400_1 / PDF_PARSING_FAILED) */
export const PDF_FORMAT_INVALID_MODAL: TReportModalContent = {
  title: 'PDF 형식이 올바르지 않아요',
  subtitle: '업로드한 파일이 취득교과목 영역별 분류표가 맞나요?',
  description: `안내된 다운로드 방법에 따라 정확한 파일을 업로드해주세요.\n다른 문제가 있다면 고객지원에 문의해주세요.`,
};

/**
 * 아직 졸업 요건이 준비되지 않은 학과·학번.
 * 서버 기준으로는 두 단계에서 갈리지만 학생에게는 같은 상황이라 문구를 공유한다.
 *  - TRANSCRIPT400_3 (업로드): 학과가 department 테이블에 없음
 *  - GRADUATION404_2 (판정):   학과는 있으나 그 학번의 requirement_set이 없음
 */
export const UNSUPPORTED_CURRICULUM_MODAL: TReportModalContent = {
  title: '동그리가 아직 지원하지 않는 학과·학번이에요',
  subtitle: '해당 학과 또는 학번의 졸업 요건이 등록되어 있지 않아요',
  description: `지원 대상을 확대하고 있으니 조금만 기다려주세요.\n빠른 지원을 원한다면 고객지원에 문의해주세요.`,
};

/** 본인 인증 정보와 PDF 학번/이름 불일치 (USER403_1 / PDF_OWNER_MISMATCH) */
export const OWNER_MISMATCH_MODAL: TReportModalContent = {
  title: '사용자 정보와 PDF 정보가 일치하지 않아요',
  subtitle: '동그리는 타인의 PDF 업로드를 허용하지 않아요.',
  description: `사용자 정보를 잘못 입력했다면 마이페이지에서 수정해주세요.\n다른 문제가 있다면 고객지원에 문의해주세요.`,
};

/**
 * 성적표 업로드(PUT /api/users/me/reports) 실패 시 서버 에러 코드로 찾는 문구.
 * 모달을 띄우는 에러만 싣는다. (404·500은 NotFound로 이동, 파일 누락 등은 토스트로 처리)
 */
export const TRANSCRIPT_ERROR_MODAL: Record<string, TReportModalContent> = {
  TRANSCRIPT400_1: PDF_FORMAT_INVALID_MODAL,
  TRANSCRIPT400_2: PDF_READ_FAILED_MODAL,
  TRANSCRIPT400_3: UNSUPPORTED_CURRICULUM_MODAL,
  USER403_1: OWNER_MISMATCH_MODAL,
};

// ── 리포트는 만들었지만 부정확할 수 있는 경우 ──────────────────

// 학점 수치만 primary-60 색으로 강조한다.
const highlightCredit = (value: number) => <span className="text-primary-60">{value}학점</span>;

/**
 * 업로드는 성공했지만 학점 정합성(creditGap)이 맞지 않는 경우.
 * 수치를 문구에 넣어야 해서 함수로 둔다. 업로드 직후 1회만 띄운다.
 */
export const CREDIT_GAP_MODAL = {
  // 양수: PDF 총취득학점 > 인식된 과목 학점 합 → 누락된 수강 이력을 추가해야 함
  positive: (creditGap: number): TReportModalContent => ({
    title: '동그리가 정확한 분석에 실패했어요',
    subtitle: <>동그리가 찾은 학점이 실제 수강한 학점보다 {highlightCredit(creditGap)} 모자라요.</>,
    description: `지금 제공하는 리포트는 정확하지 않을 수 있어요.\n리포트 하단의 내 학업 정보 추가에서 누락된 과목을 추가해주세요.`,
  }),
  // 음수: 인식된 과목 학점 합 > PDF 총취득학점 → 과목이 더 많이 인식됨(중복 등)
  negative: (creditGap: number): TReportModalContent => ({
    title: '동그리가 정확한 분석에 실패했어요',
    subtitle: <>동그리가 찾은 학점이 실제 수강한 학점보다 {highlightCredit(Math.abs(creditGap))} 많아요.</>,
    description: `지금 제공하는 리포트는 정확하지 않을 수 있어요. \n정확한 진단을 위해 고객지원에 문의해주세요.`,
  }),
};

/** 복수전공·부전공 이력이 있어 판정이 실제보다 후할 수 있는 경우. 졸업 판정 화면에서 띄운다. */
export const UNSUPPORTED_MAJOR_MODAL: TReportModalContent = {
  title: '동그리가 정확한 분석에 실패했어요',
  subtitle: (
    <>
      <span className="text-primary-60">복수전공·부전공</span>은 아직 졸업 판정을 지원하지 않아요.
    </>
  ),
  description: `지금 제공하는 리포트는 정확하지 않을 수 있어요. \n빠른 지원을 원한다면 고객지원에 문의해주세요.`,
};
