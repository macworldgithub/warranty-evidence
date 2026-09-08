'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
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
import { mockCases, mockWarranties, mockUsers } from '../../lib/mock';
import type { WarrantyCase, CasePriority, CaseStatus, DefectCategory } from '../../types/case';

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<WarrantyCase[]>(mockCases);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    warrantyId: mockWarranties[0]?.id || '',
    title: '',
    description: '',
    category: 'TRANSMISSION_GEARBOX' as DefectCategory,
    priority: 'HIGH' as CasePriority,
    assignedUserId: mockUsers[1]?.id || '',
    estimatedCostAud: 2500,
  });

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const query = search.toLowerCase();
      const matchesSearch =
        c.caseNumber.toLowerCase().includes(query) ||
        c.customerName.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        c.vehicleSummary.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, search, statusFilter, priorityFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const selectedWarranty = mockWarranties.find((w) => w.id === formData.warrantyId) || mockWarranties[0];
    const selectedUser = mockUsers.find((u) => u.id === formData.assignedUserId) || mockUsers[1];

    if (!selectedWarranty || !selectedUser) return;

    const newCase: WarrantyCase = {
      id: `case-${Date.now()}`,
      caseNumber: `CAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      warrantyId: selectedWarranty.id,
      warrantyNumber: selectedWarranty.warrantyNumber,
      customerName: selectedWarranty.customer.fullName,
      vehicleSummary: `${selectedWarranty.vehicle.year} ${selectedWarranty.vehicle.make} ${selectedWarranty.vehicle.model} (VIN: ${selectedWarranty.vehicle.vin})`,
      category: formData.category,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'OPEN',
      assignedTo: {
        id: selectedUser.id,
        name: `${selectedUser.firstName} ${selectedUser.lastName}`,
        email: selectedUser.email,
        role: selectedUser.role,
      },
      estimatedCostAud: Number(formData.estimatedCostAud),
      evidenceCount: 1,
      tasksCount: 1,
      reviewsCount: 0,
      createdAt: new Date().toISOString().split('T')[0] ?? '',
      updatedAt: new Date().toISOString().split('T')[0] ?? '',
    };

    setCases([newCase, ...cases]);
    setIsCreateModalOpen(false);
    setFormData({
      warrantyId: mockWarranties[0]?.id || '',
      title: '',
      description: '',
      category: 'TRANSMISSION_GEARBOX',
      priority: 'HIGH',
      assignedUserId: mockUsers[1]?.id || '',
      estimatedCostAud: 2500,
    });
  };

  const columns: Column<WarrantyCase>[] = [
    {
      key: 'caseNumber',
      header: 'Case #',
      render: (c) => (
        <div>
          <span className="font-semibold text-primary">{c.caseNumber}</span>
          <p className="text-[11px] font-mono text-slate-400">{c.warrantyNumber}</p>
        </div>
      ),
    },
    {
      key: 'defect',
      header: 'Defect Issue & Vehicle',
      render: (c) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900">{c.title}</p>
          <p className="text-[11px] text-slate-500 truncate">{c.vehicleSummary}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (c) => <span className="font-medium text-slate-800">{c.customerName}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (c) => <StatusBadge status={c.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: 'assignedTo',
      header: 'Assigned',
      render: (c) => (
        <span className="text-slate-700 text-xs font-medium">{c.assignedTo.name}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link href={`/cases/${c.id}`}>
            <Button variant="primary" size="sm">
              Workspace
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="cases.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="Warranty Cases & Claims"
            description="Operational claims intake, diagnostic investigation, parts approval, and resolution workflows."
            breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Cases' }]}
            actions={
              <PermissionGate permission="cases.create">
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)} className="gap-1.5">
                  <Plus className="w-4 h-4" /> Create Case
                </Button>
              </PermissionGate>
            }
          />

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search case #, issue, customer, or VIN..."
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
                  { label: 'Open', value: 'OPEN' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                  { label: 'Pending Review', value: 'PENDING' },
                  { label: 'Closed', value: 'CLOSED' },
                ]}
              />
            </div>
          </div>

          {/* Cases Table */}
          <DataTable
            columns={columns}
            data={filteredCases}
            keyExtractor={(c) => c.id}
            onRowClick={(c) => router.push(`/cases/${c.id}`)}
            emptyTitle="No cases found"
            emptyDescription="Try broadening your search query or removing priority/status filters."
          />

          {/* Create Case Modal */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Lodge New Warranty Claim"
            size="lg"
          >
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enrolled Vehicle / Policy *
                </label>
                <select
                  value={formData.warrantyId}
                  onChange={(e) => setFormData({ ...formData, warrantyId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  {mockWarranties.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.warrantyNumber} — {w.vehicle.year} {w.vehicle.make} {w.vehicle.model} ({w.customer.fullName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Defect / Issue Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Transmission Slipping Under Load"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Defect Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as DefectCategory })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="TRANSMISSION_GEARBOX">Transmission & Gearbox</option>
                    <option value="ENGINE_MECHANICAL">Engine & Mechanical</option>
                    <option value="ELECTRICAL_SENSOR">Electrical & Sensors</option>
                    <option value="SUSPENSION_STEERING">Suspension & Steering</option>
                    <option value="COOLING_HEATING">Cooling & HVAC</option>
                    <option value="BRAKING_SYSTEM">Braking System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as CasePriority })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="URGENT">URGENT (Vehicle Inoperable)</option>
                    <option value="HIGH">HIGH (Severe Malfunction)</option>
                    <option value="MEDIUM">MEDIUM (Intermittent Fault)</option>
                    <option value="LOW">LOW (Minor Cosmetic/Noise)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Defect Description & Diagnostic Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed observations reported by technician and customer..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assign Operations Technician *
                  </label>
                  <select
                    value={formData.assignedUserId}
                    onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {mockUsers
                      .filter((u) => u.role === 'CLERK' || (u.role as string) === 'OPERATIONS')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.email})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Claim Cost (AUD)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedCostAud}
                    onChange={(e) => setFormData({ ...formData, estimatedCostAud: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Lodge Claim
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
