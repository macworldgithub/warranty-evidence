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
import { getSites, createSite } from '../../lib/api/sites';
import { mockSites, mockBrands } from '../../lib/mock/brand-packs';
import type { Site } from '../../types/brand-pack';

export default function SitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>(mockSites);
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
    street: '',
    suburb: '',
    state: 'VIC',
    postcode: '',
    phone: '',
    email: '',
    brands: ['BYD'] as string[],
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await getSites();
        if (isMounted) {
          if (data && data.length > 0) {
            setSites(data);
          } else {
            setSites(mockSites);
          }
        }
      } catch {
        if (isMounted) {
          setSites(mockSites);
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

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.address.suburb.toLowerCase().includes(q) ||
        s.brands.some((b) => b.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sites, search, statusFilter]);

  const stats = useMemo(() => {
    const total = sites.length;
    const active = sites.filter((s) => s.status === 'ACTIVE').length;
    const totalBrands = new Set(sites.flatMap((s) => s.brands)).size;
    return { total, active, totalBrands };
  }, [sites]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateError(null);
    try {
      const newSite = await createSite({
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        address: {
          street: formData.street.trim(),
          suburb: formData.suburb.trim(),
          state: formData.state.trim().toUpperCase(),
          postcode: formData.postcode.trim(),
        },
        status: formData.status,
        brands: formData.brands,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });
      setSites((prev) => [newSite, ...prev]);
      setIsCreateModalOpen(false);
      setFormData({
        code: '',
        name: '',
        street: '',
        suburb: '',
        state: 'VIC',
        postcode: '',
        phone: '',
        email: '',
        brands: ['BYD'],
        status: 'ACTIVE',
      });
    } catch (err) {
      setCreateError((err as Error).message || 'Failed to create site.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBrandSelection = (brandCode: string) => {
    setFormData((prev) => ({
      ...prev,
      brands: prev.brands.includes(brandCode)
        ? prev.brands.filter((b) => b !== brandCode)
        : [...prev.brands, brandCode],
    }));
  };

  const columns: Column<Site>[] = [
    {
      key: 'code',
      header: 'Site Code',
      render: (s) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-600/10 border border-purple-200/50 flex items-center justify-center font-bold text-xs text-purple-700">
            🏢
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{s.code}</span>
            <span className="text-xs text-slate-500">{s.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Location / Address',
      render: (s) => (
        <div className="text-xs text-slate-700">
          <p className="font-medium">{s.address.street}</p>
          <p className="text-slate-400 text-[11px]">
            {s.address.suburb}, {s.address.state} {s.address.postcode}
          </p>
        </div>
      ),
    },
    {
      key: 'brands',
      header: 'Authorized Brands',
      render: (s) => (
        <div className="flex flex-wrap gap-1">
          {s.brands.map((brand) => (
            <span
              key={brand}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              {brand}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (s) => (
        <div className="text-xs text-slate-600">
          <p>{s.phone || '—'}</p>
          <p className="text-[10px] text-slate-400">{s.email || '—'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <StatusBadge status={s.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <Link
          href={`/sites/${s.code}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          View Rooftop →
        </Link>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="sites.view">
      <AppShell>
        <PageHeader
          title="Dealership Site Management"
          description="Physical dealership rooftops, service workshops, and authorized brand permissions"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Sites' },
          ]}
          actions={
            <PermissionGate permission="sites.create">
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Dealership Site
              </Button>
            </PermissionGate>
          }
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Total Dealership Rooftops"
            value={stats.total}
            subtext="Booran network sites"
            badgeVariant="purple"
            icon="🏢"
          />
          <StatCard
            label="Active Service Centres"
            value={stats.active}
            subtext="Commissioned for warranty"
            badgeVariant="green"
            icon="✅"
          />
          <StatCard
            label="Franchises Represented"
            value={stats.totalBrands}
            subtext="OEM brands represented"
            badgeVariant="blue"
            icon="🚘"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by code, dealership name, suburb, brand..."
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
            data={filteredSites}
            columns={columns}
            keyExtractor={(s) => s.code}
            isLoading={loading}
            emptyTitle="No Sites Found"
            emptyDescription="No dealership sites match your search criteria."
            onRowClick={(s) => router.push(`/sites/${s.code}`)}
          />
        </div>

        {/* Create Site Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Register Dealership Rooftop"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {createError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span>{createError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Site Code"
                placeholder="e.g. CRANBOURNE, MELBOURNE"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
              <Input
                label="Dealership Legal / Trade Name"
                placeholder="e.g. Booran BYD Cranbourne"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <Input
              label="Street Address"
              placeholder="e.g. 215 South Gippsland Hwy"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              required
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Suburb"
                placeholder="e.g. Cranbourne"
                value={formData.suburb}
                onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                required
              />
              <Input
                label="State"
                placeholder="VIC"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
              <Input
                label="Postcode"
                placeholder="3977"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Service Phone"
                placeholder="(03) 5996 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Service Email"
                type="email"
                placeholder="service@booran.com.au"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Authorized OEM Franchises
              </label>
              <div className="flex flex-wrap gap-2">
                {['BYD', 'HYUNDAI', 'MG', 'CHERY'].map((bCode) => {
                  const isSelected = formData.brands.includes(bCode);
                  return (
                    <button
                      key={bCode}
                      type="button"
                      onClick={() => toggleBrandSelection(bCode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {bCode}
                    </button>
                  );
                })}
              </div>
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
                Save Dealership Site
              </Button>
            </div>
          </form>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}
