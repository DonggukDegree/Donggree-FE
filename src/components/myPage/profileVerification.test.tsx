/** [프로필 관리] PDF 본인 인증과 학교 이메일 인증 표시 분리 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProfileVerification from '@/components/myPage/profileVerification';

const state = vi.hoisted(() => ({
  schoolEmailVerified: false,
  isPending: false,
}));

vi.mock('@/hooks/user/useSchoolEmailVerification', () => ({
  default: () => ({ data: { schoolEmailVerified: state.schoolEmailVerified }, isPending: state.isPending }),
}));

const render = (identityVerified = false) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ProfileVerification identityVerified={identityVerified} />
    </MemoryRouter>,
  );

describe('프로필 인증 표시', () => {
  beforeEach(() => {
    state.schoolEmailVerified = false;
    state.isPending = false;
  });

  it('본인 인증 칩 아래에 학교 이메일 미완료 칩과 인증 버튼 표시', () => {
    const html = render();
    expect(html).toContain('학교 이메일 인증 미완료');
    expect(html).toContain('학교 이메일로 인증하기');
    expect(html.indexOf('본인 인증 미완료')).toBeLessThan(html.indexOf('학교 이메일 인증 미완료'));
    expect(html.indexOf('학교 이메일 인증 미완료')).toBeLessThan(html.indexOf('학교 이메일로 인증하기'));
  });

  it('학교 이메일 인증 완료 시 버튼 대신 초록색 칩 표시, PDF 미인증 유지', () => {
    state.schoolEmailVerified = true;
    const html = render();
    expect(html).toContain('본인 인증 미완료');
    expect(html).toContain('학교 이메일 인증 완료');
    expect(html).toContain('bg-chip-green-bg text-chip-green');
    expect(html).not.toContain('학교 이메일 인증 미완료');
    expect(html).not.toContain('학교 이메일로 인증하기');
  });

  it('두 인증을 모두 완료한 경우 각각 완료 표시', () => {
    state.schoolEmailVerified = true;
    const html = render(true);
    expect(html).toContain('본인 인증 완료');
    expect(html).toContain('학교 이메일 인증 완료');
  });

  it('PDF 본인 인증만 완료한 경우에도 학교 이메일 미완료와 인증 버튼 표시', () => {
    const html = render(true);
    expect(html).toContain('본인 인증 완료');
    expect(html).toContain('학교 이메일 인증 미완료');
    expect(html).toContain('학교 이메일로 인증하기');
    expect(html).not.toContain('학교 이메일 인증 완료');
  });

  it('인증 상태 조회 중에는 인증 버튼 비활성화', () => {
    state.isPending = true;
    expect(render()).toMatch(/<button[^>]*disabled=""/);
  });
});
