'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, AuthState } from '../types/auth';
import type { Permission } from '../types/permissions';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase/client';
import { DEMO_USERS, getStoredUser, setStoredUser, getUserWithPermissions } from '../lib/auth';
import { hasPermission as checkPermission, getPermissionsForRole } from '../lib/permissions';
import { api } from '../lib/api';

interface AuthContextType extends AuthState {
  login: (credentials: { email: string; password?: string; role?: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isSupabaseActive = isSupabaseConfigured();

  const [state, setState] = useState<AuthState>(() => {
    const stored = getStoredUser();
    const initialUser = stored || DEMO_USERS.ADMIN;
    return {
      ...getUserWithPermissions(initialUser),
      isLoading: isSupabaseConfigured(),
    };
  });

  // Initialize session & listen to Supabase auth state changes
  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    let isMounted = true;

    // Fetch profile from NestJS API using current access token
    const loadUserProfile = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (!session?.access_token) {
          if (isMounted) {
            setState({
              user: null,
              role: null,
              permissions: [],
              isAuthenticated: false,
              isLoading: false,
            });
          }
          return;
        }

        // Save token for API client
        localStorage.setItem('booran_auth_token', session.access_token);

        interface UserProfileResponse {
          success: boolean;
          data?: {
            id: string;
            supabaseUserId: string;
            email: string;
            firstName: string;
            lastName: string;
            role: UserRole;
            status: string;
            permissions: Permission[];
          };
        }

        const response = await api.get<UserProfileResponse>('/auth/me');

        if (response.data && isMounted) {
          const apiUser: User = {
            id: response.data.id,
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            role: response.data.role,
          };
          setStoredUser(apiUser);
          setState({
            user: apiUser,
            role: response.data.role,
            permissions: response.data.permissions || getPermissionsForRole(response.data.role),
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } catch (err) {
        console.warn('Could not fetch user profile from NestJS /auth/me:', err);
        // If API fails or user not found, fallback to stored user or clear session
        if (isMounted) {
          const stored = getStoredUser();
          if (stored) {
            setState({
              ...getUserWithPermissions(stored),
              isLoading: false,
            });
          } else {
            setState({
              user: null,
              role: null,
              permissions: [],
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      }
    };

    loadUserProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('booran_auth_token');
        setStoredUser(null);
        if (isMounted) {
          setState({
            user: null,
            role: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadUserProfile();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async ({ email, password, role }: { email: string; password?: string; role?: UserRole }) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      const supabase = getSupabaseClient();

      if (supabase && password) {
        // Authenticate directly via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setState((prev) => ({ ...prev, isLoading: false }));
          throw new Error(error.message);
        }

        if (data.session) {
          localStorage.setItem('booran_auth_token', data.session.access_token);

          // Fetch MongoDB application user & role from NestJS backend
          try {
            interface LoginProfileResponse {
              success: boolean;
              data?: {
                id: string;
                supabaseUserId: string;
                email: string;
                firstName: string;
                lastName: string;
                role: UserRole;
                permissions: Permission[];
              };
            }

            const response = await api.get<LoginProfileResponse>('/auth/me');

            if (response.data) {
              const appUser: User = {
                id: response.data.id,
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                role: response.data.role,
              };
              setStoredUser(appUser);
              setState({
                user: appUser,
                role: response.data.role,
                permissions: response.data.permissions,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          } catch (err) {
            console.warn('Failed to fetch /auth/me after login:', err);
          }
        }
      }

      // Development fallback mode (when Supabase keys are not set or quick dev test used)
      let targetUser: User | undefined;
      const normalizedEmail = email.toLowerCase().trim();

      if (role && DEMO_USERS[role]) {
        targetUser = DEMO_USERS[role];
      } else if (normalizedEmail.includes('ops')) {
        targetUser = DEMO_USERS.OPERATIONS;
      } else if (normalizedEmail.includes('admin')) {
        targetUser = DEMO_USERS.ADMIN;
      } else {
        targetUser = {
          id: `usr-${Date.now()}`,
          email: normalizedEmail,
          firstName: email.split('@')[0] || 'User',
          lastName: '',
          role: role || 'OPERATIONS',
        };
      }

      const devToken = targetUser.role === 'ADMIN' ? 'dev-admin-token' : 'dev-ops-token';
      localStorage.setItem('booran_auth_token', devToken);
      setStoredUser(targetUser);

      const authData = getUserWithPermissions(targetUser);
      setState({
        ...authData,
        isLoading: false,
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }

    localStorage.removeItem('booran_auth_token');
    setStoredUser(null);
    setState({
      user: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    const targetUser = DEMO_USERS[newRole];
    const devToken = newRole === 'ADMIN' ? 'dev-admin-token' : 'dev-ops-token';
    localStorage.setItem('booran_auth_token', devToken);
    setStoredUser(targetUser);
    const authData = getUserWithPermissions(targetUser);
    setState({
      ...authData,
      isLoading: false,
    });
  }, []);

  const hasPermission = useCallback(
    (permission: Permission) => {
      return checkPermission(state.permissions, permission);
    },
    [state.permissions],
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        switchRole,
        hasPermission,
        isSupabaseActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
