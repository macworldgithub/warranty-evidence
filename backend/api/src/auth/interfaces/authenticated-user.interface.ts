import type { UserRole, UserStatus } from '../../users/schemas/user.schema.js';
import type { Permission } from '../../common/constants/permissions.constant.js';

export interface AuthenticatedUser {
  id: string;
  supabaseUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
}
