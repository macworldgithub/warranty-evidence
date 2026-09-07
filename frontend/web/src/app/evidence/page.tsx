'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { PermissionGate } from '../../components/auth/PermissionGate';

export default function EvidencePage() {
  return (
    <ProtectedRoute requiredPermission="evidence.view">
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Evidence Capture & Vault</h1>
              <p className="text-sm text-slate-500 mt-1">
                Tamper-evident photos, videos, audio notes, and geotagged diagnostic logs
              </p>
            </div>
            <PermissionGate permission="evidence.create">
              <Button variant="primary">Upload Evidence</Button>
            </PermissionGate>
          </div>

          <Card>
            <EmptyState
              title="Evidence vault ready"
              description="Media verification, EXIF validation, SHA-256 tamper hashing, and S3 secure storage will be wired up here."
            />
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
