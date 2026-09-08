'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Modal } from '../../components/ui/Modal';
import { StatCard } from '../../components/ui/StatCard';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { getBrands, createBrand } from '../../lib/api/brands';
import { mockBrands } from '../../lib/mock/brand-packs';
import type { Brand } from '../../types/brand-pack';

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    manufacturer: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    applicableSites: [] as string[],
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await getBrands();
        if (isMounted) {
          if (data && data.length > 0) {
            setBrands(data);
          } else {
            setBrands(mockBrands);
          }
        }
      } catch {
        if (isMounted) {
          setBrands(mockBrands);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch =
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.manufacturer.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [brands, search, statusFilter]);

  const stats = useMemo(() => {
    const total = brands.length;
    const active = brands.filter((b) => b.status === 'ACTIVE').length;
    const withPack = brands.filter((b) => Boolean(b.activePackVersion)).length;
    const totalSites = new Set(brands.flatMap((b) => b.applicableSites)).size;
    return { total, active, withPack, totalSites };
  }, [brands]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateError(null);
    try {
      const newBrand = await createBrand({
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        manufacturer: formData.manufacturer.trim(),
        status: formData.status,
        applicableSites: formData.applicableSites,
      });
      setBrands((prev) => [newBrand, ...prev]);
      setIsCreateModalOpen(false);
      setFormData({
        code: '',
        name: '',
        manufacturer: '',
        status: 'ACTIVE',
        applicableSites: [],
      });
    } catch (err) {
      setCreateError((err as Error).message || 'Failed to create brand.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Brand>[] = [
    {
      key: 'code',
      header: 'Brand Code',
      render: (b) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-blue-600/10 border border-indigo-200/50 flex items-center justify-center font-bold text-xs text-indigo-700">
            {b.code.slice(0, 3)}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{b.code}</span>
            <span className="text-xs text-slate-500">{b.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'manufacturer',
      header: 'Manufacturer',
      render: (b) => <span className="text-xs text-slate-700 font-medium">{b.manufacturer}</span>,
    },
    {
      key: 'activePackVersion',
      header: 'Active Brand Pack',
      render: (b) => (
        b.activePackVersion ? (
          <Link
            href={`/brand-packs?brandCode=${b.code}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {b.code} {b.activePackVersion} (Published)
          </Link>
        ) : (
          <span className="text-xs text-slate-400 italic">No pack published</span>
        )
      ),
    },
    {
      key: 'applicableSites',
      header: 'Authorized Sites',
      render: (b) => (
        <div className="flex flex-wrap gap-1">
          {b.applicableSites && b.applicableSites.length > 0 ? (
            b.applicableSites.map((site) => (
              <span
                key={site}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
              >
                {site}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-400 italic">All Sites</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => (
        <StatusBadge status={b.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (b) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/brands/${b.code}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            View Details
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href={`/brand-packs?brandCode=${b.code}`}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Manage Packs
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="brands.view">
      <AppShell>
        <PageHeader
          title="Brand Management"
          description="Multi-brand warranty governance, OEM compliance rules, and active pack versions"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Brands' },
          ]}
          actions={
            <PermissionGate permission="brands.create">
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Brand
              </Button>
            </PermissionGate>
          }
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total OEM Brands"
            value={stats.total}
            subtext="Configured in platform"
            badgeVariant="blue"
            icon="🚘"
          />
          <StatCard
            label="Active Franchises"
            value={stats.active}
            subtext="Ready for case capture"
            badgeVariant="green"
            icon="✅"
          />
          <StatCard
            label="Packs Published"
            value={stats.withPack}
            subtext="Live rule enforcement"
            badgeVariant="purple"
            icon="📦"
          />
          <StatCard
            label="Authorized Sites"
            value={stats.totalSites}
            subtext="Dealership rooftops"
            badgeVariant="purple"
            icon="🏢"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by code, brand name, manufacturer..."
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Only' },
                { value: 'INACTIVE', label: 'Inactive Only' },
              ]}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <DataTable
            data={filteredBrands}
            columns={columns}
            keyExtractor={(b) => b.code}
            isLoading={loading}
            emptyTitle="No Brands Found"
            emptyDescription="No automotive brands match your current search or filter criteria."
            onRowClick={(b) => router.push(`/brands/${b.code}`)}
          />
        </div>

        {/* Create Brand Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Register New OEM Brand"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {createError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span>{createError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Brand Code"
                placeholder="e.g. BYD, MG, HYUNDAI"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
              <Input
                label="Brand Display Name"
                placeholder="e.g. BYD Auto"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <Input
              label="Manufacturer Legal Entity"
              placeholder="e.g. BYD Auto Co., Ltd."
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Franchise Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">ACTIVE — Authorized for warranty claims</option>
                <option value="INACTIVE">INACTIVE — Suspended / Not yet commissioned</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Brand
              </Button>
            </div>
          </form>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}
