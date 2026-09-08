'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, FileText, ArrowLeft } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { mockEvidence } from '../../../lib/mock';

export default function EvidenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const evidenceId = params?.['id'] as string;

  const item = mockEvidence.find((e) => e.id === evidenceId) || mockEvidence[0];

  if (!item) {
    return (
      <ProtectedRoute requiredPermission="evidence.view">
        <AppShell>
          <div className="py-12 text-center text-slate-500">Evidence record not found.</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission="evidence.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title={item.requirementName}
            description={`Case #${item.caseNumber} • Captured by ${item.capturedBy || 'Technician'}`}
            breadcrumbs={[
              { label: 'Home', href: '/dashboard' },
              { label: 'Evidence Vault', href: '/evidence' },
              { label: item.id },
            ]}
            actions={
              <Button variant="outline" size="sm" onClick={() => router.push('/evidence')} className="inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Evidence</span>
              </Button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metadata Sidebar */}
            <Card title="Evidence Lineage & Status" description="Audit metadata">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-400">Verification Status</span>
                  <StatusBadge status={item.status} />
                </div>
                <div>
                  <span className="text-slate-400">Associated Claim</span>
                  <p className="mt-0.5">
                    <Link href={`/cases/${item.caseId}`} className="font-mono text-primary font-semibold hover:underline">
                      {item.caseNumber}
                    </Link>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Format / Type</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{item.evidenceType}</p>
                </div>
                <div>
                  <span className="text-slate-400">Captured By</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{item.capturedBy || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Captured Timestamp</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{item.capturedAt || item.createdAt}</p>
                </div>
              </div>
            </Card>

            {/* Visual Attachment Gallery */}
            <div className="lg:col-span-2 space-y-6">
              <Card
                title={`Attachments & Preview Gallery (${item.attachments.length})`}
                description="Photographic proofs and exported diagnostic protocols"
              >
                {item.attachments.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    No files attached to this evidence item yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {item.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="h-40 bg-slate-200 flex flex-col items-center justify-center text-slate-500 font-medium text-xs gap-1.5 p-4 text-center">
                          {att.fileType.includes('image') ? (
                            <>
                              <Camera className="w-8 h-8 text-slate-400" />
                              <span>High-Res Photographic Inspection</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-8 h-8 text-slate-400" />
                              <span>Diagnostic Scan Protocol (PDF)</span>
                            </>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-xs text-slate-900 truncate">{att.fileName}</p>
                          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                            <span>{(att.fileSizeKb / 1024).toFixed(1)} MB</span>
                            <span>Uploaded: {att.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Technician Observation Notes" description="Field remarks">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  {item.notes || item.description}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
