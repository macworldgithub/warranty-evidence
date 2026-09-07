import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../../common/constants/permissions.constant.js';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
