export type TUserRole = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';

type TJwtPayload = {
  role?: unknown;
  memberId?: unknown;
};

const ROLE_PRIORITY: Record<TUserRole, number> = {
  STUDENT: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

const normalizeRole = (role: unknown): TUserRole | null => {
  if (typeof role !== 'string') return null;
  const normalized = role.replace(/^ROLE_/, '').toUpperCase();
  if (normalized === 'STUDENT' || normalized === 'ADMIN' || normalized === 'SUPER_ADMIN') {
    return normalized;
  }
  return null;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(normalized + padding);
};

// 액세스 토큰의 JWT payload를 디코드한다. 서명 검증은 서버 몫이고,
// 여기서는 화면 분기·계측에 쓸 클레임만 읽으므로 파싱 실패는 조용히 null로 떨어뜨린다.
const decodeAccessTokenPayload = (accessToken: string | null): TJwtPayload | null => {
  if (!accessToken) return null;

  const [, payload] = accessToken.split('.');
  if (!payload) return null;

  try {
    return JSON.parse(decodeBase64Url(payload)) as TJwtPayload;
  } catch {
    return null;
  }
};

// 액세스 토큰의 JWT payload에서 role 클레임을 읽는다.
// 토큰이 비어 있거나 JWT 형식이 아니면 null을 반환해 라우팅 게이트에서 차단하게 한다.
export const getRoleFromAccessToken = (accessToken: string | null): TUserRole | null => {
  const decoded = decodeAccessTokenPayload(accessToken);
  if (!decoded) return null;
  return normalizeRole(decoded.role);
};

// 액세스 토큰의 memberId 클레임을 읽는다. GA4 user_id로만 쓴다.
// 서버가 숫자로 넣지만 JWT는 JSON이라 타입을 보장할 수 없어 숫자일 때만 통과시킨다.
export const getMemberIdFromAccessToken = (accessToken: string | null): number | null => {
  const decoded = decodeAccessTokenPayload(accessToken);
  if (!decoded) return null;
  return typeof decoded.memberId === 'number' ? decoded.memberId : null;
};

export const isAdminRole = (role: TUserRole | null) => {
  if (!role) return false;
  return ROLE_PRIORITY[role] >= ROLE_PRIORITY.ADMIN;
};
