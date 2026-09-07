'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { mockAuditLogs } from '../../lib/mock';
import type { AuditLogEntry, AuditEntity } from '../../types/audit';

export default function AuditLogsPage() {
  const [logs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const query = search.toLowerCase();
      const matchesSearch =
        l.userName.toLowerCase().includes(query) ||
        l.userEmail.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        l.action.toLowerCase().includes(query) ||
        l.ipAddress.includes(query);

      const matchesEntity = entityFilter === 'ALL' || l.entity === entityFilter;

      return matchesSearch && matchesEntity;
    });
  }, [logs, search, entityFilter]);

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (l) => (
        <div className="text-[11px] font-mono text-slate-500">
          {l.timestamp}
        </div>
      ),
    },
    {
      key: 'user',
      header: 'User & Role',
      render: (l) => (
        <div>
          <p className="font-semibold text-slate-800">{l.userName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-slate-400">{l.userEmail}</span>
            <StatusBadge status={l.userRole} />
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Event Action',
      render: (l) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-semibold text-slate-700">
          {l.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Entity',
      render: (l) => (
        <span className="text-[11px] font-semibold text-slate-600">
          {l.entity}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Event Narrative & Specifics',
      render: (l) => (
        <p className="text-xs text-slate-700 leading-snug max-w-md">{l.description}</p>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (l) => (
        <span className="text-[11px] font-mono text-slate-400">{l.ipAddress}</span>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="audit.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="System Audit Logs"
            description="Immutable compliance records of user authentication, authorization transitions, and claim approvals."
            breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Audit Logs' }]}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Exporting audit log trail... (Phase 4 integration)')}
              >
                📥 Export Audit Archive
              </Button>
            }
          />

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search user, event, action, or IP address..."
              className="w-full sm:max-w-sm"
            />
            <FilterSelect
              label="Entity Type"
              value={entityFilter}
              onChange={setEntityFilter}
              options={[
                { label: 'All Entities', value: 'ALL' },
                { label: 'User Events', value: 'USER' as AuditEntity },
                { label: 'Warranty Policies', value: 'WARRANTY' as AuditEntity },
                { label: 'Cases & Claims', value: 'CASE' as AuditEntity },
                { label: 'Evidence Vault', value: 'EVIDENCE' as AuditEntity },
                { label: 'Review Decisions', value: 'REVIEW' as AuditEntity },
              ]}
            />
          </div>

          {/* Audit Logs Table */}
          <DataTable
            columns={columns}
            data={filteredLogs}
            keyExtractor={(l) => l.id}
            emptyTitle="No audit records found"
            emptyDescription="There are no audit events matching the selected filters."
          />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
