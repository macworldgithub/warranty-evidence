'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export default function AuditLogsPage() {
  return (
    <ProtectedRoute requiredPermission="audit.view">
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Audit Trail & Security Logs</h1>
              <p className="text-sm text-slate-500 mt-1">
                Immutable security logs, authorization events, evidence tampering verifications
              </p>
            </div>
            <Button variant="outline">Download Audit Bundle</Button>
          </div>

          <Card>
            <EmptyState
              title="Audit logging infrastructure ready"
              description="Chronological records of logins, permissions checks, case status changes, and media uploads will be cataloged here."
            />
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
