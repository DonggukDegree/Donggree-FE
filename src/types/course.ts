export type TCourseType = 'COMMON_GENERAL' | 'LIBERAL_ARTS' | 'ACADEMIC_FOUNDATION' | 'FIRST_MAJOR' | 'SECOND_MAJOR';

export const COURSE_TYPES: TCourseType[] = [
  'COMMON_GENERAL',
  'LIBERAL_ARTS',
  'ACADEMIC_FOUNDATION',
  'FIRST_MAJOR',
  'SECOND_MAJOR',
];

export const COURSE_LABEL: Record<TCourseType, string> = {
  COMMON_GENERAL: '공통교양',
  LIBERAL_ARTS: '일반교양',
  ACADEMIC_FOUNDATION: '학문기초',
  FIRST_MAJOR: '제1전공',
  SECOND_MAJOR: '제2전공',
};
