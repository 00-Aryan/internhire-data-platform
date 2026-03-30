// lib/auth/roleMap.ts
export const ROLE_MAP = {
  candidate: 'CANDIDATE',
  recruiter: 'RECRUITER',
} as const;

export type UiRole = keyof typeof ROLE_MAP;
export type ApiRole = typeof ROLE_MAP[UiRole];
