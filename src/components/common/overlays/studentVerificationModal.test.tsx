/** [공용] 학생 인증 안내 모달의 두 인증 경로 배치·화면별 문구 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import StudentVerificationModal from '@/components/common/overlays/studentVerificationModal';
import type { TVerificationContext } from '@/stores/modalStore';

// 서버 렌더는 스토어 초기값만 읽으므로, 띄운 화면(context)은 선택자 모의로 바꾼다.
const store = vi.hoisted(() => ({ verificationContext: 'place' as TVerificationContext, closeModal: () => {} }));
vi.mock('@/stores/modalStore', () => ({
  useModalStore: <T,>(selector: (state: typeof store) => T) => selector(store),
}));

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <StudentVerificationModal />
    </MemoryRouter>,
  );

describe('학생 인증 안내 모달', () => {
  afterEach(() => {
    store.verificationContext = 'place';
  });

  it('두 인증 버튼을 한 줄에 대등하게 두고 닫기는 그 아래에 표시', () => {
    const html = render();
    expect(html).toContain('학생 인증이 필요해요');
    const row = /<div class="flex w-full gap-2">(.*?)<\/div>/.exec(html)?.[1] ?? '';
    expect(row).toContain('학교 이메일 인증하기');
    expect(row).toContain('성적표로 인증하기');
    expect(row.match(/flex-1/g)).toHaveLength(2);
    expect(html.indexOf('성적표로 인증하기')).toBeLessThan(html.indexOf('>닫기<'));
  });

  it('동글맵에서 띄우면 장소 문구, 동아리에서 띄우면 동아리 문구를 표시', () => {
    expect(render()).toContain('장소 등록과 리뷰는 인증된 동국대 학생만 할 수 있어요.');
    store.verificationContext = 'club';
    const html = render();
    expect(html).toContain('동아리 등록과 수정은 인증된 동국대 학생만 할 수 있어요.');
    expect(html).not.toContain('장소 등록');
  });
});
