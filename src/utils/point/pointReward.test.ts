import { beforeEach, describe, expect, it, vi } from 'vitest';

import { acknowledgePointReward, withRewardSuffix } from '@/utils/point/pointReward';

const post = vi.hoisted(() => vi.fn());
vi.mock('@/apis/point/point', () => ({ postPointRewardAcknowledge: post }));

describe('포인트 적립 안내', () => {
  beforeEach(() => post.mockReset());

  it('처음 안내하는 적립이면 적립액, 아니면 null', async () => {
    post.mockResolvedValueOnce({ rewarded: true, amount: 100 });
    await expect(acknowledgePointReward({ reason: 'PLACE_INFO_EDIT', targetId: 10 })).resolves.toBe(100);
    expect(post).toHaveBeenCalledWith({ reason: 'PLACE_INFO_EDIT', targetId: 10 });

    post.mockResolvedValueOnce({ rewarded: false, amount: 0 });
    await expect(acknowledgePointReward({ reason: 'GRADUATION_REPORT_FIRST_VIEW' })).resolves.toBeNull();
  });

  it('확인 요청이 실패해도 원래 안내를 막지 않도록 null', async () => {
    post.mockRejectedValueOnce(new Error('network'));
    await expect(acknowledgePointReward({ reason: 'PLACE_INFO_EDIT', targetId: 10 })).resolves.toBeNull();
  });

  it('적립이 있으면 완료 안내 뒤에 (100P 적립)', () => {
    expect(withRewardSuffix('장소 정보를 수정했어요.', 100)).toBe('장소 정보를 수정했어요. (100P 적립)');
    expect(withRewardSuffix('장소 정보를 수정했어요.', null)).toBe('장소 정보를 수정했어요.');
  });
});
