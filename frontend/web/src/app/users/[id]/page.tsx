'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
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
              <Button variant="outline" size="sm" onClick={() => router.push('/users')}>
                ← Back to Users
              </Button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card title="User Information" description="Identity and authentication status">
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {user?.firstName[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-slate-500">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 font-medium">RBAC Role</span>
                    <div className="mt-0.5">
                      {user && <StatusBadge status={user.role} />}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Account Status</span>
                    <div className="mt-0.5">
                      {user && <StatusBadge status={user.status} />}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Supabase Auth UID</span>
                  <p className="font-mono text-slate-800 text-[11px] mt-0.5 bg-slate-50 p-2 rounded border border-slate-200">
                    {user?.supabaseUserId}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 font-medium">Last Login</span>
                    <p className="text-slate-700 font-medium mt-0.5">{user?.lastLogin}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Created On</span>
                    <p className="text-slate-700 font-medium mt-0.5">{user?.createdAt}</p>
                  </div>
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
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span className="font-mono text-[11px]">{perm}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Security & Password Governance" description="Authentication provider details">
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed space-y-1">
                  <p className="font-semibold">🔒 Supabase Auth Managed</p>
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
