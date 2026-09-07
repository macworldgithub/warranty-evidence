import type { Permission } from '../types/permissions';

export interface NavigationItem {
  name: string;
  href: string;
  permission: Permission;
  icon: string;
  badge?: string;
}

export const ALL_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    permission: 'dashboard.view',
    icon: 'dashboard',
  },
  {
    name: 'Users',
    href: '/users',
    permission: 'users.view',
    icon: 'users',
  },
  {
    name: 'Warranties',
    href: '/warranties',
    permission: 'warranties.view',
    icon: 'warranties',
  },
  {
    name: 'Cases',
    href: '/cases',
    permission: 'cases.view',
    icon: 'cases',
  },
  {
    name: 'Evidence',
    href: '/evidence',
    permission: 'evidence.view',
    icon: 'evidence',
  },
  {
    name: 'Reviews',
    href: '/reviews',
    permission: 'reviews.view',
    icon: 'reviews',
  },
  {
    name: 'Tasks',
    href: '/tasks',
    permission: 'tasks.view',
    icon: 'tasks',
  },
  {
    name: 'Reports',
    href: '/reports',
    permission: 'reports.view',
    icon: 'reports',
  },
  {
    name: 'Audit Logs',
    href: '/audit-logs',
    permission: 'audit.view',
    icon: 'audit',
  },
  {
    name: 'Settings',
    href: '/settings',
    permission: 'settings.view',
    icon: 'settings',
  },
];

export function getFilteredNavigation(userPermissions: string[] = []): NavigationItem[] {
  return ALL_NAVIGATION_ITEMS.filter((item) => userPermissions.includes(item.permission));
}
