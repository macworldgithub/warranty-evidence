import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface.js';
import type { ApiSuccessResponse } from '../common/interfaces/api-response.interface.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate with email & password to retrieve JWT access token',
    description: 'Use the returned accessToken in the Swagger "Authorize" dialog to test protected endpoints.',
  })
  @ApiResponse({ status: 200, description: 'Login successful — returns JWT bearer token' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<
    ApiSuccessResponse<{
      accessToken: string;
      refreshToken?: string;
      user: AuthenticatedUser;
    }>
  > {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result,
    };
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user profile and assigned sites' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Invalidate current user session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(): ApiSuccessResponse<{ loggedOut: true }> {
    return {
      success: true,
      data: { loggedOut: true },
    };
  }
}
