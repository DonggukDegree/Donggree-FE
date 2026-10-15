export const MAJOR_ROLES = ['SINGLE_PRIMARY', 'DUAL_PRIMARY', 'SECONDARY'] as const;

export type TMajorRole = (typeof MAJOR_ROLES)[number];

export const MAJOR_ROLE_LABEL: Record<TMajorRole, string> = {
  SINGLE_PRIMARY: '단일전공',
  DUAL_PRIMARY: '복수전공자의 주전공',
  SECONDARY: '복수전공자의 복수전공',
};
