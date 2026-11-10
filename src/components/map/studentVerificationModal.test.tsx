/** [동글맵] 학생 인증 안내 모달의 두 인증 경로 배치 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import StudentVerificationModal from '@/components/map/studentVerificationModal';

describe('학생 인증 안내 모달', () => {
  it('두 인증 버튼을 한 줄에 대등하게 두고 닫기는 그 아래에 표시', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <StudentVerificationModal />
      </MemoryRouter>,
    );
    expect(html).toContain('학생 인증이 필요해요');
    const row = /<div class="flex w-full gap-2">(.*?)<\/div>/.exec(html)?.[1] ?? '';
    expect(row).toContain('학교 이메일 인증하기');
    expect(row).toContain('성적표로 인증하기');
    expect(row.match(/flex-1/g)).toHaveLength(2);
    expect(html.indexOf('성적표로 인증하기')).toBeLessThan(html.indexOf('>닫기<'));
  });
});
