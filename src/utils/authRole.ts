export type TUserRole = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';

type TJwtPayload = {
  role?: unknown;
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

// 액세스 토큰의 JWT payload에서 role 클레임을 읽는다.
// 토큰이 비어 있거나 JWT 형식이 아니면 null을 반환해 라우팅 게이트에서 차단하게 한다.
export const getRoleFromAccessToken = (accessToken: string | null): TUserRole | null => {
  if (!accessToken) return null;

  const [, payload] = accessToken.split('.');
  if (!payload) return null;

  try {
    const decoded = JSON.parse(decodeBase64Url(payload)) as TJwtPayload;
    return normalizeRole(decoded.role);
  } catch {
    return null;
  }
};

export const isAdminRole = (role: TUserRole | null) => {
  if (!role) return false;
  return ROLE_PRIORITY[role] >= ROLE_PRIORITY.ADMIN;
};
