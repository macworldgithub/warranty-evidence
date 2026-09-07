'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { PermissionGate } from '../../components/auth/PermissionGate';

export default function WarrantiesPage() {
  return (
    <ProtectedRoute requiredPermission="warranties.view">
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Warranty Registry</h1>
              <p className="text-sm text-slate-500 mt-1">
                Active warranty policies, vehicle terms, coverage periods, and limits
              </p>
            </div>
            <PermissionGate permission="warranties.create">
              <Button variant="primary">Register Warranty</Button>
            </PermissionGate>
          </div>

          <Card>
            <EmptyState
              title="Warranty repository ready"
              description="Warranty lookup, coverage verification, and VIN association will be connected here."
            />
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
