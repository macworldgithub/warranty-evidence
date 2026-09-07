'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { PermissionGate } from '../../components/auth/PermissionGate';

export default function CasesPage() {
  return (
    <ProtectedRoute requiredPermission="cases.view">
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Warranty Cases</h1>
              <p className="text-sm text-slate-500 mt-1">
                Claims, defect reports, technician assignments, and status tracking
              </p>
            </div>
            <PermissionGate permission="cases.create">
              <Button variant="primary">Create Case</Button>
            </PermissionGate>
          </div>

          <Card>
            <EmptyState
              title="Cases module initialized"
              description="Full claim intake workflow, technician dispatch, and resolution lifecycles will be managed here."
            />
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
