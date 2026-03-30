export type UiRole = 'candidate' | 'recruiter';
export type AuthAction = 'login' | 'signup' | 'forgot-password';

export const VALID_ROLES: UiRole[] = ['candidate', 'recruiter'];
export const VALID_ACTIONS: AuthAction[] = ['login', 'signup', 'forgot-password'];

export function parseAuthRoute(pathname: string): {
  role?: UiRole;
  action?: AuthAction;
  isValid: boolean;
} {
  const segments = pathname.split('/').filter(Boolean);

  const role = segments[0] as UiRole | undefined;
  const action = segments[1] as AuthAction | undefined;

  const isValid =
    !!role &&
    !!action &&
    VALID_ROLES.includes(role) &&
    VALID_ACTIONS.includes(action);

  return { role, action, isValid };
}
