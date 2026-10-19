/** [성적표 업로드] 학점 차이가 없어도 F 확인 안내가 누락되지 않는지 검증한다. */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { TPutTranscriptResult } from '@/types/report/TPutTranscript';
import { buildTranscriptUploadNotice } from '@/utils/report/transcriptUploadNotice';

const result: TPutTranscriptResult = { totalCredits: 3, recordedCredits: 3, creditGap: 0, gradeReviewCourses: [] };
const review = [
  { semester: '2025-1', courseCode: '777700', courseName: '교류1' },
  { semester: '2025-2', courseCode: '777700', courseName: '교류2' },
];
describe('업로드 확인 모달', () => {
  it('학점 일치·확인 대상 없음이면 모달 생략', () => {
    expect(buildTranscriptUploadNotice(result)).toBeNull();
  });
  it('학점이 맞아도 모호한 F의 개수와 확인 방법을 본문 두 줄로 안내', () => {
    const notice = buildTranscriptUploadNotice({ ...result, gradeReviewCourses: review });
    expect(notice?.title).toBe('일부 F 과목의 평가방식을 확인해주세요');
    expect(notice?.description).toContain('2개 과목');
    expect(notice?.description?.split('\n')).toHaveLength(2);
    expect(notice?.description).toContain('F(등급)');
    expect(notice?.description).toContain('F(NP)');
    expect(notice?.description).not.toContain('모자라요');
  });
  it.each([2, -2])('학점 차이와 F 확인을 한 모달로 보존: %s', (creditGap) => {
    const notice = buildTranscriptUploadNotice({ ...result, creditGap, gradeReviewCourses: review });
    expect(notice?.title).toBe('동그리가 정확한 분석에 실패했어요');
    expect(renderToStaticMarkup(notice?.subtitle)).toBe('취득학점과 일부 F 과목의 확인이 필요해요');
    expect(notice?.description).toContain(creditGap > 0 ? '2학점 모자라고' : '2학점 많고');
    expect(notice?.description).toContain('F(등급)·F(NP)');
    expect(notice?.description?.split('\n')).toHaveLength(2);
  });
  it('이전 서버 응답에는 기존 학점 안내 유지', () => {
    const legacy = { totalCredits: 3, recordedCredits: 3, creditGap: 0 };
    expect(buildTranscriptUploadNotice(legacy as TPutTranscriptResult)).toBeNull();
    expect(buildTranscriptUploadNotice({ ...legacy, creditGap: 2 } as TPutTranscriptResult)?.title).toBe(
      '동그리가 정확한 분석에 실패했어요',
    );
  });
});
