import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { UsersService } from '../users/users.service.js';
import { getPermissionsForRole } from '../common/constants/permissions.constant.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly supabaseClient: SupabaseClient | null = null;
  private readonly isSupabaseConfigured: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY');

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('<project-ref>')) {
      try {
        this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        this.isSupabaseConfigured = true;
        this.logger.log('🔐 Supabase Auth client initialized successfully');
      } catch (err) {
        this.logger.warn(`Failed to initialize Supabase client: ${(err as Error).message}`);
      }
    } else {
      this.logger.warn(
        '⚠️ Supabase credentials not fully configured in backend .env. Running with development auth verification mode.',
      );
    }
  }

  async verifyToken(token: string): Promise<{ supabaseUserId: string; email: string }> {
    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    // 1. If Supabase is configured, verify via Supabase Auth API
    if (this.isSupabaseConfigured && this.supabaseClient) {
      const { data, error } = await this.supabaseClient.auth.getUser(token);

      if (error || !data.user) {
        this.logger.warn(`Supabase token verification failed: ${error?.message}`);
        throw new UnauthorizedException('Invalid or expired authentication token');
      }

      return {
        supabaseUserId: data.user.id,
        email: data.user.email ?? '',
      };
    }

    // 2. Development mode fallback: support simulated/dev tokens
    // e.g., "dev-admin-token" or Base64/JWT dev payload: { sub, email }
    try {
      if (token === 'dev-admin-token') {
        return {
          supabaseUserId: 'sub-admin-seed-01',
          email: 'admin@booran.com',
        };
      }
      if (token === 'dev-ops-token' || token === 'dev-clerk-token') {
        return {
          supabaseUserId: 'sub-clerk-seed-01',
          email: 'clerk@booran.com',
        };
      }
      if (token === 'dev-advisor-token') {
        return {
          supabaseUserId: 'sub-advisor-seed-01',
          email: 'advisor@booran.com',
        };
      }
      if (token === 'dev-manager-token') {
        return {
          supabaseUserId: 'sub-manager-seed-01',
          email: 'manager@booran.com',
        };
      }
      if (token === 'dev-tech-token') {
        return {
          supabaseUserId: 'sub-tech-seed-01',
          email: 'tech@booran.com',
        };
      }

      // Try decoding base64 payload if token is formed like a JWT (header.payload.signature)
      const parts = token.split('.');
      if (parts.length === 3 && parts[1]) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        if (payload.sub) {
          return {
            supabaseUserId: payload.sub,
            email: payload.email ?? '',
          };
        }
      }
    } catch {
      // Ignore parse failure and throw below
    }

    throw new UnauthorizedException(
      'Invalid authentication token. Configure SUPABASE_URL and SUPABASE_ANON_KEY in .env for production token verification.',
    );
  }

  async getAuthenticatedUser(
    supabaseUserId: string,
    email?: string,
  ): Promise<AuthenticatedUser> {
    let user = await this.usersService.findBySupabaseId(supabaseUserId);

    // Fallback search by email if not found by supabaseUserId (e.g. initial linking)
    if (!user && email) {
      user = await this.usersService.findByEmail(email);
    }

    if (!user) {
      throw new UnauthorizedException(
        'User record not found in Booran application database.',
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        `User account is ${user.status.toLowerCase()}. Access denied.`,
      );
    }

    // Update last login timestamp asynchronously
    this.usersService.updateLastLogin(user._id.toString()).catch(() => {});

    const permissions = getPermissionsForRole(user.role);

    return {
      id: user._id.toString(),
      supabaseUserId: user.supabaseUserId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      assignedSites: user.assignedSites || [],
      permissions,
    };
  }
}
