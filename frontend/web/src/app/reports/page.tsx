'use client';

import React, { useState } from 'react';
import { ShieldCheck, FolderOpen, Zap, DollarSign, Download, FileText } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { mockReportsData } from '../../lib/mock';

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState('Q3_2026');
  const data = mockReportsData;

  const handleExport = (format: 'CSV' | 'PDF') => {
    alert(`Exporting ${format} report for ${data.timeframe}... (Placeholder for Phase 4)`);
  };

  return (
    <ProtectedRoute requiredPermission="reports.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="Executive Reporting & Analytics"
            description="Warranty claim volumes, defect distributions, turnaround velocity, and payout trends."
            breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports' }]}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport('CSV')} className="inline-flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleExport('PDF')} className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Print PDF Summary</span>
                </Button>
              </div>
            }
          />

          {/* Timeframe Control */}
          <div className="flex justify-between items-center p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <span className="text-xs font-semibold text-slate-700">Analytics Window</span>
            <FilterSelect
              value={timeframe}
              onChange={setTimeframe}
              options={[
                { label: 'Current Quarter (Q3 2026)', value: 'Q3_2026' },
                { label: 'Previous Quarter (Q2 2026)', value: 'Q2_2026' },
                { label: 'Year to Date (2026 YTD)', value: 'YTD_2026' },
                { label: 'Trailing 12 Months', value: 'TTM' },
              ]}
            />
          </div>

          {/* Executive StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active Warranties"
              value={data.kpis.totalWarranties.toLocaleString()}
              icon={<ShieldCheck className="w-5 h-5 text-blue-600" />}
              iconBgColor="bg-blue-50 text-blue-600"
              change={`+${data.kpis.warrantiesGrowthPct}% vs prior period`}
              trend="up"
              badgeText="Volume"
              badgeVariant="blue"
            />
            <StatCard
              label="Active Claim Volume"
              value={data.kpis.openClaims}
              icon={<FolderOpen className="w-5 h-5 text-amber-600" />}
              iconBgColor="bg-amber-50 text-amber-600"
              change={`${data.kpis.claimsResolutionRatePct}% resolution rate`}
              trend="up"
              badgeText="Claims"
              badgeVariant="yellow"
            />
            <StatCard
              label="Avg Review Turnaround"
              value={`${data.kpis.avgReviewTurnaroundHours} hrs`}
              icon={<Zap className="w-5 h-5 text-emerald-600" />}
              iconBgColor="bg-emerald-50 text-emerald-600"
              change="SLA target: < 8 hrs"
              trend="up"
              badgeText="Velocity"
              badgeVariant="green"
            />
            <StatCard
              label="Settled Payouts (YTD)"
              value={`$${data.kpis.totalPayoutsAud.toLocaleString()} AUD`}
              icon={<DollarSign className="w-5 h-5 text-purple-600" />}
              iconBgColor="bg-purple-50 text-purple-600"
              change="Across 5 active dealership sites"
              badgeText="Payouts"
              badgeVariant="purple"
            />
          </div>

          {/* Volume Trends & Defect Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Table */}
            <Card title="Monthly Warranty & Claim Trends" description="Trailing volume progression">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="pb-2">Month</th>
                      <th className="pb-2 text-right">Warranties Enrolled</th>
                      <th className="pb-2 text-right">Claims Lodged</th>
                      <th className="pb-2 text-right">Settled Payouts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.volumeTrends.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-semibold text-slate-800">{row.month}</td>
                        <td className="py-2.5 text-right font-medium text-slate-600">{row.warranties}</td>
                        <td className="py-2.5 text-right font-semibold text-primary">{row.claims}</td>
                        <td className="py-2.5 text-right font-mono text-slate-800">
                          ${row.payoutsAud.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Defect Category Breakdown */}
            <Card title="Defect Distribution by Mechanical Category" description="Frequency across mechanical components">
              <div className="space-y-3 pt-1">
                {data.defectCategories.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat.name}</span>
                      <span>{cat.percentage}% ({cat.count} claims)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.colorHex }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quality Assurance & Evidence Approval Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Evidence Approval Ratio" description="First-time review pass rate" className="md:col-span-1">
              <div className="text-center py-4">
                <p className="text-4xl font-extrabold text-emerald-600">
                  {data.evidenceApprovalRate.approved}%
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-1">Approved on Initial Submission</p>
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 text-xs text-slate-500">
                  <div>
                    <span className="text-rose-600 font-bold">{data.evidenceApprovalRate.rejected}%</span>
                    <p className="text-[11px]">Rejected</p>
                  </div>
                  <div>
                    <span className="text-amber-600 font-bold">{data.evidenceApprovalRate.infoRequested}%</span>
                    <p className="text-[11px]">Info Requested</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Active Case Status Distribution" description="Current claims pipeline" className="md:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3">
                {data.caseStatusDistribution.map((item) => (
                  <div key={item.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                    <p className="text-2xl font-bold text-slate-900">{item.count}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{item.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{item.percentage}% of total</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
