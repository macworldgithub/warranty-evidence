'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { PermissionGate } from '../../components/auth/PermissionGate';

export default function ReviewsPage() {
  return (
    <ProtectedRoute requiredPermission="reviews.view">
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Evidence Reviews & QA</h1>
              <p className="text-sm text-slate-500 mt-1">
                Quality assurance assessments, warranty approval audits, and rejection reasons
              </p>
            </div>
            <PermissionGate permission="reviews.create">
              <Button variant="primary">Start Review</Button>
            </PermissionGate>
          </div>

          <Card>
            <EmptyState
              title="Review queue initialized"
              description="Evidence review workflow, QA checklists, and warranty claim approvals will be processed here."
            />
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
