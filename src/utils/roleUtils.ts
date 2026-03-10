import type { UserRole } from '../types';

export const canAccessUsers = (role: string | undefined): boolean =>
  role === 'superuser' || role === 'admin';

export const isSuperuser = (role: string | undefined): boolean =>
  role === 'superuser';

export const isAdminOrSuperuser = (role: string | undefined): boolean =>
  role === 'admin' || role === 'superuser';

export const isOperatorOrAdmin = (role: string | undefined): boolean =>
  role === 'admin' || role === 'operator';

export const hasRole = (role: string | undefined, allowedRoles: UserRole[]): boolean =>
  !!role && allowedRoles.includes(role as UserRole);
