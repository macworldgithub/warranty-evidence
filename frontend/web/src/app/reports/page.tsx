'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredPermission="reports.view">
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
              <p className="text-sm text-slate-500 mt-1">
                Claims analytics, warranty loss ratios, defect trends, and KPI summaries
              </p>
            </div>
            <Button variant="outline">Export Data</Button>
          </div>

          <Card>
            <EmptyState
              title="Reports module initialized"
              description="Analytics dashboards, CSV/PDF exports, and executive warranty summaries will be presented here."
            />
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
