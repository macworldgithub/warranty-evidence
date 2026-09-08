'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, Camera, CheckSquare, FileText, Clock, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { mockCases, mockEvidence, mockTasks, mockReviews } from '../../../lib/mock';
import type { CaseStatus } from '../../../types/case';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.['id'] as string;

  const [activeTab, setActiveTab] = useState('overview');

  const caseItem = mockCases.find((c) => c.id === caseId) || mockCases[0];
  const [currentStatus, setCurrentStatus] = useState<CaseStatus>(caseItem?.status || 'IN_PROGRESS');

  if (!caseItem) {
    return (
      <ProtectedRoute requiredPermission="cases.view">
        <AppShell>
          <div className="py-12 text-center text-slate-500">Case record not found.</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const caseEvidence = mockEvidence.filter((e) => e.caseId === caseItem.id);
  const caseTasks = mockTasks.filter((t) => t.caseId === caseItem.id);
  const caseReviews = mockReviews.filter((r) => r.caseId === caseItem.id);

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Claim Overview', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'evidence', label: 'Evidence Capture', badge: caseEvidence.length, icon: <Camera className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks & Checklist', badge: caseTasks.length, icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'reviews', label: 'Review Records', badge: caseReviews.length, icon: <FileText className="w-4 h-4" /> },
    { id: 'activity', label: 'Audit Timeline', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <ProtectedRoute requiredPermission="cases.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title={`Claim #${caseItem.caseNumber}: ${caseItem.title}`}
            description={`${caseItem.vehicleSummary} • Lodged by ${caseItem.customerName}`}
            breadcrumbs={[
              { label: 'Home', href: '/dashboard' },
              { label: 'Cases', href: '/cases' },
              { label: caseItem.caseNumber },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/cases')} className="inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Cases</span>
                </Button>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as CaseStatus)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white cursor-pointer"
                >
                  <option value="OPEN">Status: OPEN</option>
                  <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                  <option value="PENDING">Status: PENDING REVIEW</option>
                  <option value="CLOSED">Status: CLOSED</option>
                </select>
              </div>
            }
          />

          {/* Quick Metrics Header */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Priority Tier</span>
              <div className="mt-1.5">
                <StatusBadge status={caseItem.priority} size="md" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Category: {caseItem.category.replace('_', ' ')}</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Workflow Status</span>
              <div className="mt-1.5">
                <StatusBadge status={currentStatus} size="md" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Updated: {caseItem.updatedAt}</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Assigned Technician</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{caseItem.assignedTo.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{caseItem.assignedTo.email}</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Claim Estimate</span>
              <p className="text-base font-extrabold text-slate-900 mt-1">
                ${caseItem.estimatedCostAud?.toLocaleString()} AUD
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                {caseItem.approvedAmountAud ? `Approved: $${caseItem.approvedAmountAud.toLocaleString()} AUD` : 'Under assessment'}
              </p>
            </Card>
          </div>

          {/* Tab Navigation */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card title="Defect Narrative & Diagnostic Details" description="Customer report and workshop findings">
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="font-semibold text-slate-800 mb-1">Issue Summary:</p>
                      <p className="text-slate-700 leading-relaxed">{caseItem.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-slate-400 font-medium">Warranty Policy</span>
                        <p className="mt-1">
                          <Link href={`/warranties/${caseItem.warrantyId}`} className="font-semibold text-primary hover:underline inline-flex items-center gap-1">
                            <span>{caseItem.warrantyNumber}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Vehicle Enrolled</span>
                        <p className="font-semibold text-slate-800 mt-1">{caseItem.vehicleSummary}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <Card title="Customer Contact" description="Primary policy holder">
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400">Customer Name</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{caseItem.customerName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Lodged Date</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{caseItem.createdAt}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <Link href={`/warranties/${caseItem.warrantyId}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Warranty Record
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 2: Evidence Capture */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-slate-600">
                  Required photographic, video, and diagnostic protocol evidence
                </p>
                <Link href="/evidence">
                  <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Add Evidence Item</span>
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseEvidence.map((evi) => (
                  <Card key={evi.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{evi.requirementName}</span>
                      <StatusBadge status={evi.status} />
                    </div>
                    <p className="text-xs text-slate-600">{evi.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span>Type: {evi.evidenceType}</span>
                      <span>{evi.attachments.length} attachment(s)</span>
                    </div>
                    <div className="flex justify-end pt-1">
                      <Link href={`/evidence/${evi.id}`}>
                        <Button variant="outline" size="sm" className="inline-flex items-center gap-1">
                          <span>Inspect Evidence</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-slate-600">Action items assigned to operational personnel</p>
                <Link href="/tasks">
                  <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Task</span>
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {caseTasks.map((t) => (
                  <Card key={t.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{t.title}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{t.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                      <span>Assigned to: <strong className="text-slate-700">{t.assignedToName}</strong></span>
                      <span>Due: {t.dueDate}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-600">Administrative and quality assurance reviews</p>
              {caseReviews.length === 0 ? (
                <Card className="p-8 text-center text-xs text-slate-400">
                  No review submissions currently logged for this case.
                </Card>
              ) : (
                <div className="space-y-3">
                  {caseReviews.map((r) => (
                    <Card key={r.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{r.evidenceRequirement}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-xs text-slate-600">{r.notes}</p>
                      {r.decisionReason && (
                        <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                          <strong>Decision Note:</strong> {r.decisionReason}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span>Submitted by: {r.submittedBy}</span>
                        <Link href={`/reviews/${r.id}`}>
                          <Button variant="outline" size="sm" className="inline-flex items-center gap-1">
                            <span>Open Review</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Activity */}
          {activeTab === 'activity' && (
            <Card title="Claim Audit Trail" description="Chronological event log">
              <div className="space-y-4 text-xs">
                <div className="flex gap-3 pb-3 border-b border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Claim Lodged & Priority Assigned</p>
                    <p className="text-slate-500 text-[11px]">{caseItem.createdAt} • Logged by Marcus Vance</p>
                  </div>
                </div>
                <div className="flex gap-3 pb-3 border-b border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Diagnostic Inspection Task Dispatched</p>
                    <p className="text-slate-500 text-[11px]">Assigned to Operations team</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Latest Evidence Submitted for Review</p>
                    <p className="text-slate-500 text-[11px]">{caseItem.updatedAt}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
