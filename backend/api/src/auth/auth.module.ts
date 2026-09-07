import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';

@Global()
@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard, PermissionsGuard],
  exports: [AuthService, SupabaseAuthGuard, PermissionsGuard],
})
export class AuthModule {}
