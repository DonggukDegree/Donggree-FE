/** [학업정보] 기존 F·NP 값을 유지하면서 표시와 선택지만 구분한다. */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CourseRow from '@/components/academicRecords/courseRow';
import type { TEditCourse } from '@/types/report/academicRecordsForm';

const course: TEditCourse = {
  id: '1',
  category: '공교',
  courseCode: 'RGC0017',
  courseName: '명상',
  credits: 1,
  grade: 'NP',
  area: '자아',
  retake: 'X',
};

describe('성적 표시', () => {
  it.each([
    ['F', 'F(등급)'],
    ['NP', 'F(NP)'],
  ])('기존 %s 행은 %s로 표시·선택', (grade, label) => {
    const props = {
      course: { ...course, grade },
      hasDualMajor1: false,
      isSaving: false,
      onChange: () => {},
      onRemove: () => {},
    };
    const edit = renderToStaticMarkup(<CourseRow {...props} editMode />);
    expect(edit).toContain(`value="${label}" selected=""`);
    expect(edit).toContain('F(등급)');
    expect(edit).toContain('F(NP)');
    expect(edit).not.toContain('value="NP"');
    expect(edit).not.toContain('value="F"');
    const view = renderToStaticMarkup(<CourseRow {...props} editMode={false} />);
    expect(view).toContain(label);
  });
});
