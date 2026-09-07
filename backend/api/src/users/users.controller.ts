import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import type { ApiSuccessResponse } from '../common/interfaces/api-response.interface.js';
import type { UserDocument } from './schemas/user.schema.js';

@Controller('users')
@UseGuards(SupabaseAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.view')
  async getAllUsers(): Promise<ApiSuccessResponse<UserDocument[]>> {
    const users = await this.usersService.findAll();
    return {
      success: true,
      data: users,
    };
  }
}
