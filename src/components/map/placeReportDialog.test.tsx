/** [동글맵 > 장소 신고] 신고 사유 6종·내용 필수 표시·오류 표시 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlaceReportDialog from '@/components/map/placeReportDialog';
import type { TPlaceReportForm, TPlaceReportFormErrors } from '@/utils/place/placeReport';

const state = vi.hoisted(() => ({
  form: { reason: null, description: '' } as TPlaceReportForm,
  errors: {} as TPlaceReportFormErrors,
  isConfirming: false,
}));

vi.mock('@/hooks/place/usePlaceReportForm', () => ({
  default: () => ({ form: state.form, errors: state.errors, isSubmitting: false, isConfirming: state.isConfirming }),
}));

const render = () =>
  renderToStaticMarkup(
    <PlaceReportDialog place={{ id: 1, name: '동국반점', category: 'RESTAURANT' }} onClose={vi.fn()} />,
  );

describe('장소 신고 모달', () => {
  beforeEach(() => {
    state.form = { reason: null, description: '' };
    state.errors = {};
    state.isConfirming = false;
  });

  it('장소 이름과 관리자 확인 안내, 신고 사유 6종을 보여줌', () => {
    const html = render();
    expect(html).toContain('role="dialog"');
    expect(html).toContain('동국반점');
    expect(html).toContain('관리자가 확인한 뒤');
    for (const label of [
      '폐업했어요',
      '위치가 달라요',
      '이름이 달라요',
      '중복된 장소예요',
      '부적절한 내용이 있어요',
      '기타',
    ])
      expect(html).toContain(label);
    expect(html.match(/type="radio"/g)).toHaveLength(6);
    expect(html).toContain('선택');
    expect(html).toContain('신고하기');
  });

  it('기타를 고르면 내용이 필수로 바뀌고 오류를 표시', () => {
    state.form = { reason: 'OTHER', description: '' };
    state.errors = { description: '기타 사유는 내용을 적어주세요.' };
    const html = render();
    expect(html).toMatch(/<input(?=[^>]*value="OTHER")(?=[^>]*checked="")[^>]*>/);
    expect(html).toContain('필수');
    expect(html).toMatch(/type="radio"[^>]*appearance-none[^>]*checked:border-primary-60/);
    expect(html).not.toContain('accent-primary-60');
    expect(html).toContain('기타 사유는 내용을 적어주세요.');
  });

  it('신고하기를 누르면 확인 모달로 허위 신고 제재를 알리고, 누르기 전에는 띄우지 않음', () => {
    expect(render()).not.toContain('role="alertdialog"');

    state.form = { reason: 'CLOSED', description: '' };
    state.isConfirming = true;
    const html = render();
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain('이 장소를 신고할까요?');
    expect(html).toContain('허위 신고는 서비스 이용 제한 등 제재');
    expect(html).toContain('돌아가기');
  });
});
