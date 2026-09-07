'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { PermissionGate } from '../../components/auth/PermissionGate';

export default function TasksPage() {
  return (
    <ProtectedRoute requiredPermission="tasks.view">
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Task Management & Dispatch</h1>
              <p className="text-sm text-slate-500 mt-1">
                Inspection orders, fieldwork assignments, due dates, and status updates
              </p>
            </div>
            <PermissionGate permission="tasks.create">
              <Button variant="primary">New Task</Button>
            </PermissionGate>
          </div>

          <Card>
            <EmptyState
              title="Task dispatch ready"
              description="Assignment dispatching to field technicians and mobile sync will be coordinated here."
            />
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
