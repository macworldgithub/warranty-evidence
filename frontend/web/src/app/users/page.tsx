'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { PermissionGate } from '../../components/auth/PermissionGate';

export default function UsersPage() {
  return (
    <ProtectedRoute requiredPermission="users.view">
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage system users, personnel roles, and access credentials
              </p>
            </div>
            <PermissionGate permission="users.create">
              <Button variant="primary">Add New User</Button>
            </PermissionGate>
          </div>

          <Card>
            <EmptyState
              title="User management module ready"
              description="User provisioning, role assignments (Admin, Ops, Field, Reviewer), and status control will be integrated in Phase 2."
            />
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
