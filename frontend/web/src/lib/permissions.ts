import type { UserRole } from '../types/auth';
import type { Permission } from '../types/permissions';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'dashboard.view',
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'warranties.view',
    'warranties.create',
    'warranties.update',
    'cases.view',
    'cases.create',
    'cases.update',
    'cases.assign',
    'evidence.view',
    'evidence.create',
    'evidence.update',
    'evidence.delete',
    'reviews.view',
    'reviews.create',
    'reviews.update',
    'tasks.view',
    'tasks.create',
    'tasks.update',
    'tasks.assign',
    'reports.view',
    'audit.view',
    'settings.view',
    'settings.update',
  ],
  OPERATIONS: [
    'dashboard.view',
    'warranties.view',
    'warranties.create',
    'warranties.update',
    'cases.view',
    'cases.create',
    'cases.update',
    'cases.assign',
    'evidence.view',
    'evidence.create',
    'evidence.update',
    'reviews.view',
    'reviews.create',
    'reviews.update',
    'tasks.view',
    'tasks.create',
    'tasks.update',
    'tasks.assign',
  ],
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(
  userPermissions: string[] | undefined,
  permission: Permission,
): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(permission);
}

export function hasAnyPermission(
  userPermissions: string[] | undefined,
  permissions: Permission[],
): boolean {
  if (!userPermissions) return false;
  return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(
  userPermissions: string[] | undefined,
  permissions: Permission[],
): boolean {
  if (!userPermissions) return false;
  return permissions.every((p) => userPermissions.includes(p));
}
