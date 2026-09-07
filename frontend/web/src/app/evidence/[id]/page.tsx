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
            title={`Evidence Item: ${item.requirementName}`}
            description={`Case #${item.caseNumber} • Type: ${item.evidenceType}`}
            breadcrumbs={[
              { label: 'Home', href: '/dashboard' },
              { label: 'Evidence', href: '/evidence' },
              { label: item.requirementName },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/evidence')}>
                  ← Back to Evidence
                </Button>
                <Link href={`/cases/${item.caseId}`}>
                  <Button variant="primary" size="sm">
                    View Case #{item.caseNumber}
                  </Button>
                </Link>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metadata Summary */}
            <div className="space-y-6">
              <Card title="Evidence Metadata" description="Capture specifics and provenance">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Status</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Evidence Format</span>
                    <span className="font-semibold text-slate-800">{item.evidenceType}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Linked Case</span>
                    <Link href={`/cases/${item.caseId}`} className="font-semibold text-primary hover:underline">
                      {item.caseNumber}
                    </Link>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Captured By</span>
                    <span className="font-semibold text-slate-800">{item.capturedBy || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Captured Timestamp</span>
                    <span className="font-semibold text-slate-800">{item.capturedAt || 'Pending'}</span>
                  </div>
                </div>
              </Card>

              <Card title="Verification & Review Summary" description="Underwriting assessment">
                <div className="space-y-2 text-xs">
                  {item.reviewNotes ? (
                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 leading-relaxed">
                      <p className="font-semibold mb-1">Reviewer Assessment:</p>
                      <p>{item.reviewNotes}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">This evidence item has not yet been processed by a reviewer.</p>
                  )}
                </div>
              </Card>
            </div>

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
                        <div className="h-40 bg-slate-200 flex items-center justify-center text-slate-400 font-medium text-xs">
                          {att.fileType.includes('image') ? '📷 High-Res Photographic Inspection' : '📄 Diagnostic Scan Protocol (PDF)'}
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
