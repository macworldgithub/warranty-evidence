'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole, AuthState } from '../types/auth';
import type { Permission } from '../types/permissions';
import { DEMO_USERS, getStoredUser, setStoredUser, getUserWithPermissions } from '../lib/auth';
import { hasPermission as checkPermission } from '../lib/permissions';

interface AuthContextType extends AuthState {
  login: (credentials: { email: string; password?: string; role?: UserRole }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = getStoredUser();
    const initialUser = stored || DEMO_USERS.ADMIN;
    return {
      ...getUserWithPermissions(initialUser),
      isLoading: false,
    };
  });

  const login = useCallback(
    async ({ email, role }: { email: string; password?: string; role?: UserRole }) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      let targetUser: User | undefined;
      if (role && DEMO_USERS[role]) {
        targetUser = DEMO_USERS[role];
      } else {
        targetUser = Object.values(DEMO_USERS).find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
      }

      if (!targetUser) {
        targetUser = {
          id: `usr-${Date.now()}`,
          email,
          firstName: email.split('@')[0] || 'User',
          lastName: '',
          role: role || 'OPERATIONS',
          department: 'Operations',
        };
      }

      setStoredUser(targetUser);
      const authData = getUserWithPermissions(targetUser);
      setState({
        ...authData,
        isLoading: false,
      });
    },
    [],
  );

  const logout = useCallback(() => {
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
