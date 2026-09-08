'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { getBrand } from '../../../lib/api/brands';
import { getBrandVersions } from '../../../lib/api/brand-packs';
import { mockBrands, mockBrandPacks } from '../../../lib/mock/brand-packs';
import type { Brand, BrandPack } from '../../../types/brand-pack';

interface BrandDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BrandDetailPage({ params }: BrandDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [packs, setPacks] = useState<BrandPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getBrand(resolvedParams.id);
        if (data) {
          setBrand(data);
          const versions = await getBrandVersions(data._id || data.code);
          setPacks(versions.length > 0 ? versions : mockBrandPacks.filter((p) => p.brandCode === data.code));
        } else {
          const fallback = mockBrands.find(
            (b) => b.code.toLowerCase() === resolvedParams.id.toLowerCase() || b.id === resolvedParams.id,
          );
          if (fallback) {
            setBrand(fallback);
            setPacks(mockBrandPacks.filter((p) => p.brandCode === fallback.code));
          }
        }
      } catch {
        const fallback = mockBrands.find(
          (b) => b.code.toLowerCase() === resolvedParams.id.toLowerCase(),
        );
        if (fallback) {
          setBrand(fallback);
          setPacks(mockBrandPacks.filter((p) => p.brandCode === fallback.code));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <ProtectedRoute requiredPermission="brands.view">
        <AppShell>
          <div className="p-8 text-center text-slate-500">Loading brand profile...</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!brand) {
    return (
      <ProtectedRoute requiredPermission="brands.view">
        <AppShell>
          <div className="p-12 text-center">
            <h2 className="text-lg font-bold text-slate-900">Brand Not Found</h2>
            <p className="text-xs text-slate-500 mt-1">The requested brand could not be loaded.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/brands')}>
              Back to Brands
            </Button>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const activePack = packs.find((p) => p.status === 'PUBLISHED') || packs[0];

  return (
    <ProtectedRoute requiredPermission="brands.view">
      <AppShell>
        <PageHeader
          title={`${brand.name} (${brand.code})`}
          description={`Manufacturer: ${brand.manufacturer}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Brands', href: '/brands' },
            { label: brand.code },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push('/brands')}>
                Back to Brands
              </Button>
              <Link href={`/brand-packs?brandCode=${brand.code}`}>
                <Button variant="primary">
                  <span className="mr-1.5">📦</span> Manage Brand Packs
                </Button>
              </Link>
            </div>
          }
        />

        {/* Top Info Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <StatusBadge status={brand.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                {brand.code}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
              <span>Code: <strong>{brand.code}</strong></span>
              <span>Franchise: <strong>{brand.name}</strong></span>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Brand Pack</p>
            {activePack ? (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">{activePack.version}</span>
                  <Badge variant="green" size="sm">PUBLISHED</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{activePack.description}</p>
                <div className="mt-3">
                  <Link
                    href={`/brand-packs/${activePack.id || activePack._id}`}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View Active Pack Details →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-400 italic">No published version active</div>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Authorized Rooftops</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {brand.applicableSites && brand.applicableSites.length > 0 ? (
                brand.applicableSites.map((site) => (
                  <Link
                    key={site}
                    href={`/sites/${site}`}
                    className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    🏢 {site}
                  </Link>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">All dealership sites</span>
              )}
            </div>
          </Card>
        </div>

        {/* Active Pack Snapshot */}
        {activePack && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>📸</span> Baseline Tier 1 Evidence Items ({activePack.tier1Items.length})
              </h3>
              <div className="space-y-2">
                {activePack.tier1Items.map((item, idx) => (
                  <div
                    key={item.key}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{item.title}</p>
                        <p className="text-[10px] text-slate-500">{item.instructions}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                        {item.mediaType}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {item.required ? 'MANDATORY' : 'OPTIONAL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>⚠️</span> Configured Fault Types ({activePack.faultTypes.length})
              </h3>
              <div className="space-y-2">
                {activePack.faultTypes.map((ft, idx) => (
                  <div
                    key={ft.key}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{ft.name}</p>
                        <p className="text-[10px] text-slate-500">{ft.description}</p>
                      </div>
                    </div>
                    <Badge variant="blue" size="sm">
                      {ft.tier2Items?.length || 0} Tier 2 Rules
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Pack Versions Table */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Brand Pack Versions</h3>
              <p className="text-xs text-slate-500">Historical & active rule configurations</p>
            </div>
            <Link href={`/brand-packs?brandCode=${brand.code}`}>
              <Button variant="outline" size="sm">
                View All Packs
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Tier 1</th>
                  <th className="py-2.5 px-3">Fault Types</th>
                  <th className="py-2.5 px-3">Published Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packs.map((p) => (
                  <tr key={p.id || p._id || p.version} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{p.version}</td>
                    <td className="py-3 px-3">
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
                    </td>
                    <td className="py-3 px-3 text-slate-700">{p.tier1Items?.length || 0} items</td>
                    <td className="py-3 px-3 text-slate-700">{p.faultTypes?.length || 0} types</td>
                    <td className="py-3 px-3 text-slate-500">
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/brand-packs/${p.id || p._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        Inspect Pack →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
