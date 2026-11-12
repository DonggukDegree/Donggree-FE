/** [관리자 > 신고 관리] 정지 모달의 일수 입력칸·메모·대상 회원 표시 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import SuspensionDialog from '@/components/admin/report/suspensionDialog';

describe('회원 정지 모달', () => {
  it('대상 회원 행과 일수 입력칸(빠른 선택 없음)·메모·즉시 차단 안내를 보여줌', () => {
    const html = renderToStaticMarkup(
      <SuspensionDialog
        member={{
          memberId: 7,
          nickname: '김아코',
          name: '김아코',
          studentId: '2026000001',
          collegeName: null,
          departmentName: null,
          suspendedUntil: null,
        }}
        title="리뷰 신고로 작성자 정지"
        isSubmitting={false}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(html).toContain('리뷰 신고로 작성자 정지');
    expect(html).toContain('김아코 · 2026000001 · 학과 정보 없음');
    expect(html).toContain('aria-label="정지 일수"');
    expect(html).not.toMatch(/7일|14일|30일/);
    expect(html).toContain('maxLength="200"');
    expect(html).toContain('기존 로그인도 바로 끊겨요');
  });
});
