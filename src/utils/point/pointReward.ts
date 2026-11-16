/**
 * [포인트] 적립 안내 확인
 * 방금 한 활동으로 처음 받은 적립액을 돌려준다. 적립이 없거나 이미 안내했거나 확인에 실패하면 null이며,
 * 확인 실패가 원래 활동의 성공 안내를 막지 않도록 오류를 삼킨다.
 */
import { postPointRewardAcknowledge } from '@/apis/point/point';
import type { TPointRewardAcknowledgeRequest } from '@/types/point/TPoint';
import { formatPoints } from '@/utils/point/point';

// 완료 안내 뒤에 이번 적립액을 붙인다. 적립이 없으면 안내만 그대로.
export const withRewardSuffix = (message: string, amount: number | null) =>
  amount === null ? message : `${message} (${formatPoints(amount)} 적립)`;

export const acknowledgePointReward = async (request: TPointRewardAcknowledgeRequest): Promise<number | null> => {
  try {
    const result = await postPointRewardAcknowledge(request);
    return result.rewarded ? result.amount : null;
  } catch {
    return null;
  }
};
