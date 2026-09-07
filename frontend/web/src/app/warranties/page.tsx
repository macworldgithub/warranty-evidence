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
import { mockWarranties } from '../../lib/mock';
import type { Warranty, WarrantyCoverageType, WarrantyStatus } from '../../types/warranty';

export default function WarrantiesPage() {
  const router = useRouter();
  const [warranties, setWarranties] = useState<Warranty[]>(mockWarranties);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [coverageFilter, setCoverageFilter] = useState('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    warrantyNumber: 'BW-2026-9900',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    vin: '',
    make: '',
    model: '',
    year: 2024,
    coverageType: 'POWERTRAIN' as WarrantyCoverageType,
    status: 'ACTIVE' as WarrantyStatus,
    maxClaimLimitAud: 15000,
    deductibleAud: 250,
    dealershipName: 'Booran Motors Dandenong',
  });

  const filteredWarranties = useMemo(() => {
    return warranties.filter((w) => {
      const query = search.toLowerCase();
      const matchesSearch =
        w.warrantyNumber.toLowerCase().includes(query) ||
        w.customer.fullName.toLowerCase().includes(query) ||
        w.vehicle.vin.toLowerCase().includes(query) ||
        w.vehicle.make.toLowerCase().includes(query) ||
        w.vehicle.model.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
      const matchesCoverage = coverageFilter === 'ALL' || w.coverageType === coverageFilter;

      return matchesSearch && matchesStatus && matchesCoverage;
    });
  }, [warranties, search, statusFilter, coverageFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.vin) return;

    const newWarranty: Warranty = {
      id: `warr-${Date.now()}`,
      warrantyNumber: formData.warrantyNumber,
      customer: {
        id: `cust-${Date.now()}`,
        fullName: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
      },
      vehicle: {
        vin: formData.vin,
        make: formData.make || 'Toyota',
        model: formData.model || 'Hilux',
        year: Number(formData.year) || 2023,
        odometerKm: 25000,
      },
      coverageType: formData.coverageType,
      status: formData.status,
      startDate: new Date().toISOString().split('T')[0] ?? '',
      endDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
      maxClaimLimitAud: Number(formData.maxClaimLimitAud),
      deductibleAud: Number(formData.deductibleAud),
      dealershipName: formData.dealershipName,
      activeClaimsCount: 0,
      createdAt: new Date().toISOString().split('T')[0] ?? '',
    };

    setWarranties([newWarranty, ...warranties]);
    setIsCreateModalOpen(false);
  };

  const columns: Column<Warranty>[] = [
    {
      key: 'warrantyNumber',
      header: 'Policy Number',
      render: (w) => (
        <div>
          <span className="font-semibold text-primary">{w.warrantyNumber}</span>
          <p className="text-[11px] text-slate-400">{w.dealershipName}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (w) => (
        <div>
          <p className="font-medium text-slate-800">{w.customer.fullName}</p>
          <p className="text-[11px] text-slate-400">{w.customer.phone}</p>
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle / VIN',
      render: (w) => (
        <div>
          <p className="font-medium text-slate-800">
            {w.vehicle.year} {w.vehicle.make} {w.vehicle.model}
          </p>
          <p className="text-[11px] font-mono text-slate-400">VIN: {w.vehicle.vin}</p>
        </div>
      ),
    },
    {
      key: 'coverageType',
      header: 'Coverage',
      render: (w) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
          {w.coverageType.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (w) => <StatusBadge status={w.status} />,
    },
    {
      key: 'dates',
      header: 'Valid Dates',
      render: (w) => (
        <div className="text-[11px] text-slate-500">
          <p>{w.startDate} to {w.endDate}</p>
        </div>
      ),
    },
    {
      key: 'claims',
      header: 'Claims',
      render: (w) => (
        <span className="font-semibold text-slate-700">{w.activeClaimsCount} active</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (w) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link href={`/warranties/${w.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="warranties.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="Warranty Management"
            description="Active warranty coverage policies, vehicle VIN verification, and policy terms."
            breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Warranties' }]}
            actions={
              <PermissionGate permission="warranties.create">
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  ➕ Create Warranty
                </Button>
              </PermissionGate>
            }
          />

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search policy #, customer, VIN, or vehicle..."
              className="w-full sm:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                label="Coverage"
                value={coverageFilter}
                onChange={setCoverageFilter}
                options={[
                  { label: 'All Coverages', value: 'ALL' },
                  { label: 'Powertrain', value: 'POWERTRAIN' },
                  { label: 'Comprehensive', value: 'COMPREHENSIVE' },
                  { label: 'Drivetrain', value: 'DRIVETRAIN' },
                  { label: 'Electrical/Hybrid', value: 'ELECTRICAL_HYBRID' },
                ]}
              />
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Claim in Progress', value: 'CLAIM_IN_PROGRESS' },
                  { label: 'Expired', value: 'EXPIRED' },
                ]}
              />
            </div>
          </div>

          {/* Warranties Table */}
          <DataTable
            columns={columns}
            data={filteredWarranties}
            keyExtractor={(w) => w.id}
            onRowClick={(w) => router.push(`/warranties/${w.id}`)}
            emptyTitle="No warranties found"
            emptyDescription="Adjust your search criteria or policy filters."
          />

          {/* Create Warranty Modal */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Register New Warranty Policy"
            size="lg"
          >
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.warrantyNumber}
                    onChange={(e) => setFormData({ ...formData, warrantyNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Coverage Level *
                  </label>
                  <select
                    value={formData.coverageType}
                    onChange={(e) => setFormData({ ...formData, coverageType: e.target.value as WarrantyCoverageType })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    <option value="POWERTRAIN">Powertrain Mechanical</option>
                    <option value="COMPREHENSIVE">Comprehensive Platinum</option>
                    <option value="DRIVETRAIN">Drivetrain & 4WD</option>
                    <option value="ELECTRICAL_HYBRID">Electrical & Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <p className="text-xs font-bold text-slate-800">Customer Information</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Sterling"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="customer@email.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      placeholder="+61 400 000 000"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <p className="text-xs font-bold text-slate-800">Vehicle Details</p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">VIN (17 Characters) *</label>
                    <input
                      type="text"
                      required
                      maxLength={17}
                      placeholder="MPBUMFF50NX104822"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Make</label>
                    <input
                      type="text"
                      placeholder="Ford"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Model</label>
                    <input
                      type="text"
                      placeholder="Ranger"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Claim Limit (AUD)</label>
                  <input
                    type="number"
                    value={formData.maxClaimLimitAud}
                    onChange={(e) => setFormData({ ...formData, maxClaimLimitAud: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deductible (AUD)</label>
                  <input
                    type="number"
                    value={formData.deductibleAud}
                    onChange={(e) => setFormData({ ...formData, deductibleAud: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Warranty
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
