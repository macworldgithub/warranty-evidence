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
import { getSite } from '../../../lib/api/sites';
import { getBrandPacks } from '../../../lib/api/brand-packs';
import { mockSites, mockBrandPacks } from '../../../lib/mock/brand-packs';
import type { Site, BrandPack } from '../../../types/brand-pack';

interface SiteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SiteDetailPage({ params }: SiteDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [applicablePacks, setApplicablePacks] = useState<BrandPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getSite(resolvedParams.id);
        if (data) {
          setSite(data);
          const packs = await getBrandPacks({ site: data.code });
          setApplicablePacks(packs.length > 0 ? packs : mockBrandPacks);
        } else {
          const fallback = mockSites.find(
            (s) => s.code.toLowerCase() === resolvedParams.id.toLowerCase() || s.id === resolvedParams.id,
          );
          if (fallback) {
            setSite(fallback);
            setApplicablePacks(mockBrandPacks);
          }
        }
      } catch {
        const fallback = mockSites.find(
          (s) => s.code.toLowerCase() === resolvedParams.id.toLowerCase(),
        );
        if (fallback) {
          setSite(fallback);
          setApplicablePacks(mockBrandPacks);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <ProtectedRoute requiredPermission="sites.view">
        <AppShell>
          <div className="p-8 text-center text-slate-500">Loading site profile...</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!site) {
    return (
      <ProtectedRoute requiredPermission="sites.view">
        <AppShell>
          <div className="p-12 text-center">
            <h2 className="text-lg font-bold text-slate-900">Site Not Found</h2>
            <p className="text-xs text-slate-500 mt-1">The requested dealership rooftop could not be found.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/sites')}>
              Back to Sites
            </Button>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission="sites.view">
      <AppShell>
        <PageHeader
          title={`${site.name} (${site.code})`}
          description={`${site.address.street}, ${site.address.suburb} ${site.address.state} ${site.address.postcode}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Sites', href: '/sites' },
            { label: site.code },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push('/sites')}>
                Back to Sites
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility Status</p>
            <div className="mt-2">
              <StatusBadge status={site.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              <p>Site Code: <strong>{site.code}</strong></p>
              <p>Phone: <strong>{site.phone || 'N/A'}</strong></p>
              <p>Email: <strong>{site.email || 'N/A'}</strong></p>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Authorized Franchises</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {site.brands.map((b) => (
                <Link
                  key={b}
                  href={`/brands/${b}`}
                  className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  🚘 {b}
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Warranty Rules</p>
            <p className="text-lg font-bold text-slate-900 mt-2">
              {applicablePacks.length} Brand Pack{applicablePacks.length === 1 ? '' : 's'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Enforced at this workshop</p>
          </Card>
        </div>

        {/* Brand Packs Table */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Applicable Warranty Brand Packs for {site.code}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3">Pack Version</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Tier 1 Rules</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicablePacks.map((p) => (
                  <tr key={p.id || p._id || p.version} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{p.brandCode}</td>
                    <td className="py-3 px-3 font-semibold text-indigo-700">{p.version}</td>
                    <td className="py-3 px-3">
                      <Badge variant="green" size="sm">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{p.tier1Items?.length || 0} items</td>
                    <td className="py-3 px-3">
                      <Link
                        href={`/brand-packs/${p.id || p._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        Inspect Pack Rules →
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
