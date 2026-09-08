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
  // Phase 4: Brand, Site, and Brand Pack Permissions
  'brands.view',
  'brands.create',
  'brands.update',
  'sites.view',
  'sites.create',
  'sites.update',
  'brand_packs.view',
  'brand_packs.create',
  'brand_packs.update',
  'brand_packs.publish',
  'brand_packs.archive',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [...ALL_PERMISSIONS],

  MANAGER: [
    'dashboard.view',
    'warranties.view',
    'warranties.create',
    'warranties.update',
    'cases.view',
    'cases.create',
    'cases.update',
    'cases.assign',
    'evidence.view',
    'reviews.view',
    'reviews.create',
    'reviews.update',
    'tasks.view',
    'tasks.create',
    'tasks.update',
    'tasks.assign',
    'reports.view',
    // Phase 4: Managers have read-only visibility into Brands, Sites, and Brand Packs
    'brands.view',
    'sites.view',
    'brand_packs.view',
  ],

  CLERK: [
    'dashboard.view',
    'warranties.view',
    'warranties.create',
    'warranties.update',
    'cases.view',
    'cases.create',
    'cases.update',
    'evidence.view',
    'evidence.create',
    'evidence.update',
    'reviews.view',
    'reviews.create',
    'reviews.update',
    'tasks.view',
    // Phase 4: Clerks have read-only visibility into Brands, Sites, and Brand Packs
    'brands.view',
    'sites.view',
    'brand_packs.view',
  ],

  ADVISOR: [
    'dashboard.view',
    'warranties.view',
    'cases.view',
    'cases.create',
    'cases.update',
    'evidence.view',
    'reviews.view',
    'tasks.view',
  ],

  TECHNICIAN: [],
};

export function getPermissionsForRole(role: UserRole | string): Permission[] {
  if (role === 'OPERATIONS') {
    return ROLE_PERMISSIONS['CLERK'];
  }
  return ROLE_PERMISSIONS[role as UserRole] ?? [];
}
