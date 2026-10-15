/** [학업정보 > 수강 편집] 저장 경계와 기존 페이로드의 회귀 검사 */
import { describe, expect, it } from 'vitest';

import type { TEditCourse, TEditSemester } from '@/types/report/academicRecordsForm';
import { buildCourseUpdate, toEditSemesters } from '@/utils/report/academicRecordsForm';

const course: TEditCourse = {
  id: 'c1',
  category: '전공',
  courseCode: ' A1001 ',
  courseName: ' 과목 ',
  credits: 0,
  grade: ' p ',
  area: ' ',
  retake: 'X',
};
const semesters = (changes: Partial<TEditCourse> = {}): TEditSemester[] => [
  { id: 's1', name: ' 2023-1 ', courses: [{ ...course, ...changes }] },
];

describe('수강 이력 변환과 검증', () => {
  it('0학점·P 성적·선택 영역 생략 및 공백 정규화 유지', () => {
    expect(buildCourseUpdate(semesters())).toEqual({
      ok: true,
      value: {
        courses: [
          {
            semester: '2023-1',
            courseType: '전공',
            courseCode: 'A1001',
            courseName: '과목',
            credits: 0,
            grade: 'P',
            retake: false,
          },
        ],
      },
    });
  });

  it('영역·재수강과 PDF 복수2 이수구분 보존', () => {
    expect(buildCourseUpdate(semesters({ category: ' 복수2 ', area: ' 기초 ', retake: 'O' }))).toMatchObject({
      ok: true,
      value: { courses: [{ courseType: '복수2', areaName: '기초', retake: true }] },
    });
  });

  it('이력 전체 삭제 차단', () => {
    expect(buildCourseUpdate([])).toEqual({ ok: false, error: '최소 1개의 수강 이력이 필요해요.' });
  });

  it('과목 없는 빈 학기는 허용하되 과목 있는 빈 학기는 먼저 거절', () => {
    expect(buildCourseUpdate([{ id: 'empty', name: '', courses: [] }, ...semesters()]).ok).toBe(true);
    expect(buildCourseUpdate([{ ...semesters()[0]!, name: '' }])).toEqual({
      ok: false,
      error: '학기 이름을 입력해주세요.',
    });
  });

  it.each<Partial<TEditCourse>>([
    { category: '' },
    { courseCode: ' ' },
    { courseName: '' },
    { grade: 'Z' },
    { credits: -1 },
  ])('잘못된 필수값 저장 차단: %j', (changes) => {
    expect(buildCourseUpdate(semesters(changes))).toMatchObject({ ok: false });
  });

  it('입력 객체를 변경하지 않음', () => {
    const input = semesters();
    const original = structuredClone(input);
    buildCourseUpdate(input);
    expect(input).toEqual(original);
  });

  it('서버 null 영역·재수강을 편집 모델로 변환', () => {
    expect(
      toEditSemesters([
        {
          semester: '2023-1',
          records: [
            {
              id: 1,
              courseType: '전공',
              courseCode: 'A',
              courseName: '과목',
              credits: 3,
              grade: 'A+',
              areaName: null,
              retake: true,
            },
          ],
        },
      ]),
    ).toMatchObject([{ id: 'semester-0', name: '2023-1', courses: [{ id: 'course-0-0', area: '', retake: 'O' }] }]);
  });
});
