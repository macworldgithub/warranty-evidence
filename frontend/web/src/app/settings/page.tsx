'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredPermission="settings.view">
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
              <p className="text-sm text-slate-500 mt-1">
                Environment configurations, API thresholds, notification rules, and role mappings
              </p>
            </div>
            <Button variant="primary">Save Preferences</Button>
          </div>

          <Card>
            <EmptyState
              title="Settings module initialized"
              description="Global system preferences and organization profiles will be configurable here."
            />
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
