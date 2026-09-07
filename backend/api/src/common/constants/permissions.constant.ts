import type { UserRole } from '../../users/schemas/user.schema.js';

export const ALL_PERMISSIONS = [
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
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [...ALL_PERMISSIONS],
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
    'evidence.delete',
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
  return ROLE_PERMISSIONS[role] ?? [];
}
