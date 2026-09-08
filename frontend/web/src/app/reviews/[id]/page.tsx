'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, Check, CheckCircle, ArrowLeft, AlertTriangle, XCircle } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { mockReviews } from '../../../lib/mock';
import type { ReviewStatus } from '../../../types/review';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params?.['id'] as string;

  const review = mockReviews.find((r) => r.id === reviewId) || mockReviews[0];
  const [currentStatus, setCurrentStatus] = useState<ReviewStatus>(review?.status || 'PENDING');
  const [decisionNotes, setDecisionNotes] = useState(review?.decisionReason || '');
  const [decisionSaved, setDecisionSaved] = useState(false);

  if (!review) {
    return (
      <ProtectedRoute requiredPermission="reviews.view">
        <AppShell>
          <div className="py-12 text-center text-slate-500">Review record not found.</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const handleDecision = (status: ReviewStatus) => {
    setCurrentStatus(status);
    setDecisionSaved(true);
  };

  return (
    <ProtectedRoute requiredPermission="reviews.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title={`Review: ${review.evidenceRequirement}`}
            description={`Case #${review.caseNumber} • ${review.customerName}`}
            breadcrumbs={[
              { label: 'Home', href: '/dashboard' },
              { label: 'Reviews', href: '/reviews' },
              { label: review.caseNumber },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/reviews')}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Reviews
                </Button>
                <Link href={`/cases/${review.caseId}`}>
                  <Button variant="primary" size="sm">
                    Open Case Workspace
                  </Button>
                </Link>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Context & Metadata */}
            <div className="space-y-6">
              <Card title="Submission Details" description="Context regarding the diagnostic submission">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Current Status</span>
                    <StatusBadge status={currentStatus} />
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Claim #</span>
                    <span className="font-mono font-semibold text-slate-900">{review.caseNumber}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Customer</span>
                    <span className="font-semibold text-slate-900">{review.customerName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Submitted By</span>
                    <span className="font-semibold text-slate-900">{review.submittedBy}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Submission Time</span>
                    <span className="text-slate-700">{review.submittedAt}</span>
                  </div>
                </div>
              </Card>

              <Card title="Vehicle Attributes" description="Vehicle covered under warranty">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <p className="font-semibold text-slate-900">{review.vehicleSummary}</p>
                  <p className="text-[11px] text-slate-500">Subject to standard mechanical claim terms</p>
                </div>
              </Card>
            </div>

            {/* Right Column: Review Workspace & Decision Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card title="Evidence Breakdown & Technician Remarks" description="Proof submitted for underwriting review">
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed text-slate-700">
                    <p className="font-semibold text-slate-900 mb-1">Technician Observation Notes:</p>
                    {review.notes || 'Inspection completed according to dealership guidelines. Evidence attachments uploaded for confirmation.'}
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <p className="font-semibold text-slate-900">Attached Inspection Files:</p>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs">
                      <Camera className="w-5 h-5 text-slate-600 shrink-0" />
                      <div className="flex-1 truncate">
                        <p className="font-semibold text-slate-800 truncate">{review.evidenceRequirement}.jpg</p>
                        <p className="text-[11px] text-slate-400">3.4 MB • High Resolution JPEG</p>
                      </div>
                      <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Interactive Underwriter Decision Box */}
              <Card title="Underwriting Assessment & Decision" description="Record sign-off status and technical rationale">
                <div className="space-y-4 text-xs">
                  {decisionSaved && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Decision recorded: <strong>{currentStatus}</strong></span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Decision Rationale & Auditor Comments
                    </label>
                    <textarea
                      rows={3}
                      value={decisionNotes}
                      onChange={(e) => setDecisionNotes(e.target.value)}
                      placeholder="Detail why evidence meets or fails coverage criteria..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecision('INFO_REQUESTED')}
                      className="gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" /> Request More Information
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDecision('REJECTED')}
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Decline Claim Evidence
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDecision('APPROVED')}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Authorize & Approve
                      </Button>
                    </div>
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
