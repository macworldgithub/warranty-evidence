'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, Lock, ArrowLeft } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { mockUsers } from '../../../lib/mock';
import { ROLE_PERMISSIONS } from '../../../lib/permissions';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.['id'] as string;

  const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];
  const permissions = user ? ROLE_PERMISSIONS[user.role] : [];

  return (
    <ProtectedRoute requiredPermission="users.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title={user ? `${user.firstName} ${user.lastName}` : 'User Profile'}
            description="Account credentials, system permissions, and administrative details."
            breadcrumbs={[
              { label: 'Home', href: '/dashboard' },
              { label: 'Users', href: '/users' },
              { label: user ? `${user.firstName} ${user.lastName}` : 'User' },
            ]}
            actions={
              <Button variant="outline" size="sm" onClick={() => router.push('/users')} className="inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Users</span>
              </Button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - User Info */}
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center mb-3">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
                <div className="mt-3">
                  <StatusBadge status={user?.role || 'TECHNICIAN'} size="md" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Account Status</span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">User ID</span>
                  <span className="font-mono text-[11px] text-slate-700">{user?.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Created Date</span>
                  <span className="text-slate-700">{user?.createdAt}</span>
                </div>
              </div>
            </Card>

            {/* Permissions Matrix */}
            <div className="lg:col-span-2 space-y-6">
              <Card
                title={`Active RBAC Permissions (${permissions.length})`}
                description={`System privileges granted under the ${user?.role} role`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permissions.map((perm) => (
                    <div
                      key={perm}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200/70 bg-slate-50/50 text-xs text-slate-700"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500 font-bold shrink-0" />
                      <span className="font-mono text-[11px]">{perm}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Security & Password Governance" description="Authentication provider details">
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Supabase Auth Managed</span>
                  </p>
                  <p>
                    Passkeys, password hashing, JWT sessions, and multi-factor authentication for this user are enforced externally by Supabase Auth. The Booran application database stores only the verified profile metadata and permission role.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
