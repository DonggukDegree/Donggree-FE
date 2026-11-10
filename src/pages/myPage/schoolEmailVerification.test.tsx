/** [학교 이메일 인증] 인증 완료 회원의 재인증 차단과 고정 도메인 표시 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SchoolEmailVerification from '@/pages/myPage/schoolEmailVerification';

const state = vi.hoisted(() => ({
  status: { identityVerified: false, schoolEmailVerified: false, schoolEmail: null as string | null },
  form: {
    localPart: '',
    code: '',
    emailError: '',
    codeError: '',
    requestedLocalPart: '',
    resendSeconds: 0,
    expirySeconds: 0,
    isBusy: false,
    isRequesting: false,
    isConfirming: false,
    isConfirmed: false,
    changeLocalPart: vi.fn(),
    changeCode: vi.fn(),
    requestCode: vi.fn(),
    verifyCode: vi.fn(),
  },
}));

vi.mock('@/hooks/user/useSchoolEmailVerification', () => ({
  default: () => ({ data: state.status, isPending: false, isError: false }),
}));
vi.mock('@/hooks/user/useSchoolEmailVerificationForm', () => ({ default: () => state.form }));

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <SchoolEmailVerification />
    </MemoryRouter>,
  );

describe('학교 이메일 인증 화면', () => {
  beforeEach(() => {
    state.status = { identityVerified: false, schoolEmailVerified: false, schoolEmail: null };
    state.form.requestedLocalPart = '';
    state.form.expirySeconds = 0;
    state.form.isConfirmed = false;
  });

  it('아이디 입력과 고정 도메인을 표시하고 드롭다운은 제공하지 않음', () => {
    const html = render();
    expect(html).toContain('@dgu.ac.kr');
    expect(html).toContain('school-email-id');
    expect(html).not.toContain('<select');
    expect(html).not.toContain('school-email-code');
  });

  it('PDF 본인 인증 회원에게도 학교 이메일 입력 폼 표시', () => {
    state.status.identityVerified = true;
    const html = render();
    expect(html).toContain('>학교 이메일 인증</h1>');
    expect(html).toContain('school-email-id');
    expect(html).not.toContain('>인증 완료</h1>');
  });

  it('학교 이메일 인증 회원에게 요청한 완료 문구와 닫기 버튼 표시', () => {
    state.status.schoolEmailVerified = true;
    state.status.schoolEmail = 'student@dgu.ac.kr';
    const html = render();
    expect(html).toContain('>인증 완료</h1>');
    expect(html).toContain('학교 이메일 인증이 정상적으로 완료 되었어요.');
    expect(html).toContain(
      '이제 동그리의 다양한 서비스를 사용할 수 있어요.\n사용하다가 미흡한 점이 있으면 고객지원에 문의해주세요.',
    );
    expect(html).toContain('>닫기</button>');
    expect(html).not.toContain('>학교 이메일 인증</h1>');
    expect(html).not.toContain('<input');
  });

  it('인증 성공 직후에도 재조회 후와 동일한 완료 화면 표시', () => {
    state.form.isConfirmed = true;
    const html = render();
    state.status.schoolEmailVerified = true;
    expect(render()).toBe(html);
  });

  it('코드가 만료되면 입력을 잠그고 별도 인증 버튼을 표시하지 않음', () => {
    state.form.requestedLocalPart = 'student';
    const html = render();
    expect(html).toContain('인증 코드가 만료되었어요');
    expect(html).toMatch(/id="school-email-code"[^>]*disabled=""/);
    expect(html).not.toContain('>인증하기</button>');
  });
});
