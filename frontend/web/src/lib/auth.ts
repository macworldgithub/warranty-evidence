import type { User, UserRole } from '../types/auth';
import { getPermissionsForRole } from './permissions';

export const DEMO_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 'usr-admin-01',
    email: 'admin@booran.com',
    firstName: 'Sarah',
    lastName: 'Connor',
    role: 'ADMIN',
    department: 'Group Administration',
  },
  MANAGER: {
    id: 'usr-manager-01',
    email: 'manager@booran.com',
    firstName: 'David',
    lastName: 'Park',
    role: 'MANAGER',
    department: 'Aftersales Management',
  },
  CLERK: {
    id: 'usr-clerk-01',
    email: 'clerk@booran.com',
    firstName: 'Marcus',
    lastName: 'Vance',
    role: 'CLERK',
    department: 'Warranty Processing',
  },
  ADVISOR: {
    id: 'usr-advisor-01',
    email: 'advisor@booran.com',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    role: 'ADVISOR',
    department: 'Service Advisory',
  },
  TECHNICIAN: {
    id: 'usr-tech-01',
    email: 'tech@booran.com',
    firstName: 'James',
    lastName: 'Miller',
    role: 'TECHNICIAN',
    department: 'Workshop Operations',
  },
};

const VALID_ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'CLERK', 'ADVISOR', 'TECHNICIAN'];

export function lookupKnownRole(email: string, userMetaRole?: string): UserRole {
  const clean = email.toLowerCase().trim();

  // 1. Explicit known demo & personal accounts take precedence
  if (clean === 'abdulahadnauman10@gmail.com' || clean === 'admin@booran.com') {
    return 'ADMIN';
  }
  if (clean === 'manager@booran.com') {
    return 'MANAGER';
  }
  if (clean === 'advisor@booran.com') {
    return 'ADVISOR';
  }
  if (clean === 'tech@booran.com') {
    return 'TECHNICIAN';
  }
  if (clean === 'abdulahad.operations@gmail.com' || clean === 'ops@booran.com' || clean === 'clerk@booran.com') {
    return 'CLERK';
  }

  // 2. Metadata role from Supabase (with backward compatibility for OPERATIONS -> CLERK)
  if (userMetaRole) {
    if (userMetaRole === 'OPERATIONS') return 'CLERK';
    if (VALID_ROLES.includes(userMetaRole as UserRole)) {
      return userMetaRole as UserRole;
    }
  }

  // 3. Email keyword heuristics
  if (clean.includes('admin')) return 'ADMIN';
  if (clean.includes('manager')) return 'MANAGER';
  if (clean.includes('advisor')) return 'ADVISOR';
  if (clean.includes('tech')) return 'TECHNICIAN';
  if (clean.includes('clerk') || clean.includes('ops')) return 'CLERK';

  return 'CLERK';
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

/** Map a role to its dev token string */
export function getDevTokenForRole(role: UserRole): string {
  switch (role) {
    case 'ADMIN': return 'dev-admin-token';
    case 'MANAGER': return 'dev-manager-token';
    case 'CLERK': return 'dev-clerk-token';
    case 'ADVISOR': return 'dev-advisor-token';
    case 'TECHNICIAN': return 'dev-tech-token';
    default: return 'dev-clerk-token';
  }
}
