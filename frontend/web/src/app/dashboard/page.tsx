'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

export default function DashboardPage() {
  const { user, role, switchRole } = useAuth();

  return (
    <ProtectedRoute requiredPermission="dashboard.view">
      <AppShell>
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl text-white shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
                  Dashboard Overview
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300">
                  Role: <span className="font-bold text-white">{role}</span>
                </span>
              </div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Booran Warranty Evidence Capture System. Your permissions and modules are automatically tailored to your role.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue" size="md">
                Active Session
              </Badge>
            </div>
          </div>

          {/* Role-Specific Metric Cards & Widgets */}
          {role === 'ADMIN' && <AdminDashboardView />}
          {role === 'OPERATIONS' && <OperationsDashboardView />}

          {/* System Foundation Status */}
          <Card title="Foundation Architecture Status" description="Core system configuration and RBAC status">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-medium">Backend API</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-900">NestJS REST (Healthy)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Port: 4000 • Global Prefix: /api/v1</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-medium">Database Layer</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-900">MongoDB Atlas (Connected)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Mongoose ODM initialized</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-medium">Frontend Architecture</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-900">Next.js 16 (Unified RBAC)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Single AppShell • 2 Roles (ADMIN & OPERATIONS)</p>
              </div>
            </div>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

// ─── Role View Components ──────────────────────────────────────────────

function AdminDashboardView() {
  const stats = [
    { label: 'Total Users', value: '24', icon: '👥', change: '+3 this month' },
    { label: 'Active Warranties', value: '142', icon: '🛡️', change: '8 expiring soon' },
    { label: 'Open Cases', value: '38', icon: '📁', change: '12 high priority' },
    { label: 'Pending Reviews', value: '15', icon: '✍️', change: 'Requires approval' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <Badge variant="purple" size="sm">Admin</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{s.value}</p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-slate-400 mt-2">{s.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="User Management & Audit" description="Recent administrative events">
          <EmptyState
            title="Audit trail initialized"
            description="System events and user activity will be logged here once Phase 2 User Management is active."
          />
        </Card>

        <Card title="Quick Administrative Actions" description="Fast-track administrative functions">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start text-xs py-3">
              ➕ Provision User
            </Button>
            <Button variant="outline" className="justify-start text-xs py-3">
              🛡️ Warranty Policies
            </Button>
            <Button variant="outline" className="justify-start text-xs py-3">
              📊 Export System Report
            </Button>
            <Button variant="outline" className="justify-start text-xs py-3">
              ⚙️ System Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OperationsDashboardView() {
  const stats = [
    { label: 'Active Cases', value: '29', icon: '📁', color: 'blue' },
    { label: 'Assigned Warranties', value: '88', icon: '🛡️', color: 'green' },
    { label: 'Evidence Needed', value: '11', icon: '📸', color: 'yellow' },
    { label: 'Dispatch Tasks', value: '19', icon: '✅', color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <Badge variant="blue" size="sm">Ops</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{s.value}</p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-slate-400 mt-2">Operational pipeline</p>
          </Card>
        ))}
      </div>

      <Card title="Active Operations Queue" description="Warranty claims awaiting processing">
        <EmptyState
          title="Operations queue clear"
          description="New warranty claims submitted by dealerships and customers will appear here."
          actionLabel="Create New Case"
          onAction={() => alert('Phase 2: Case creation will be available next')}
        />
      </Card>
    </div>
  );
}
