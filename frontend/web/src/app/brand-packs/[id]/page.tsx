'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/ui/Tabs';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { PermissionGate } from '../../../components/auth/PermissionGate';
import {
  getBrandPack,
  cloneBrandPack,
  publishBrandPack,
  archiveBrandPack,
  validateBrandPack,
} from '../../../lib/api/brand-packs';
import { mockBrandPacks } from '../../../lib/mock/brand-packs';
import type { BrandPack, ValidationResult } from '../../../types/brand-pack';

interface BrandPackDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BrandPackDetailPage({ params }: BrandPackDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [pack, setPack] = useState<BrandPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tier1');

  // Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewStep, setPreviewStep] = useState<1 | 2 | 3>(1);
  const [previewFaultType, setPreviewFaultType] = useState<string>('');
  const [previewPartReplaced, setPreviewPartReplaced] = useState(true);
  const [previewNoiseFault, setPreviewNoiseFault] = useState(false);

  // Clone Modal
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [cloneVersion, setCloneVersion] = useState('');
  const [isCloning, setIsCloning] = useState(false);

  // Validation State
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Publish Dialog
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await getBrandPack(resolvedParams.id);
        if (isMounted) {
          if (data) {
            setPack(data);
          } else {
            const fallback = mockBrandPacks.find(
              (p) => p.id === resolvedParams.id || p._id === resolvedParams.id || p.version === resolvedParams.id,
            ) || mockBrandPacks[0];
            setPack(fallback);
          }
        }
      } catch {
        if (isMounted) {
          setPack(mockBrandPacks[0]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <ProtectedRoute requiredPermission="brand_packs.view">
        <AppShell>
          <div className="p-8 text-center text-slate-500">Loading warranty rules configuration...</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!pack) {
    return (
      <ProtectedRoute requiredPermission="brand_packs.view">
        <AppShell>
          <div className="p-12 text-center">
            <h2 className="text-lg font-bold text-slate-900">Brand Pack Not Found</h2>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/brand-packs')}>
              Back to Directory
            </Button>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const res = await validateBrandPack(pack.id || pack._id!);
      setValidationResult(res);
    } catch (err) {
      alert((err as Error).message || 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const updated = await publishBrandPack(pack.id || pack._id!, {
        changelog: 'Published via Admin Portal',
      });
      setPack(updated);
      setPublishModalOpen(false);
    } catch (err) {
      alert((err as Error).message || 'Failed to publish.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm(`Archive Brand Pack ${pack.brandCode} ${pack.version}? Historical cases will preserve this version.`)) return;
    try {
      const updated = await archiveBrandPack(pack.id || pack._id!);
      setPack(updated);
    } catch (err) {
      alert((err as Error).message || 'Failed to archive.');
    }
  };

  const tabs = [
    { id: 'tier1', label: `Tier 1 Baseline (${pack.tier1Items?.length || 0})` },
    { id: 'faultTypes', label: `Fault Types (${pack.faultTypes?.length || 0})` },
    { id: 'vehicleRules', label: 'Vehicle Identification' },
    { id: 'conditionalRules', label: `Conditional Rules (${pack.conditionalRules?.length || 0})` },
    { id: 'namingRules', label: `OEM File Naming (${pack.namingRules?.length || 0})` },
    { id: 'metadata', label: 'Audit & Version Info' },
  ];

  return (
    <ProtectedRoute requiredPermission="brand_packs.view">
      <AppShell>
        <PageHeader
          title={`${pack.brandCode} Warranty Evidence Pack`}
          description={`Version ${pack.version} • ${pack.description || 'Configurable OEM evidence requirements'}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Brand Packs', href: '/brand-packs' },
            { label: `${pack.brandCode} ${pack.version}` },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setPreviewStep(1);
                  setPreviewModalOpen(true);
                }}
              >
                <span className="mr-1.5">📱</span> Technician App Preview
              </Button>

              {pack.status === 'DRAFT' && (
                <>
                  <Link href={`/brand-packs/${pack.id || pack._id}/edit`}>
                    <Button variant="primary">
                      <span className="mr-1.5">✏️</span> Edit Draft
                    </Button>
                  </Link>
                  <PermissionGate permission="brand_packs.publish">
                    <Button
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setPublishModalOpen(true)}
                    >
                      <span className="mr-1.5">🚀</span> Publish Version
                    </Button>
                  </PermissionGate>
                </>
              )}

              {pack.status === 'PUBLISHED' && (
                <>
                  <PermissionGate permission="brand_packs.create">
                    <Button
                      variant="primary"
                      onClick={() => {
                        const match = pack.version.match(/^v?(\d+)(\.(\d+))?$/i);
                        setCloneVersion(match ? `v${parseInt(match[1], 10) + 1}.0` : `${pack.version}-draft`);
                        setCloneModalOpen(true);
                      }}
                    >
                      <span className="mr-1.5">📋</span> Clone to New Version
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="brand_packs.archive">
                    <Button variant="outline" onClick={handleArchive}>
                      Archive Pack
                    </Button>
                  </PermissionGate>
                </>
              )}
            </div>
          }
        />

        {/* Status & Scope Banner */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-sm">
              {pack.brandCode}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {pack.brandCode} Evidence Specification
                </h3>
                <Badge
                  variant={
                    pack.status === 'PUBLISHED'
                      ? 'green'
                      : pack.status === 'DRAFT'
                      ? 'amber'
                      : 'slate'
                  }
                  size="sm"
                >
                  {pack.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Version identifier: <strong>{pack.version}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Applicable Sites
              </span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {pack.applicableSites && pack.applicableSites.length > 0 ? (
                  pack.applicableSites.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="font-semibold text-slate-700">All Brand Franchises</span>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleValidate} isLoading={isValidating}>
              Validate Structure
            </Button>
          </div>
        </div>

        {/* Validation Result Banner */}
        {validationResult && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              validationResult.valid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">
                {validationResult.valid
                  ? '✓ Brand Pack passed validation. Ready for publication.'
                  : '✕ Validation issues detected:'}
              </span>
              <button
                onClick={() => setValidationResult(null)}
                className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            {validationResult.errors.length > 0 && (
              <ul className="mt-2 text-xs list-disc list-inside space-y-1">
                {validationResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
            {validationResult.warnings.length > 0 && (
              <ul className="mt-2 text-xs list-disc list-inside text-amber-800 space-y-0.5">
                {validationResult.warnings.map((warn, i) => (
                  <li key={i}>Warning: {warn}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* TAB 1: TIER 1 EVIDENCE */}
        {activeTab === 'tier1' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
              <p className="font-bold">Tier 1 Baseline Evidence Workflow:</p>
              <p className="mt-0.5 text-blue-800">
                These common baseline items are mandatory for all warranty claims under {pack.brandCode}. Every technician will be guided through these items before selecting concern-specific Tier 2 fault categories.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pack.tier1Items?.map((item, idx) => (
                <Card key={item.key} className="p-4 border-l-4 border-l-blue-600">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{item.key}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.mediaType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.required
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.required ? 'REQUIRED' : 'OPTIONAL'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5">{item.description}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <p><strong>Instructions for Tech:</strong> {item.instructions || 'N/A'}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-[10px]">
                      <span>Min count: <strong>{item.minimumCount}</strong></span>
                      <span>Max count: <strong>{item.maximumCount}</strong></span>
                      {item.qualityRules?.ocrRequired && (
                        <span className="text-indigo-600 font-bold">✓ OCR Enabled</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FAULT TYPES & TIER 2 */}
        {activeTab === 'faultTypes' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
              <p className="font-bold">Tier 2 Concern-Specific Evidence Rules:</p>
              <p className="mt-0.5 text-amber-800">
                When a technician selects a fault category in the capture app, the system dynamically prompts for the specific Tier 2 technical evidence items configured below.
              </p>
            </div>

            <div className="space-y-4">
              {pack.faultTypes?.map((ft, fIdx) => (
                <Card key={ft.key} className="p-5">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">
                          {fIdx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{ft.name}</h4>
                        <Badge variant="blue" size="sm">{ft.key}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{ft.description}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {ft.tier2Items?.length || 0} Tier 2 Requirement{ft.tier2Items?.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ft.tier2Items?.map((t2, tIdx) => (
                      <div
                        key={t2.key}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 truncate block">
                            {t2.title}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                            {t2.mediaType}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                          {t2.instructions || t2.description}
                        </p>
                        <div className="mt-2 text-[10px] text-slate-400">
                          Count: {t2.minimumCount}–{t2.maximumCount}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VEHICLE RULES */}
        {activeTab === 'vehicleRules' && (
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Vehicle Identification & Compliance Protocol
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500 block">VIN Validation</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">
                  {pack.vehicleRules.vinRequired ? '✓ Mandatory' : 'Optional'}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Full 17-character VIN verification before case submission
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500 block">Optical Character Recognition</span>
                <span className="text-sm font-bold text-indigo-700 mt-1 block">
                  {pack.vehicleRules.vinOcrEnabled ? '⚡ OCR Enabled' : 'Manual Entry Only'}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Camera scans barcode / VIN label automatically
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500 block">Odometer Capture</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">
                  {pack.vehicleRules.odometerRequired ? '✓ Mandatory' : 'Optional'}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cluster photo required to protect warranty mileage limits
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500 block">Front-of-Vehicle Photo</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">
                  {pack.vehicleRules.frontPhotoRequired ? '✓ Required' : 'Optional'}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Includes registration plate in frame for audit trail
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 col-span-2">
                <span className="text-xs font-semibold text-slate-500 block">Permitted Powertrains</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pack.vehicleRules.supportedPowertrains?.map((pw) => (
                    <span key={pw} className="px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {pw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* TAB 4: CONDITIONAL RULES */}
        {activeTab === 'conditionalRules' && (
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Conditional Evidence Triggers
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Deterministic rule engine evaluated at technician capture runtime.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Rule Name</th>
                    <th className="py-2.5 px-3">Condition (IF)</th>
                    <th className="py-2.5 px-3">Triggered Requirement (THEN)</th>
                    <th className="py-2.5 px-3">OEM Audit Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pack.conditionalRules?.map((cr) => (
                    <tr key={cr.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">{cr.name}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-indigo-700">
                        {cr.condition?.field} {cr.condition?.operator} {JSON.stringify(cr.condition?.value)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {cr.actions?.map((act, aIdx) => (
                            <span key={aIdx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              REQUIRE: {act.evidenceKey}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {cr.actions?.[0]?.reason || cr.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 5: OEM FILE NAMING RULES */}
        {activeTab === 'namingRules' && (
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              OEM Submission File Naming Engine
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Technicians never manually name files. The backend formats every attachment according to the OEM template below.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Evidence Key</th>
                    <th className="py-2.5 px-3">Descriptor</th>
                    <th className="py-2.5 px-3">Template Pattern</th>
                    <th className="py-2.5 px-3">Example Resolved Output (RO: RO-8821)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pack.namingRules?.map((nr) => {
                    const sampleOutput = nr.template
                      .replace('{RO}', 'RO8821')
                      .replace('{ext}', 'jpg');
                    return (
                      <tr key={nr.evidenceKey} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-900">
                          {nr.evidenceKey}
                        </td>
                        <td className="py-3 px-3 text-slate-700">{nr.descriptor}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-blue-700">
                          {nr.template}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-emerald-700 font-semibold">
                          {sampleOutput}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 6: METADATA & AUDIT */}
        {activeTab === 'metadata' && (
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Pack Governance & Audit Trail</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Created By</span>
                <span className="font-bold text-slate-800">{pack.createdBy}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Published By</span>
                <span className="font-bold text-slate-800">{pack.publishedBy || 'Not yet published'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Published Date</span>
                <span className="font-bold text-slate-800">
                  {pack.publishedAt ? new Date(pack.publishedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Changelog Notes</span>
                <span className="font-bold text-slate-800">{pack.changelog || 'None'}</span>
              </div>
            </div>
          </Card>
        )}

        {/* TECHNICIAN APP PREVIEW MODAL */}
        <Modal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title={`Technician Capture Flow Preview • ${pack.brandCode}`}
        >
          <div className="space-y-4">
            {/* Steps breadcrumb in modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
              <span className={`font-bold ${previewStep === 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                1. Vehicle Identity
              </span>
              <span className="text-slate-300">→</span>
              <span className={`font-bold ${previewStep === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                2. Concern / Fault
              </span>
              <span className="text-slate-300">→</span>
              <span className={`font-bold ${previewStep === 3 ? 'text-blue-600' : 'text-slate-400'}`}>
                3. Technical Evidence
              </span>
            </div>

            {/* STEP 1: Vehicle Identity */}
            {previewStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Technician begins repair order. System enforces Tier 1 baseline requirements:
                </p>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <span>📸 VIN Plate Photo</span>
                    <Badge variant="blue" size="sm">OCR Ready</Badge>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <span>📸 Odometer Cluster</span>
                    <Badge variant="green" size="sm">Ready Mode</Badge>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <span>📸 Front of Vehicle (Rego Plate)</span>
                    <Badge variant="slate" size="sm">Bay View</Badge>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button variant="primary" size="sm" onClick={() => setPreviewStep(2)}>
                    Next: Select Concern →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Concern Selection */}
            {previewStep === 2 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Select customer repair concern to load OEM Tier 2 rules:
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {pack.faultTypes?.map((ft) => (
                    <button
                      key={ft.key}
                      type="button"
                      onClick={() => setPreviewFaultType(ft.key)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        (previewFaultType || pack.faultTypes[0]?.key) === ft.key
                          ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {ft.name}
                    </button>
                  ))}
                </div>

                <div className="pt-3 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setPreviewStep(1)}>
                    ← Back
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setPreviewStep(3)}>
                    Next: Evidence Checklist →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Evidence Checklist */}
            {previewStep === 3 && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Condition Modifiers:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={previewPartReplaced}
                      onChange={(e) => setPreviewPartReplaced(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Part being replaced with new genuine component?</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={previewNoiseFault}
                      onChange={(e) => setPreviewNoiseFault(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Audible noise or operational symptom?</span>
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">Required Evidence Packet:</span>
                  <div className="p-2 rounded bg-emerald-50 text-emerald-800 font-medium">
                    ✓ Tier 1: VIN, Odometer, Front of Car, Fault Close-up, Location
                  </div>
                  <div className="p-2 rounded bg-indigo-50 text-indigo-800 font-medium">
                    ✓ Tier 2 ({previewFaultType || pack.faultTypes[0]?.key}): Specific diagnostic photos
                  </div>
                  {previewPartReplaced && (
                    <div className="p-2 rounded bg-amber-50 text-amber-800 font-medium">
                      ⚠️ Conditional: Old Part Serial & New Part Serial Photos Required
                    </div>
                  )}
                  {previewNoiseFault && (
                    <div className="p-2 rounded bg-purple-50 text-purple-800 font-medium">
                      🎥 Conditional: Video Recording Required
                    </div>
                  )}
                </div>

                <div className="pt-3 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setPreviewStep(2)}>
                    ← Back
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setPreviewModalOpen(false)}>
                    Done Previewing
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* CLONE MODAL */}
        <Modal
          isOpen={cloneModalOpen}
          onClose={() => setCloneModalOpen(false)}
          title={`Clone Brand Pack ${pack.brandCode} ${pack.version}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Creates an editable <strong>DRAFT</strong> version containing all current requirements. Historical cases will continue linking to <strong>{pack.version}</strong>.
            </p>
            <Input
              label="New Version"
              value={cloneVersion}
              onChange={(e) => setCloneVersion(e.target.value)}
              placeholder="e.g. v2.0"
              required
            />
            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setCloneModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  setIsCloning(true);
                  try {
                    const cloned = await cloneBrandPack(pack.id || pack._id!, { newVersion: cloneVersion });
                    router.push(`/brand-packs/${cloned.id || cloned._id}/edit`);
                  } catch (err) {
                    alert((err as Error).message || 'Clone failed');
                  } finally {
                    setIsCloning(false);
                  }
                }}
                isLoading={isCloning}
              >
                Create Draft
              </Button>
            </div>
          </div>
        </Modal>

        {/* PUBLISH CONFIRMATION MODAL */}
        <Modal
          isOpen={publishModalOpen}
          onClose={() => setPublishModalOpen(false)}
          title={`Publish ${pack.brandCode} ${pack.version}?`}
        >
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <p className="font-bold">Important Publishing Action:</p>
              <p className="mt-0.5">
                Publishing will make version <strong>{pack.version}</strong> the active warranty configuration for {pack.applicableSites?.length || 'all'} sites. Any currently active version will be archived.
              </p>
            </div>
            <p>Summary of configuration:</p>
            <ul className="list-disc list-inside space-y-1 font-medium text-slate-800">
              <li>{pack.tier1Items?.length || 0} Tier 1 baseline requirements</li>
              <li>{pack.faultTypes?.length || 0} Fault categories configured</li>
              <li>{pack.conditionalRules?.length || 0} Conditional triggers</li>
              <li>{pack.namingRules?.length || 0} OEM naming templates</li>
            </ul>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setPublishModalOpen(false)} disabled={isPublishing}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handlePublish}
                isLoading={isPublishing}
              >
                Confirm & Publish
              </Button>
            </div>
          </div>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}
