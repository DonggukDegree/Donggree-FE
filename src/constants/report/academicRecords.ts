/**
 * [내 학업 정보 관리] 수강 이력 표의 고정 상수
 * 표의 열 구성과 입력 선택지를 화면·행 컴포넌트·검증 로직이 함께 참조한다.
 */

// 수강 이력의 성적 허용값 (서버 enum과 동일)
export const ALLOWED_GRADES = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'P', 'NP'];

// 수강 이력의 이수구분 선택지 (PDF 원시 문자열 기준 고정 목록)
// 복수1 선택지는 복수전공1이 등록된 학생의 편집 행에서만 노출한다.
export const COURSE_TYPE_OPTIONS = ['전공', '복수1', '공교', '일교', '학기', '자선'];

// 편집 가능한 수강 이력 필드
export type TCourseField = 'category' | 'courseCode' | 'courseName' | 'credits' | 'grade' | 'area' | 'retake';

// 표의 열 정의. width는 헤더와 본문 셀이 같은 값을 써야 열이 어긋나지 않는다.
export const COLUMNS: readonly { key: TCourseField; label: string; width: string }[] = [
  { key: 'category', label: '이수 구분', width: 'w-[12%]' },
  { key: 'courseCode', label: '학수번호', width: 'w-[14%]' },
  { key: 'courseName', label: '교과목명', width: 'w-[33%]' },
  { key: 'credits', label: '학점', width: 'w-[7%]' },
  { key: 'grade', label: '성적', width: 'w-[7%]' },
  { key: 'area', label: '이수 영역', width: 'w-[16%]' },
  { key: 'retake', label: '재수강', width: 'w-[7%]' },
];

// 행 끝 삭제 버튼이 차지하는 열 너비. (헤더의 빈 칸과 본문 버튼 칸이 공유)
export const ACTION_COLUMN_WIDTH = 'w-[4%]';
