'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../../components/layout/AppShell';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { getBrandPack, getBrandVersions } from '../../../../lib/api/brand-packs';
import { mockBrandPacks } from '../../../../lib/mock/brand-packs';
import type { BrandPack } from '../../../../types/brand-pack';

interface VersionsPageProps {
  params: Promise<{ id: string }>;
}

export default function BrandPackVersionsPage({ params }: VersionsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [currentPack, setCurrentPack] = useState<BrandPack | null>(null);
  const [versions, setVersions] = useState<BrandPack[]>([]);
  const [loading, setLoading] = useState(true);

  // Diff selection
  const [compareA, setCompareA] = useState<string>('');
  const [compareB, setCompareB] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const packData = await getBrandPack(resolvedParams.id);
        if (packData) {
          setCurrentPack(packData);
          const allVersions = await getBrandVersions(packData.brandId || packData.brandCode);
          const list = allVersions.length > 0 ? allVersions : mockBrandPacks.filter((p) => p.brandCode === packData.brandCode);
          setVersions(list);
          if (list[0]) setCompareA(list[0].id || list[0]._id || list[0].version);
          if (list[1]) setCompareB(list[1].id || list[1]._id || list[1].version);
        } else {
          const fallback = mockBrandPacks[0];
          setCurrentPack(fallback);
          setVersions(mockBrandPacks);
          setCompareA(mockBrandPacks[0].id!);
        }
      } catch {
        setCurrentPack(mockBrandPacks[0]);
        setVersions(mockBrandPacks);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resolvedParams.id]);

  if (loading || !currentPack) {
    return (
      <ProtectedRoute requiredPermission="brand_packs.view">
        <AppShell>
          <div className="p-8 text-center text-slate-500">Loading version timeline...</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const packA = versions.find((v) => (v.id || v._id || v.version) === compareA) || versions[0];
  const packB = versions.find((v) => (v.id || v._id || v.version) === compareB) || versions[1] || versions[0];

  return (
    <ProtectedRoute requiredPermission="brand_packs.view">
      <AppShell>
        <PageHeader
          title={`${currentPack.brandCode} Version History & Audit Diff`}
          description="Track evolutionary changes to OEM evidence rules, fault types, and compliance standards"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Brand Packs', href: '/brand-packs' },
            { label: `${currentPack.brandCode} ${currentPack.version}`, href: `/brand-packs/${currentPack.id || currentPack._id}` },
            { label: 'Versions' },
          ]}
          actions={
            <Button variant="outline" onClick={() => router.push(`/brand-packs/${currentPack.id || currentPack._id}`)}>
              Back to Pack
            </Button>
          }
        />

        {/* Versions Timeline List */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 mb-8">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Version Tree for {currentPack.brandCode}</h3>
          <div className="space-y-3">
            {versions.map((ver, idx) => (
              <div
                key={ver.id || ver._id || ver.version}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono">
                    {ver.version}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{ver.version}</span>
                      <Badge
                        variant={
                          ver.status === 'PUBLISHED'
                            ? 'green'
                            : ver.status === 'DRAFT'
                            ? 'amber'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {ver.status}
                      </Badge>
                      {ver.version === currentPack.version && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                          CURRENT VIEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{ver.changelog || ver.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Created by {ver.createdBy} • {ver.publishedAt ? `Published ${new Date(ver.publishedAt).toLocaleDateString()}` : 'Unpublished Draft'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/brand-packs/${ver.id || ver._id}`}>
                    <Button variant="outline" size="sm">
                      Inspect Configuration →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side-by-Side Version Diff Comparison */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Version Diff Inspector</h3>
              <p className="text-xs text-slate-500">Compare rule differences between two version revisions</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600">Base:</span>
                <select
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs bg-white"
                >
                  {versions.map((v) => (
                    <option key={v.id || v._id || v.version} value={v.id || v._id || v.version}>
                      {v.version} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-slate-400 text-xs">vs</span>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600">Target:</span>
                <select
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs bg-white"
                >
                  {versions.map((v) => (
                    <option key={v.id || v._id || v.version} value={v.id || v._id || v.version}>
                      {v.version} ({v.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Column A */}
            <Card className="p-4 bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between pb-2 mb-3 border-b">
                <span className="font-bold text-sm text-slate-900">{packA?.version}</span>
                <Badge variant={packA?.status === 'PUBLISHED' ? 'green' : 'amber'} size="sm">
                  {packA?.status}
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Tier 1 Items ({packA?.tier1Items?.length || 0})</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-800">
                    {packA?.tier1Items?.map((t1) => (
                      <li key={t1.key}>
                        {t1.title} <span className="text-slate-400 font-mono text-[10px]">({t1.key})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Fault Categories ({packA?.faultTypes?.length || 0})</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-800">
                    {packA?.faultTypes?.map((ft) => (
                      <li key={ft.key}>{ft.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Column B */}
            <Card className="p-4 bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between pb-2 mb-3 border-b">
                <span className="font-bold text-sm text-slate-900">{packB?.version}</span>
                <Badge variant={packB?.status === 'PUBLISHED' ? 'green' : 'amber'} size="sm">
                  {packB?.status}
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Tier 1 Items ({packB?.tier1Items?.length || 0})</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-800">
                    {packB?.tier1Items?.map((t1) => (
                      <li key={t1.key}>
                        {t1.title} <span className="text-slate-400 font-mono text-[10px]">({t1.key})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Fault Categories ({packB?.faultTypes?.length || 0})</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-800">
                    {packB?.faultTypes?.map((ft) => (
                      <li key={ft.key}>{ft.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
