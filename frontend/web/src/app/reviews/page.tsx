'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Modal } from '../../components/ui/Modal';
import { mockReviews } from '../../lib/mock';
import type { EvidenceReview, ReviewStatus } from '../../types/review';

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<EvidenceReview[]>(mockReviews);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Review Modal State
  const [selectedReview, setSelectedReview] = useState<EvidenceReview | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const query = search.toLowerCase();
      const matchesSearch =
        r.evidenceRequirement.toLowerCase().includes(query) ||
        r.caseNumber.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query) ||
        r.submittedBy.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reviews, search, statusFilter]);

  const handleDecision = (newStatus: ReviewStatus) => {
    if (!selectedReview) return;

    setReviews(
      reviews.map((r) =>
        r.id === selectedReview.id
          ? {
              ...r,
              status: newStatus,
              reviewerName: 'Active User',
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              decisionReason: decisionNotes || (newStatus === 'APPROVED' ? 'Approved by reviewer' : 'Declined'),
            }
          : r,
      ),
    );

    setSelectedReview(null);
    setDecisionNotes('');
  };

  const columns: Column<EvidenceReview>[] = [
    {
      key: 'evidenceRequirement',
      header: 'Evidence Requirement',
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-900">{r.evidenceRequirement}</span>
          <p className="text-[11px] text-slate-400">📎 {r.attachmentCount} attachment(s) attached</p>
        </div>
      ),
    },
    {
      key: 'caseNumber',
      header: 'Case / Claim',
      render: (r) => (
        <div>
          <span className="font-mono text-primary font-semibold">{r.caseNumber}</span>
          <p className="text-[11px] text-slate-500 truncate max-w-xs">{r.customerName}</p>
        </div>
      ),
    },
    {
      key: 'submittedBy',
      header: 'Submitted By',
      render: (r) => (
        <div className="text-[11px] text-slate-700">
          <p className="font-medium">{r.submittedBy}</p>
          <p className="text-slate-400">{r.submittedAt}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant={r.status === 'PENDING' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedReview(r);
              setDecisionNotes('');
            }}
          >
            {r.status === 'PENDING' ? 'Review' : 'View Decision'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="reviews.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="Review Queue"
            description="Technical assessment, diagnostic validation, and evidence sign-offs."
            breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reviews' }]}
          />

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search evidence, case #, or submitter..."
              className="w-full sm:max-w-sm"
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'All Reviews', value: 'ALL' },
                { label: 'Pending Assessment', value: 'PENDING' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Rejected', value: 'REJECTED' },
              ]}
            />
          </div>

          {/* Reviews Table */}
          <DataTable
            columns={columns}
            data={filteredReviews}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => router.push(`/reviews/${r.id}`)}
            emptyTitle="No reviews found"
            emptyDescription="There are no reviews matching your current filter criteria."
          />

          {/* Review Decision Modal */}
          {selectedReview && (
            <Modal
              isOpen={Boolean(selectedReview)}
              onClose={() => setSelectedReview(null)}
              title={`Evidence Review: ${selectedReview.caseNumber}`}
              size="lg"
            >
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">{selectedReview.evidenceRequirement}</span>
                    <StatusBadge status={selectedReview.status} />
                  </div>
                  <p className="text-slate-600">Case: {selectedReview.caseNumber} • Customer: {selectedReview.customerName}</p>
                  <p className="text-slate-500 font-mono">Vehicle: {selectedReview.vehicleSummary}</p>
                  <p className="text-[11px] text-slate-400">Submitted by: {selectedReview.submittedBy} at {selectedReview.submittedAt}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technician Observation & Notes
                  </label>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                    {selectedReview.notes || 'Evidence files submitted for verification.'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reviewer Assessment & Decision Justification
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide technical rationale for approval or reasons for decline..."
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg resize-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => setSelectedReview(null)}>
                    Close
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDecision('REJECTED')}
                    >
                      ✕ Reject Evidence
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDecision('APPROVED')}
                    >
                      ✓ Approve Evidence
                    </Button>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
