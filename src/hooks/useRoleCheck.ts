import { useState, useEffect } from 'react';
import { userStore } from '../userStore';
import {
  canAccessUsers,
  isSuperuser,
  isAdminOrSuperuser,
  isOperatorOrAdmin,
  hasRole,
} from '../utils/roleUtils';
import type { UserRole } from '../types';

export interface UseRoleCheckResult {
  user: ReturnType<typeof userStore.getUser>;
  role: string | undefined;
  canAccessUsers: boolean;
  isSuperuser: boolean;
  isAdminOrSuperuser: boolean;
  isOperatorOrAdmin: boolean;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

export const useRoleCheck = (): UseRoleCheckResult => {
  const [user, setUser] = useState(userStore.getUser());

  useEffect(() => {
    const updateUser = (u: ReturnType<typeof userStore.getUser>) => {
      setUser(u);
    };

    updateUser(userStore.getUser());
    const unsub = userStore.subscribe(updateUser);

    return () => {
      unsub();
    };
  }, []);

  const role = user?.role;

  return {
    user,
    role,
    canAccessUsers: canAccessUsers(role),
    isSuperuser: isSuperuser(role),
    isAdminOrSuperuser: isAdminOrSuperuser(role),
    isOperatorOrAdmin: isOperatorOrAdmin(role),
    hasRole: (allowedRoles: UserRole[]) => hasRole(role, allowedRoles),
  };
};
