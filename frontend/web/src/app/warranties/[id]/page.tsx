'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '../../../components/layout/AppShell';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { mockWarranties, mockCases } from '../../../lib/mock';

export default function WarrantyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const warrantyId = params?.['id'] as string;

  const warranty = mockWarranties.find((w) => w.id === warrantyId) || mockWarranties[0];
  const relatedCases = mockCases.filter((c) => c.warrantyId === warranty?.id);

  if (!warranty) {
    return (
      <ProtectedRoute requiredPermission="warranties.view">
        <AppShell>
          <div className="py-12 text-center text-slate-500">Warranty record not found.</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission="warranties.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title={`Warranty Policy: ${warranty.warrantyNumber}`}
            description={`${warranty.vehicle.year} ${warranty.vehicle.make} ${warranty.vehicle.model} • ${warranty.customer.fullName}`}
            breadcrumbs={[
              { label: 'Home', href: '/dashboard' },
              { label: 'Warranties', href: '/warranties' },
              { label: warranty.warrantyNumber },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/warranties')}>
                  ← Back to Warranties
                </Button>
                <Link href={`/cases`}>
                  <Button variant="primary" size="sm">
                    ➕ Raise Claim
                  </Button>
                </Link>
              </div>
            }
          />

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Policy Status</span>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge status={warranty.status} size="md" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">{warranty.dealershipName}</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Coverage Tier</span>
              <p className="text-base font-bold text-slate-900 mt-1">
                {warranty.coverageType.replace('_', ' ')}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Max limit: ${warranty.maxClaimLimitAud.toLocaleString()} AUD</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Policy Term</span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {warranty.startDate} — {warranty.endDate}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Deductible: ${warranty.deductibleAud} AUD</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Active Claims</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{relatedCases.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Warranty defect claims lodged</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicle & Customer Specifications */}
            <div className="space-y-6">
              <Card title="Vehicle Specifications" description="Inspected vehicle attributes">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">VIN</span>
                    <span className="font-mono font-semibold text-slate-800">{warranty.vehicle.vin}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Make / Model</span>
                    <span className="font-semibold text-slate-800">
                      {warranty.vehicle.make} {warranty.vehicle.model}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Model Year</span>
                    <span className="font-semibold text-slate-800">{warranty.vehicle.year}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Registration Plate</span>
                    <span className="font-semibold text-slate-800">{warranty.vehicle.registrationPlate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Odometer at Delivery</span>
                    <span className="font-semibold text-slate-800">{warranty.vehicle.odometerKm.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Engine Serial #</span>
                    <span className="font-mono text-slate-800">{warranty.vehicle.engineNumber || 'Verified by Dealership'}</span>
                  </div>
                </div>
              </Card>

              <Card title="Customer Information" description="Primary policy holder details">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-semibold text-slate-800">{warranty.customer.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Email</span>
                    <span className="font-semibold text-slate-800">{warranty.customer.email}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-semibold text-slate-800">{warranty.customer.phone}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Residential Address</span>
                    <span className="text-right text-slate-700">{warranty.customer.address || 'Victoria, Australia'}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Related Claims & Policy Activity */}
            <div className="lg:col-span-2 space-y-6">
              <Card
                title={`Warranty Claims & Cases (${relatedCases.length})`}
                description="Defect reports and active claims lodged against this policy"
              >
                {relatedCases.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No warranty claims have been lodged for this vehicle.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="pb-2">Case #</th>
                          <th className="pb-2">Issue / Defect</th>
                          <th className="pb-2">Priority</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {relatedCases.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 font-semibold text-primary">
                              <Link href={`/cases/${c.id}`} className="hover:underline">
                                {c.caseNumber}
                              </Link>
                            </td>
                            <td className="py-3">
                              <p className="font-semibold text-slate-800">{c.title}</p>
                              <p className="text-[11px] text-slate-400">{c.category.replace('_', ' ')}</p>
                            </td>
                            <td className="py-3">
                              <StatusBadge status={c.priority} />
                            </td>
                            <td className="py-3">
                              <StatusBadge status={c.status} />
                            </td>
                            <td className="py-3 text-right">
                              <Link href={`/cases/${c.id}`}>
                                <Button variant="outline" size="sm">Workspace</Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card title="Coverage Guidelines & Policy Terms" description="Underwriting boundaries">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed space-y-2">
                  <p className="font-semibold text-slate-900">Coverage Terms Summary:</p>
                  <p>{warranty.notes || 'All mechanical assemblies lubricated by internal fluids are covered against sudden failure under manufacturer recommended servicing intervals.'}</p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Enrolled On: {warranty.createdAt}</span>
                    <span>Policy Issuer: {warranty.dealershipName}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
