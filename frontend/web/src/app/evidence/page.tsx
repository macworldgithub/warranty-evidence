'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Paperclip, UploadCloud } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Modal } from '../../components/ui/Modal';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { mockEvidence, mockCases } from '../../lib/mock';
import type { EvidenceItem, EvidenceStatus, EvidenceType } from '../../types/evidence';

export default function EvidencePage() {
  const router = useRouter();
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(mockEvidence);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    caseId: mockCases[0]?.id || '',
    requirementName: '',
    evidenceType: 'PHOTO' as EvidenceType,
    description: '',
    mockFileName: '',
  });

  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((e) => {
      const query = search.toLowerCase();
      const matchesSearch =
        e.requirementName.toLowerCase().includes(query) ||
        e.caseNumber.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || e.evidenceType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [evidenceList, search, statusFilter, typeFilter]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requirementName) return;

    const selectedCase = mockCases.find((c) => c.id === formData.caseId) || mockCases[0];
    if (!selectedCase) return;

    const newEvidence: EvidenceItem = {
      id: `evi-${Date.now()}`,
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      requirementName: formData.requirementName,
      description: formData.description || 'Uploaded proof for warranty assessment',
      evidenceType: formData.evidenceType,
      status: 'SUBMITTED',
      capturedBy: 'Operations Technician',
      capturedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      attachments: formData.mockFileName
        ? [
            {
              id: `att-${Date.now()}`,
              fileName: formData.mockFileName,
              fileSizeKb: 2450,
              fileType: formData.evidenceType === 'PHOTO' ? 'image/jpeg' : 'application/pdf',
              uploadDate: new Date().toISOString().split('T')[0] ?? '',
            },
          ]
        : [],
      createdAt: new Date().toISOString().split('T')[0] ?? '',
    };

    setEvidenceList([newEvidence, ...evidenceList]);
    setIsUploadModalOpen(false);
    setFormData({
      caseId: mockCases[0]?.id || '',
      requirementName: '',
      evidenceType: 'PHOTO',
      description: '',
      mockFileName: '',
    });
  };

  const columns: Column<EvidenceItem>[] = [
    {
      key: 'requirement',
      header: 'Evidence Requirement',
      render: (e) => (
        <div>
          <span className="font-semibold text-slate-900 hover:text-primary transition-colors">
            {e.requirementName}
          </span>
          <p className="text-[11px] text-slate-400 truncate max-w-sm">{e.description}</p>
        </div>
      ),
    },
    {
      key: 'caseNumber',
      header: 'Case #',
      render: (e) => (
        <Link href={`/cases/${e.caseId}`} className="font-mono text-primary font-semibold hover:underline">
          {e.caseNumber}
        </Link>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (e) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
          {e.evidenceType}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (e) => <StatusBadge status={e.status} />,
    },
    {
      key: 'captured',
      header: 'Captured By / Date',
      render: (e) => (
        <div className="text-[11px] text-slate-600">
          <p>{e.capturedBy || 'Pending capture'}</p>
          <p className="text-slate-400">{e.capturedAt || '—'}</p>
        </div>
      ),
    },
    {
      key: 'attachments',
      header: 'Attachments',
      render: (e) => (
        <span className="font-semibold text-slate-700 flex items-center gap-1">
          {e.attachments.length > 0 ? (
            <>
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
              <span>{e.attachments.length} file(s)</span>
            </>
          ) : (
            'None'
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (e) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(ev) => ev.stopPropagation()}>
          <Link href={`/evidence/${e.id}`}>
            <Button variant="outline" size="sm">
              Inspect
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="evidence.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="Warranty Evidence Vault"
            description="Diagnostic photographs, oscilloscope logs, video documentation, and technical protocols."
            breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Evidence' }]}
            actions={
              <PermissionGate permission="evidence.create">
                <Button variant="primary" onClick={() => setIsUploadModalOpen(true)} className="inline-flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Add Evidence</span>
                </Button>
              </PermissionGate>
            }
          />

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search evidence item or case #..."
              className="w-full sm:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                label="Type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { label: 'All Types', value: 'ALL' },
                  { label: 'Photo', value: 'PHOTO' },
                  { label: 'Video', value: 'VIDEO' },
                  { label: 'Diagnostic Log', value: 'DIAGNOSTIC_LOG' },
                  { label: 'Document', value: 'DOCUMENT' },
                ]}
              />
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'Approved', value: 'APPROVED' },
                  { label: 'Under Review', value: 'UNDER_REVIEW' },
                  { label: 'Submitted', value: 'SUBMITTED' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Required', value: 'REQUIRED' },
                ]}
              />
            </div>
          </div>

          {/* Evidence Table */}
          <DataTable
            columns={columns}
            data={filteredEvidence}
            keyExtractor={(e) => e.id}
            onRowClick={(e) => router.push(`/evidence/${e.id}`)}
            emptyTitle="No evidence records found"
            emptyDescription="Adjust your search query or evidence filters."
          />

          {/* Upload/Add Evidence Modal */}
          <Modal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            title="Register Evidence Item"
            size="md"
          >
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associated Warranty Claim *
                </label>
                <select
                  value={formData.caseId}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  {mockCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evidence Requirement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Turbocharger Compressor Housing Photograph"
                  value={formData.requirementName}
                  onChange={(e) => setFormData({ ...formData, requirementName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evidence Format / Type *
                </label>
                <select
                  value={formData.evidenceType}
                  onChange={(e) => setFormData({ ...formData, evidenceType: e.target.value as EvidenceType })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="PHOTO">High-Resolution Photo</option>
                  <option value="VIDEO">Inspection Video Recording</option>
                  <option value="DIAGNOSTIC_LOG">ECU/OBD Diagnostic Log (PDF/CSV)</option>
                  <option value="DOCUMENT">Technical Work Order Document</option>
                </select>
              </div>

              {/* Upload Dropzone Placeholder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evidence File Attachment
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-700">Drop inspection file here or browse</p>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, PDF, or MP4 up to 50MB</p>
                  <input
                    type="text"
                    placeholder="mock_filename.jpg (Simulation for Phase 3)"
                    value={formData.mockFileName}
                    onChange={(e) => setFormData({ ...formData, mockFileName: e.target.value })}
                    className="mt-3 w-full max-w-xs px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technician Notes & Observations
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context regarding test conditions or diagnostic tools used..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Upload Evidence
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
