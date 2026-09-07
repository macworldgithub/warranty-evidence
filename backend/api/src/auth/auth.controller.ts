import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface.js';
import type { ApiSuccessResponse } from '../common/interfaces/api-response.interface.js';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): ApiSuccessResponse<AuthenticatedUser> {
    return {
      success: true,
      data: user,
    };
  }

  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  logout(): ApiSuccessResponse<{ loggedOut: true }> {
    return {
      success: true,
      data: { loggedOut: true },
    };
  }
}
