'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { mockCases, mockReviews, mockTasks, mockAuditLogs } from '../../lib/mock';

export default function DashboardPage() {
  const { user, role } = useAuth();

  return (
    <ProtectedRoute requiredPermission="dashboard.view">
      <AppShell>
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl text-white shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
                  Dashboard Overview
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300">
                  Active Role: <span className="font-bold text-white">{role}</span>
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Welcome back, {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Booran Warranty Evidence Capture System. Modules, queues, and statistics are dynamically tailored to your permission profile.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Session
              </span>
            </div>
          </div>

          {/* Role-Specific Dashboard Views */}
          {role === 'ADMIN' && <AdminDashboardView />}
          {role === 'OPERATIONS' && <OperationsDashboardView />}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

// ─── ADMIN DASHBOARD VIEW ──────────────────────────────────────────────

function AdminDashboardView() {
  const recentCases = mockCases.slice(0, 4);
  const pendingReviews = mockReviews.filter((r) => r.status === 'PENDING').slice(0, 3);
  const recentAudit = mockAuditLogs.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 6 Key Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Users"
          value="6"
          icon="👥"
          change="+2 new"
          trend="up"
          badgeText="Users"
          badgeVariant="purple"
        />
        <StatCard
          label="Active Policies"
          value="1,420"
          icon="🛡️"
          change="+14.8% MoM"
          trend="up"
          badgeText="Warranty"
          badgeVariant="blue"
        />
        <StatCard
          label="Open Claims"
          value="38"
          icon="📁"
          change="5 urgent"
          trend="down"
          badgeText="Claims"
          badgeVariant="yellow"
        />
        <StatCard
          label="Pending Evidence"
          value="11"
          icon="📸"
          change="3 awaiting capture"
          badgeText="Evidence"
          badgeVariant="gray"
        />
        <StatCard
          label="Review Queue"
          value="4"
          icon="✍️"
          change="Action required"
          trend="up"
          badgeText="Reviews"
          badgeVariant="red"
        />
        <StatCard
          label="Active Tasks"
          value="19"
          icon="✅"
          change="92% on schedule"
          trend="up"
          badgeText="Operations"
          badgeVariant="green"
        />
      </div>

      {/* Main Administrative Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Recent Warranty Defect Claims"
            description="Latest cases submitted by dealerships awaiting processing"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-2">Case #</th>
                    <th className="pb-2">Vehicle / Customer</th>
                    <th className="pb-2">Priority</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        <Link href={`/cases/${c.id}`} className="text-primary hover:underline">
                          {c.caseNumber}
                        </Link>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-slate-800">{c.customerName}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{c.vehicleSummary}</p>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={c.priority} />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/cases/${c.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <Link href="/cases" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View all cases ➔
              </Link>
            </div>
          </Card>

          {/* Quick Administrative Shortcuts */}
          <Card title="Quick Administrative Actions" description="Fast-track portal operations">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link href="/users">
                <Button variant="outline" className="w-full justify-start text-xs py-2.5">
                  ➕ Add User
                </Button>
              </Link>
              <Link href="/warranties">
                <Button variant="outline" className="w-full justify-start text-xs py-2.5">
                  🛡️ New Warranty
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start text-xs py-2.5">
                  📊 View Reports
                </Button>
              </Link>
              <Link href="/audit-logs">
                <Button variant="outline" className="w-full justify-start text-xs py-2.5">
                  📋 Audit Trail
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Side Column: Reviews & Audit */}
        <div className="space-y-6">
          {/* Pending Reviews Queue */}
          <Card title="Pending Review Queue" description="Evidence awaiting administrative sign-off">
            <div className="space-y-3">
              {pendingReviews.map((rev) => (
                <div key={rev.id} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-primary">{rev.caseNumber}</span>
                    <StatusBadge status={rev.status} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1">{rev.evidenceRequirement}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Submitted by {rev.submittedBy}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200/50 flex justify-end">
                    <Link href={`/reviews/${rev.id}`}>
                      <Button variant="primary" size="sm" className="text-[11px] py-1 px-2.5">Review</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <Link href="/reviews" className="text-xs font-semibold text-primary hover:underline">
                View review queue ➔
              </Link>
            </div>
          </Card>

          {/* Recent Audit Log Activity */}
          <Card title="Recent Activity Trail" description="Live audit events">
            <div className="space-y-3">
              {recentAudit.map((log) => (
                <div key={log.id} className="text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700">{log.userName}</span>
                    <span>{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <Link href="/audit-logs" className="text-xs font-semibold text-primary hover:underline">
                Full audit log ➔
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── OPERATIONS DASHBOARD VIEW ──────────────────────────────────────────

function OperationsDashboardView() {
  const activeCases = mockCases.filter((c) => c.status !== 'CLOSED');
  const myTasks = mockTasks.filter((t) => t.status !== 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Operations Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Claims"
          value="4"
          icon="📁"
          change="2 urgent attention"
          trend="down"
          badgeText="Active"
          badgeVariant="blue"
        />
        <StatCard
          label="Evidence Pending Capture"
          value="3"
          icon="📸"
          change="Photos & scans needed"
          badgeText="Action"
          badgeVariant="yellow"
        />
        <StatCard
          label="Reviews Awaiting Sign-Off"
          value="3"
          icon="✍️"
          change="Submitted to queue"
          badgeText="Queue"
          badgeVariant="purple"
        />
        <StatCard
          label="Assigned Tasks"
          value="4"
          icon="✅"
          change="1 due today"
          trend="up"
          badgeText="Dispatch"
          badgeVariant="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Claims Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Active Operational Claims" description="Claims currently undergoing diagnosis and parts allocation">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-2">Case #</th>
                    <th className="pb-2">Issue / Defect</th>
                    <th className="pb-2">Priority</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        <Link href={`/cases/${c.id}`} className="text-primary hover:underline">
                          {c.caseNumber}
                        </Link>
                      </td>
                      <td className="py-3">
                        <p className="font-semibold text-slate-800">{c.title}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-sm">{c.vehicleSummary}</p>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={c.priority} />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/cases/${c.id}`}>
                          <Button variant="outline" size="sm">Workspace</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <Link href="/cases">
                <Button variant="primary" size="sm">➕ Create New Case</Button>
              </Link>
              <Link href="/cases" className="text-xs font-semibold text-primary hover:underline">
                View all cases ➔
              </Link>
            </div>
          </Card>
        </div>

        {/* Operational Tasks Checklist */}
        <div className="space-y-6">
          <Card title="My Operational Tasks" description="Checklist of investigation & dispatch tasks">
            <div className="space-y-3">
              {myTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-primary">{t.caseNumber}</span>
                    <StatusBadge status={t.priority} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1">{t.title}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>Due: {t.dueDate}</span>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link href="/tasks" className="text-xs font-semibold text-primary hover:underline">
                View all tasks ➔
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
