// 포인트 표시. 1,100P처럼 천 단위 쉼표와 P를 붙인다.
export const formatPoints = (points: number) => `${points.toLocaleString('ko-KR')}P`;

// 적립액은 + 부호를 붙인다.
export const formatPointAmount = (amount: number) => `+${formatPoints(amount)}`;

// 서버 시각(KST, 오프셋 없는 ISO)을 연.월.일로 표시한다.
export const formatPointDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : '';
};
