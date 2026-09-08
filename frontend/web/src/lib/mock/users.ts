import type { UserRole } from '../../types/auth';

export interface MockUser {
  id: string;
  supabaseUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  createdAt: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-01',
    supabaseUserId: '0df3ed0d-d535-439b-9724-7a209f517fe0',
    email: 'admin@booran.com',
    firstName: 'Sarah',
    lastName: 'Connor',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLogin: '2026-09-07 15:42',
    createdAt: '2026-01-15',
  },
  {
    id: 'user-02',
    supabaseUserId: 'sub-manager-seed-01',
    email: 'manager@booran.com',
    firstName: 'David',
    lastName: 'Park',
    role: 'MANAGER',
    status: 'ACTIVE',
    lastLogin: '2026-09-07 14:15',
    createdAt: '2026-01-16',
  },
  {
    id: 'user-03',
    supabaseUserId: '7a7fc03e-d911-451b-9703-fd48d6445c06',
    email: 'abdulahadnauman10@gmail.com',
    firstName: 'Abdul',
    lastName: 'Ahad',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLogin: '2026-09-07 16:00',
    createdAt: '2026-09-07',
  },
  {
    id: 'user-04',
    supabaseUserId: 'sub-clerk-seed-01',
    email: 'clerk@booran.com',
    firstName: 'Marcus',
    lastName: 'Vance',
    role: 'CLERK',
    status: 'ACTIVE',
    lastLogin: '2026-09-07 16:05',
    createdAt: '2026-02-01',
  },
  {
    id: 'user-05',
    supabaseUserId: 'sub-advisor-seed-01',
    email: 'advisor@booran.com',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    role: 'ADVISOR',
    status: 'ACTIVE',
    lastLogin: '2026-09-06 11:20',
    createdAt: '2026-02-10',
  },
  {
    id: 'user-06',
    supabaseUserId: 'sub-tech-seed-01',
    email: 'tech@booran.com',
    firstName: 'James',
    lastName: 'Miller',
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    lastLogin: '2026-08-22 09:12',
    createdAt: '2026-03-01',
  },
  {
    id: 'user-07',
    supabaseUserId: 'c9640bf4-3310-4777-9c87-7070dcb842d5',
    email: 'abdulahad.operations@gmail.com',
    firstName: 'Abdul',
    lastName: 'Operations',
    role: 'CLERK',
    status: 'ACTIVE',
    lastLogin: '2026-09-07 16:05',
    createdAt: '2026-09-07',
  },
];
