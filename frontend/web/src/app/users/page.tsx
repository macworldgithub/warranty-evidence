'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { mockUsers, type MockUser } from '../../lib/mock';
import type { UserRole } from '../../types/auth';

export default function UsersPage() {
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

  // Form State for Add User
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'OPERATIONS' as UserRole,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.firstName.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName) return;

    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      supabaseUserId: `sub-demo-${Date.now()}`,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
      status: formData.status,
      lastLogin: 'Never',
      createdAt: new Date().toISOString().split('T')[0] ?? '',
    };

    setUsers([newUser, ...users]);
    setIsAddModalOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'OPERATIONS',
      status: 'ACTIVE',
    });
  };

  const handleDeactivate = () => {
    if (!selectedUser) return;
    setUsers(
      users.map((u) =>
        u.id === selectedUser.id
          ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : u,
      ),
    );
    setIsConfirmDeactivateOpen(false);
    setSelectedUser(null);
  };

  const columns: Column<MockUser>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (u) => (
        <div>
          <Link
            href={`/users/${u.id}`}
            className="font-semibold text-slate-900 hover:text-primary transition-colors"
          >
            {u.firstName} {u.lastName}
          </Link>
          <p className="text-[11px] text-slate-400 font-mono">UID: {u.supabaseUserId.slice(0, 12)}...</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (u) => <span className="font-medium text-slate-700">{u.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => <StatusBadge status={u.role} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (u) => <span className="text-slate-500">{u.lastLogin}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (u) => <span className="text-slate-500">{u.createdAt}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link href={`/users/${u.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          <Button
            variant={u.status === 'ACTIVE' ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => {
              setSelectedUser(u);
              setIsConfirmDeactivateOpen(true);
            }}
          >
            {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="users.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="User Management"
            description="Manage Booran portal accounts, permissions, and status. Exactly two roles: ADMIN and OPERATIONS."
            breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Users' }]}
            actions={
              <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                ➕ Add User
              </Button>
            }
          />

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search users by name or email..."
              className="w-full sm:max-w-xs"
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                label="Role"
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  { label: 'All Roles', value: 'ALL' },
                  { label: 'Admin', value: 'ADMIN' },
                  { label: 'Operations', value: 'OPERATIONS' },
                ]}
              />
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Inactive', value: 'INACTIVE' },
                ]}
              />
            </div>
          </div>

          {/* Users Table */}
          <DataTable
            columns={columns}
            data={filteredUsers}
            keyExtractor={(u) => u.id}
            emptyTitle="No users match filters"
            emptyDescription="Try clearing your search query or role/status filters."
          />

          {/* Add User Modal */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Provision Portal User"
            size="md"
          >
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 leading-relaxed">
                <p className="font-semibold mb-0.5">ℹ️ Authentication via Supabase Auth</p>
                Password creation and credential security are managed via Supabase. The user will be initialized in MongoDB and receive their login credentials through Supabase.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Marcus"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Vance"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="user@booran.com.au"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    RBAC Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    <option value="OPERATIONS">OPERATIONS</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Create User
                </Button>
              </div>
            </form>
          </Modal>

          {/* Deactivate/Reactivate Confirmation Dialog */}
          <ConfirmDialog
            isOpen={isConfirmDeactivateOpen}
            onClose={() => setIsConfirmDeactivateOpen(false)}
            onConfirm={handleDeactivate}
            title={selectedUser?.status === 'ACTIVE' ? 'Deactivate User Account?' : 'Reactivate User Account?'}
            message={`Are you sure you want to ${
              selectedUser?.status === 'ACTIVE' ? 'deactivate' : 'reactivate'
            } access for ${selectedUser?.firstName} ${selectedUser?.lastName} (${selectedUser?.email})?`}
            variant={selectedUser?.status === 'ACTIVE' ? 'danger' : 'primary'}
            confirmLabel={selectedUser?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
