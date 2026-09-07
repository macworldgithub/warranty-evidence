'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Permission } from '../../types/permissions';
import type { UserRole } from '../../types/auth';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  role?: UserRole;
  roles?: UserRole[];
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  fallback = null,
}: PermissionGateProps) {
  const { role: currentRole, hasPermission } = useAuth();

  // Role check
  if (role && currentRole !== role) {
    return <>{fallback}</>;
  }

  if (roles && (!currentRole || !roles.includes(currentRole))) {
    return <>{fallback}</>;
  }

  // Single permission check
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Multiple permissions check
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every((p) => hasPermission(p))
      : permissions.some((p) => hasPermission(p));

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
