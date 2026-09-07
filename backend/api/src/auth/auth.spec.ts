import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException, ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { AuthService } from './auth.service.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface.js';
import { getPermissionsForRole } from '../common/constants/permissions.constant.js';

describe('Authentication & RBAC Unit Tests', () => {
  let authService: AuthService;
  let supabaseAuthGuard: SupabaseAuthGuard;
  let permissionsGuard: PermissionsGuard;
  let reflector: Reflector;

  const mockAdminUser: AuthenticatedUser = {
    id: 'user-admin-1',
    supabaseUserId: 'sub-admin-1',
    email: 'admin@booran.com',
    firstName: 'Sarah',
    lastName: 'Connor',
    role: 'ADMIN',
    status: 'ACTIVE',
    permissions: getPermissionsForRole('ADMIN'),
  };

  const mockOpsUser: AuthenticatedUser = {
    id: 'user-ops-1',
    supabaseUserId: 'sub-ops-1',
    email: 'ops@booran.com',
    firstName: 'Marcus',
    lastName: 'Vance',
    role: 'OPERATIONS',
    status: 'ACTIVE',
    permissions: getPermissionsForRole('OPERATIONS'),
  };

  beforeEach(() => {
    authService = {
      verifyToken: vi.fn(),
      getAuthenticatedUser: vi.fn(),
    } as unknown as AuthService;

    supabaseAuthGuard = new SupabaseAuthGuard(authService);
    reflector = new Reflector();
    permissionsGuard = new PermissionsGuard(reflector);
  });

  const createMockContext = (headers: Record<string, string>, user?: AuthenticatedUser): ExecutionContext => {
    const request = {
      headers,
      user,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  describe('SupabaseAuthGuard', () => {
    it('should throw 401 Unauthorized when no Authorization header is present', async () => {
      const context = createMockContext({});
      await expect(supabaseAuthGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw 401 Unauthorized when Authorization header is not Bearer format', async () => {
      const context = createMockContext({ authorization: 'Basic 12345' });
      await expect(supabaseAuthGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw 401 Unauthorized when token verification fails', async () => {
      vi.mocked(authService.verifyToken).mockRejectedValue(new UnauthorizedException('Invalid token'));
      const context = createMockContext({ authorization: 'Bearer invalid-token' });
      await expect(supabaseAuthGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should authenticate and attach user when token is valid', async () => {
      vi.mocked(authService.verifyToken).mockResolvedValue({
        supabaseUserId: 'sub-admin-1',
        email: 'admin@booran.com',
      });
      vi.mocked(authService.getAuthenticatedUser).mockResolvedValue(mockAdminUser);

      const context = createMockContext({ authorization: 'Bearer valid-token' });
      const canActivate = await supabaseAuthGuard.canActivate(context);

      expect(canActivate).toBe(true);
      const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
      expect(request.user).toEqual(mockAdminUser);
    });
  });

  describe('User Status Verification', () => {
    it('should allow ACTIVE users', async () => {
      vi.mocked(authService.verifyToken).mockResolvedValue({
        supabaseUserId: 'sub-admin-1',
        email: 'admin@booran.com',
      });
      vi.mocked(authService.getAuthenticatedUser).mockResolvedValue(mockAdminUser);

      const context = createMockContext({ authorization: 'Bearer valid-token' });
      expect(await supabaseAuthGuard.canActivate(context)).toBe(true);
    });

    it('should reject INACTIVE users with 401', async () => {
      vi.mocked(authService.verifyToken).mockResolvedValue({
        supabaseUserId: 'sub-inactive',
        email: 'inactive@booran.com',
      });
      vi.mocked(authService.getAuthenticatedUser).mockRejectedValue(
        new UnauthorizedException('User account is inactive. Access denied.'),
      );

      const context = createMockContext({ authorization: 'Bearer inactive-token' });
      await expect(supabaseAuthGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject SUSPENDED users with 401', async () => {
      vi.mocked(authService.verifyToken).mockResolvedValue({
        supabaseUserId: 'sub-suspended',
        email: 'suspended@booran.com',
      });
      vi.mocked(authService.getAuthenticatedUser).mockRejectedValue(
        new UnauthorizedException('User account is suspended. Access denied.'),
      );

      const context = createMockContext({ authorization: 'Bearer suspended-token' });
      await expect(supabaseAuthGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('PermissionsGuard & RBAC', () => {
    it('should allow access when no permissions are required', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext({}, mockOpsUser);
      expect(permissionsGuard.canActivate(context)).toBe(true);
    });

    it('ADMIN + users.view -> allowed', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['users.view']);
      const context = createMockContext({}, mockAdminUser);
      expect(permissionsGuard.canActivate(context)).toBe(true);
    });

    it('OPERATIONS + users.view -> 403 Forbidden', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['users.view']);
      const context = createMockContext({}, mockOpsUser);
      expect(() => permissionsGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('ADMIN + reports.view -> allowed', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['reports.view']);
      const context = createMockContext({}, mockAdminUser);
      expect(permissionsGuard.canActivate(context)).toBe(true);
    });

    it('OPERATIONS + reports.view -> 403 Forbidden', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['reports.view']);
      const context = createMockContext({}, mockOpsUser);
      expect(() => permissionsGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('ADMIN + audit.view -> allowed', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['audit.view']);
      const context = createMockContext({}, mockAdminUser);
      expect(permissionsGuard.canActivate(context)).toBe(true);
    });

    it('OPERATIONS + audit.view -> 403 Forbidden', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['audit.view']);
      const context = createMockContext({}, mockOpsUser);
      expect(() => permissionsGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('OPERATIONS + warranties.view -> allowed', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['warranties.view']);
      const context = createMockContext({}, mockOpsUser);
      expect(permissionsGuard.canActivate(context)).toBe(true);
    });

    it('OPERATIONS + cases.view -> allowed', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['cases.view']);
      const context = createMockContext({}, mockOpsUser);
      expect(permissionsGuard.canActivate(context)).toBe(true);
    });
  });
});
