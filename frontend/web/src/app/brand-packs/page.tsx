'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { StatCard } from '../../components/ui/StatCard';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { getBrandPacks, createBrandPack, cloneBrandPack } from '../../lib/api/brand-packs';
import { getBrands } from '../../lib/api/brands';
import { mockBrandPacks, mockBrands } from '../../lib/mock/brand-packs';
import type { BrandPack, PackStatus, Brand } from '../../types/brand-pack';

function BrandPacksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBrandParam = searchParams.get('brandCode') || 'ALL';

  const [packs, setPacks] = useState<BrandPack[]>(mockBrandPacks);
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState(initialBrandParam);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Clone Modal State
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [selectedPackForClone, setSelectedPackForClone] = useState<BrandPack | null>(null);
  const [cloneVersion, setCloneVersion] = useState('');
  const [cloneChangelog, setCloneChangelog] = useState('');
  const [isCloning, setIsCloning] = useState(false);

  // Create Pack Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    brandId: '',
    version: 'v1.0',
    description: '',
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [packsData, brandsData] = await Promise.all([
          getBrandPacks(),
          getBrands(),
        ]);

        if (isMounted) {
          if (packsData && packsData.length > 0) {
            setPacks(packsData);
          } else {
            setPacks(mockBrandPacks);
          }

          if (brandsData && brandsData.length > 0) {
            setBrands(brandsData);
            if (!createForm.brandId && brandsData[0]) {
              setCreateForm((prev) => ({ ...prev, brandId: brandsData[0]._id || brandsData[0].id || '' }));
            }
          } else {
            setBrands(mockBrands);
          }
        }
      } catch {
        if (isMounted) {
          setPacks(mockBrandPacks);
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
  }, [createForm.brandId]);

  const filteredPacks = useMemo(() => {
    return packs.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.brandCode.toLowerCase().includes(q) ||
        p.version.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      const matchesBrand = brandFilter === 'ALL' || p.brandCode === brandFilter;
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [packs, search, brandFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = packs.length;
    const published = packs.filter((p) => p.status === 'PUBLISHED').length;
    const draft = packs.filter((p) => p.status === 'DRAFT').length;
    const archived = packs.filter((p) => p.status === 'ARCHIVED').length;
    return { total, published, draft, archived };
  }, [packs]);

  const handleCloneClick = (pack: BrandPack, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPackForClone(pack);
    const match = pack.version.match(/^v?(\d+)(\.(\d+))?$/i);
    const nextVer = match ? `v${parseInt(match[1], 10) + 1}.0` : `${pack.version}-draft`;
    setCloneVersion(nextVer);
    setCloneChangelog(`Cloned from ${pack.version}`);
    setCloneModalOpen(true);
  };

  const handleCloneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackForClone) return;
    setIsCloning(true);
    try {
      const cloned = await cloneBrandPack(
        selectedPackForClone.id || selectedPackForClone._id!,
        { newVersion: cloneVersion, changelog: cloneChangelog },
      );
      setPacks((prev) => [cloned, ...prev]);
      setCloneModalOpen(false);
      router.push(`/brand-packs/${cloned.id || cloned._id}/edit`);
    } catch (err) {
      alert((err as Error).message || 'Failed to clone pack.');
    } finally {
      setIsCloning(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const targetBrand = brands.find((b) => (b._id || b.id) === createForm.brandId) || brands[0];
      const newPack = await createBrandPack({
        brandId: targetBrand?._id || targetBrand?.id || createForm.brandId,
        version: createForm.version.trim(),
        description: createForm.description.trim(),
        applicableSites: targetBrand?.applicableSites || [],
        vehicleRules: {
          vinRequired: true,
          vinOcrEnabled: true,
          odometerRequired: true,
          frontPhotoRequired: true,
          supportedPowertrains: ['EV', 'PHEV', 'HYBRID', 'ICE'],
          decodeVin: true,
        },
        tier1Items: [
          {
            key: 'VIN_PHOTO',
            title: 'VIN Plate Photo',
            description: 'Clear photo of VIN plate',
            required: true,
            mediaType: 'IMAGE',
            minimumCount: 1,
            maximumCount: 2,
            instructions: 'Legible VIN label',
            order: 1,
          },
        ],
        faultTypes: [],
        conditionalRules: [],
        namingRules: [
          { evidenceKey: 'VIN_PHOTO', template: '{RO}VIN.{ext}', descriptor: 'VIN' },
        ],
      });
      setPacks((prev) => [newPack, ...prev]);
      setCreateModalOpen(false);
      router.push(`/brand-packs/${newPack.id || newPack._id}/edit`);
    } catch (err) {
      alert((err as Error).message || 'Failed to create brand pack.');
    } finally {
      setIsCreating(false);
    }
  };

  const columns: Column<BrandPack>[] = [
    {
      key: 'brandCode',
      header: 'Brand Franchise',
      render: (p) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700">
            {p.brandCode}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{p.brandCode}</span>
            <span className="text-[11px] text-slate-500 truncate max-w-[180px] block">
              {p.description}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      render: (p) => (
        <span className="font-bold text-slate-900 font-mono text-xs">
          {p.version}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge
          variant={
            p.status === 'PUBLISHED'
              ? 'green'
              : p.status === 'DRAFT'
              ? 'amber'
              : 'slate'
          }
          size="sm"
        >
          {p.status}
        </Badge>
      ),
    },
    {
      key: 'tier1Count',
      header: 'Tier 1 Rules',
      render: (p) => (
        <span className="text-xs text-slate-700 font-medium">
          {p.tier1Items?.length || 0} items
        </span>
      ),
    },
    {
      key: 'faultTypesCount',
      header: 'Fault Types',
      render: (p) => (
        <span className="text-xs text-slate-700 font-medium">
          {p.faultTypes?.length || 0} categories
        </span>
      ),
    },
    {
      key: 'applicableSites',
      header: 'Site Scope',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.applicableSites && p.applicableSites.length > 0 ? (
            p.applicableSites.map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-400 italic">All Sites</span>
          )}
        </div>
      ),
    },
    {
      key: 'publishedAt',
      header: 'Published Date',
      render: (p) => (
        <span className="text-xs text-slate-500">
          {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : 'Draft — not live'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/brand-packs/${p.id || p._id}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            Inspect
          </Link>
          <span className="text-slate-300">|</span>
          {p.status === 'DRAFT' ? (
            <Link
              href={`/brand-packs/${p.id || p._id}/edit`}
              className="text-xs font-semibold text-amber-600 hover:text-amber-800 hover:underline"
            >
              Edit Draft
            </Link>
          ) : (
            <button
              onClick={(e) => handleCloneClick(p, e)}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
            >
              Clone
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="brand_packs.view">
      <AppShell>
        <PageHeader
          title="Brand Pack Engine"
          description="Configuration-driven warranty rules, fault types, evidence requirements, and OEM naming templates"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Brand Packs' },
          ]}
          actions={
            <PermissionGate permission="brand_packs.create">
              <Button
                variant="primary"
                onClick={() => setCreateModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Draft Pack
              </Button>
            </PermissionGate>
          }
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Brand Packs"
            value={stats.total}
            subtext="Configured version trees"
            badgeVariant="blue"
            icon="📦"
          />
          <StatCard
            label="Published / Active"
            value={stats.published}
            subtext="Enforcing live evidence capture"
            badgeVariant="green"
            icon="⚡"
          />
          <StatCard
            label="Draft In Progress"
            value={stats.draft}
            subtext="Under administrative review"
            badgeVariant="amber"
            icon="✏️"
          />
          <StatCard
            label="Archived Packs"
            value={stats.archived}
            subtext="Historical audit reference"
            badgeVariant="purple"
            icon="📜"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by brand, version, rule description..."
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterSelect
              label="Brand"
              value={brandFilter}
              onChange={setBrandFilter}
              options={[
                { value: 'ALL', label: 'All Brands' },
                ...brands.map((b) => ({ value: b.code, label: b.name })),
              ]}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PUBLISHED', label: 'Published (Active)' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <DataTable
            data={filteredPacks}
            columns={columns}
            keyExtractor={(p) => p.id || p._id || `${p.brandCode}-${p.version}`}
            isLoading={loading}
            emptyTitle="No Brand Packs Found"
            emptyDescription="No warranty rule configurations match your search or filter criteria."
            onRowClick={(p) => router.push(`/brand-packs/${p.id || p._id}`)}
          />
        </div>

        {/* Clone Version Modal */}
        <Modal
          isOpen={cloneModalOpen}
          onClose={() => setCloneModalOpen(false)}
          title={`Clone ${selectedPackForClone?.brandCode} ${selectedPackForClone?.version}`}
        >
          <form onSubmit={handleCloneSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <p className="font-semibold">Brand Pack Immutability Invariant:</p>
              <p className="mt-0.5">
                Cloning copies all Tier 1 items, fault types, Tier 2 rules, and naming templates into an editable <strong>DRAFT</strong> version. The original version remains untouched for historical case auditing.
              </p>
            </div>

            <Input
              label="New Version Identifier"
              placeholder="e.g. v2.0, v1.1"
              value={cloneVersion}
              onChange={(e) => setCloneVersion(e.target.value)}
              required
            />

            <Input
              label="Changelog Note / Reason"
              placeholder="e.g. Added diagnostic live data requirement for high-voltage faults"
              value={cloneChangelog}
              onChange={(e) => setCloneChangelog(e.target.value)}
            />

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCloneModalOpen(false)}
                disabled={isCloning}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isCloning}>
                Create Cloned Draft
              </Button>
            </div>
          </form>
        </Modal>

        {/* Create Pack Modal */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Brand Pack Draft"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Franchise Brand
              </label>
              <select
                value={createForm.brandId}
                onChange={(e) => setCreateForm({ ...createForm, brandId: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              >
                {brands.map((b) => (
                  <option key={b._id || b.id || b.code} value={b._id || b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Initial Version Identifier"
              placeholder="e.g. v1.0"
              value={createForm.version}
              onChange={(e) => setCreateForm({ ...createForm, version: e.target.value })}
              required
            />

            <Input
              label="Pack Description"
              placeholder="e.g. Official Warranty Evidence Capture Rules"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreating}>
                Initialize Draft Editor
              </Button>
            </div>
          </form>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}

export default function BrandPacksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Brand Packs...</div>}>
      <BrandPacksContent />
    </Suspense>
  );
}
