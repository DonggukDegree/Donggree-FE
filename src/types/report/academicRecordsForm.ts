/** [학업정보 > 수강 편집] 입력 모델 */
// 편집 화면이 다루는 수강 이력 한 줄. 입력 편의를 위해 재수강은 'O'/'X' 문자열로 다룬다.
export type TEditCourse = {
  id: string; // React key 및 식별용 클라이언트 id (서버 id는 치환 시 재부여되므로 쓰지 않는다)
  category: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  area: string;
  retake: 'O' | 'X';
};

// 학기 그룹. 편집 모드에서는 학기 이름도 바꿀 수 있다.
export type TEditSemester = {
  id: string;
  name: string;
  courses: TEditCourse[];
};
