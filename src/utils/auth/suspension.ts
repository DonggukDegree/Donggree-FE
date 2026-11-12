// [인증] 이용 제한(정지) 회원 안내. BE가 로그인 콜백 쿼리나 403(AUTH403_2) 응답 result로 정지 내용을 보낸다.

export const MEMBER_SUSPENDED_CODE = 'AUTH403_2';
export const SUSPENSION_TOAST_ID = 'member-suspended';

export type TSuspension = {
  suspendedUntil: string; // 이 시각부터 다시 이용 가능(ISO)
  days: number;
  byReport: boolean; // 신고 처리로 인한 정지인지(아니면 운영 정책에 따른 관리자 정지)
};

const pad = (value: number) => String(value).padStart(2, '0');

// "2026.12.13 10:00" 형태. 서버 시각(KST) 문자열을 그대로 읽는다.
export const formatSuspensionUntil = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// 기존 공용 토스트에 문구만 넣는다. 고객지원은 헤더에서 들어갈 수 있어 버튼은 두지 않는다.
export const formatSuspensionMessage = ({ suspendedUntil, days, byReport }: TSuspension) =>
  `${byReport ? '신고로' : '운영 정책에 따라'} ${days}일 동안 동그리를 이용할 수 없어요. ` +
  `${formatSuspensionUntil(suspendedUntil)}부터 다시 이용할 수 있어요. 문의사항이 있다면 고객지원으로 문의해주세요.`;

// 로그인 콜백 쿼리에서 정지 내용을 읽는다. 정지가 아니면 null.
export const parseSuspensionParams = (params: URLSearchParams): TSuspension | null => {
  const suspendedUntil = params.get('suspendedUntil');
  if (!suspendedUntil) return null;
  return {
    suspendedUntil,
    days: Number(params.get('suspensionDays') ?? 0),
    byReport: params.get('suspensionByReport') === 'true',
  };
};

// API 오류 응답이 정지 차단이면 정지 내용을, 아니면 null.
export const getSuspensionFromError = (data: unknown): TSuspension | null => {
  if (typeof data !== 'object' || data === null) return null;
  const { code, result } = data as { code?: unknown; result?: unknown };
  if (code !== MEMBER_SUSPENDED_CODE || typeof result !== 'object' || result === null) return null;
  const suspension = result as Partial<TSuspension>;
  if (typeof suspension.suspendedUntil !== 'string') return null;
  return {
    suspendedUntil: suspension.suspendedUntil,
    days: Number(suspension.days ?? 0),
    byReport: Boolean(suspension.byReport),
  };
};
