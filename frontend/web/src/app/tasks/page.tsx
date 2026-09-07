'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Modal } from '../../components/ui/Modal';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { mockTasks, mockCases, mockUsers } from '../../lib/mock';
import type { CaseTask, TaskPriority, TaskStatus } from '../../types/task';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<CaseTask[]>(mockTasks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caseId: mockCases[0]?.id || '',
    assignedUserId: mockUsers[1]?.id || '',
    priority: 'HIGH' as TaskPriority,
    dueDate: '2026-09-12',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const query = search.toLowerCase();
      const matchesSearch =
        t.title.toLowerCase().includes(query) ||
        t.caseNumber.toLowerCase().includes(query) ||
        t.assignedToName.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const selectedCase = mockCases.find((c) => c.id === formData.caseId) || mockCases[0];
    const selectedUser = mockUsers.find((u) => u.id === formData.assignedUserId) || mockUsers[1];

    if (!selectedCase || !selectedUser) return;

    const newTask: CaseTask = {
      id: `task-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      assignedToName: `${selectedUser.firstName} ${selectedUser.lastName}`,
      assignedToEmail: selectedUser.email,
      priority: formData.priority,
      status: 'TODO',
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString().split('T')[0] ?? '',
    };

    setTasks([newTask, ...tasks]);
    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      description: '',
      caseId: mockCases[0]?.id || '',
      assignedUserId: mockUsers[1]?.id || '',
      priority: 'HIGH',
      dueDate: '2026-09-12',
    });
  };

  const toggleStatus = (task: CaseTask) => {
    setTasks(
      tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED',
              completedAt: t.status === 'COMPLETED' ? undefined : new Date().toISOString().split('T')[0],
            }
          : t,
      ),
    );
  };

  const columns: Column<CaseTask>[] = [
    {
      key: 'title',
      header: 'Task & Description',
      render: (t) => (
        <div className="max-w-md">
          <span className="font-semibold text-slate-900 hover:text-primary transition-colors">
            {t.title}
          </span>
          <p className="text-[11px] text-slate-400 truncate">{t.description}</p>
        </div>
      ),
    },
    {
      key: 'caseNumber',
      header: 'Case #',
      render: (t) => (
        <Link href={`/cases/${t.caseId}`} className="font-mono text-primary font-semibold hover:underline">
          {t.caseNumber}
        </Link>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Assignee',
      render: (t) => (
        <div className="text-[11px] text-slate-700">
          <p className="font-medium">{t.assignedToName}</p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (t) => <StatusBadge status={t.priority} />,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (t) => <span className="text-slate-600 font-medium text-xs">{t.dueDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant={t.status === 'COMPLETED' ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => toggleStatus(t)}
          >
            {t.status === 'COMPLETED' ? 'Reopen' : '✓ Done'}
          </Button>
          <Link href={`/tasks/${t.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="tasks.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="Operational Tasks"
            description="Diagnostic road tests, teardown inspections, customer notifications, and parts procurement."
            breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Tasks' }]}
            actions={
              <PermissionGate permission="tasks.create">
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  ➕ New Task
                </Button>
              </PermissionGate>
            }
          />

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search task title, case #, or assignee..."
              className="w-full sm:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                label="Priority"
                value={priorityFilter}
                onChange={setPriorityFilter}
                options={[
                  { label: 'All Priorities', value: 'ALL' },
                  { label: 'Urgent', value: 'URGENT' },
                  { label: 'High', value: 'HIGH' },
                  { label: 'Medium', value: 'MEDIUM' },
                  { label: 'Low', value: 'LOW' },
                ]}
              />
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'Todo', value: 'TODO' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                  { label: 'Completed', value: 'COMPLETED' },
                ]}
              />
            </div>
          </div>

          {/* Tasks Table */}
          <DataTable
            columns={columns}
            data={filteredTasks}
            keyExtractor={(t) => t.id}
            onRowClick={(t) => router.push(`/tasks/${t.id}`)}
            emptyTitle="No tasks found"
            emptyDescription="All operational tasks have been completed or match filters."
          />

          {/* Create Task Modal */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Dispatch Operational Task"
            size="md"
          >
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disassemble throttle body and photograph carbon deposit"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associated Claim Case *
                </label>
                <select
                  value={formData.caseId}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  {mockCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assign Technician *
                  </label>
                  <select
                    value={formData.assignedUserId}
                    onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {mockUsers
                      .filter((u) => u.role === 'OPERATIONS')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruction & Checklist Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Specific procedural steps required..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Dispatch Task
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
