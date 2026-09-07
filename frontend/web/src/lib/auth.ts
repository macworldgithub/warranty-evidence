import type { User, UserRole } from '../types/auth';
import { getPermissionsForRole } from './permissions';

export const DEMO_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 'usr-admin-01',
    email: 'admin@booran.com',
    firstName: 'Sarah',
    lastName: 'Connor',
    role: 'ADMIN',
    department: 'Executive Operations',
  },
  OPERATIONS: {
    id: 'usr-ops-01',
    email: 'ops@booran.com',
    firstName: 'Marcus',
    lastName: 'Vance',
    role: 'OPERATIONS',
    department: 'Warranty Claims & Dispatch',
  },
};

export function lookupKnownRole(email: string, userMetaRole?: string): UserRole {
  if (userMetaRole === 'ADMIN' || userMetaRole === 'OPERATIONS') {
    return userMetaRole;
  }
  const clean = email.toLowerCase().trim();
  if (clean === 'abdulahadnauman10@gmail.com' || clean === 'admin@booran.com' || clean.includes('admin')) {
    return 'ADMIN';
  }
  if (clean === 'abdulahad.operations@gmail.com' || clean === 'ops@booran.com' || clean.includes('ops')) {
    return 'OPERATIONS';
  }
  return 'OPERATIONS';
}

const STORAGE_KEY = 'booran_current_user';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getUserWithPermissions(user: User | null) {
  if (!user) {
    return {
      user: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
    };
  }
  return {
    user,
    role: user.role,
    permissions: getPermissionsForRole(user.role),
    isAuthenticated: true,
  };
}
