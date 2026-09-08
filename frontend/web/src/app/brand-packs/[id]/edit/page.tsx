'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../../components/layout/AppShell';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Tabs } from '../../../../components/ui/Tabs';
import { Modal } from '../../../../components/ui/Modal';
import {
  getBrandPack,
  updateBrandPack,
  validateBrandPack,
  publishBrandPack,
} from '../../../../lib/api/brand-packs';
import { mockBrandPacks } from '../../../../lib/mock/brand-packs';
import type {
  BrandPack,
  EvidenceRule,
  FaultType,
  ConditionalRule,
  NamingRule,
  ValidationResult,
  MediaType,
  PowertrainType,
} from '../../../../types/brand-pack';

interface BrandPackEditPageProps {
  params: Promise<{ id: string }>;
}

export default function BrandPackEditPage({ params }: BrandPackEditPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [pack, setPack] = useState<BrandPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Validation & Publish State
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Unsaved changes confirmation dialog
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getBrandPack(resolvedParams.id);
        if (data) {
          setPack(data);
        } else {
          const fallback = mockBrandPacks.find(
            (p) => p.id === resolvedParams.id || p._id === resolvedParams.id || p.version === resolvedParams.id,
          ) || mockBrandPacks[0];
          setPack(JSON.parse(JSON.stringify(fallback)));
        }
      } catch {
        setPack(JSON.parse(JSON.stringify(mockBrandPacks[0])));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resolvedParams.id]);

  // Window beforeunload guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (loading || !pack) {
    return (
      <ProtectedRoute requiredPermission="brand_packs.update">
        <AppShell>
          <div className="p-8 text-center text-slate-500">Loading editor...</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await updateBrandPack(pack.id || pack._id!, {
        description: pack.description,
        applicableSites: pack.applicableSites,
        vehicleRules: pack.vehicleRules,
        tier1Items: pack.tier1Items,
        faultTypes: pack.faultTypes,
        conditionalRules: pack.conditionalRules,
        namingRules: pack.namingRules,
        changelog: pack.changelog,
      });
      setIsDirty(false);
      alert('Draft saved successfully.');
    } catch (err) {
      alert((err as Error).message || 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      // First save current draft state
      await updateBrandPack(pack.id || pack._id!, pack);
      setIsDirty(false);
      const res = await validateBrandPack(pack.id || pack._id!);
      setValidationResult(res);
    } catch (err) {
      alert((err as Error).message || 'Validation failed.');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishBrandPack(pack.id || pack._id!, { changelog: pack.changelog });
      setIsDirty(false);
      setPublishModalOpen(false);
      router.push(`/brand-packs/${pack.id || pack._id}`);
    } catch (err) {
      alert((err as Error).message || 'Failed to publish.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Add Evidence Item
  const handleAddTier1Item = () => {
    const newItem: EvidenceRule = {
      key: `NEW_ITEM_${Date.now().toString().slice(-4)}`,
      title: 'New Evidence Item',
      description: '',
      required: true,
      mediaType: 'IMAGE',
      minimumCount: 1,
      maximumCount: 2,
      instructions: '',
      order: (pack.tier1Items?.length || 0) + 1,
    };
    setPack({ ...pack, tier1Items: [...(pack.tier1Items || []), newItem] });
    markDirty();
  };

  const handleRemoveTier1Item = (index: number) => {
    const updated = [...(pack.tier1Items || [])];
    updated.splice(index, 1);
    setPack({ ...pack, tier1Items: updated });
    markDirty();
  };

  // Add Fault Type
  const handleAddFaultType = () => {
    const newFault: FaultType = {
      key: `FAULT_${Date.now().toString().slice(-4)}`,
      name: 'New Defect Category',
      description: '',
      tier: 'TIER_2',
      active: true,
      order: (pack.faultTypes?.length || 0) + 1,
      tier2Items: [],
    };
    setPack({ ...pack, faultTypes: [...(pack.faultTypes || []), newFault] });
    markDirty();
  };

  const handleRemoveFaultType = (index: number) => {
    const updated = [...(pack.faultTypes || [])];
    updated.splice(index, 1);
    setPack({ ...pack, faultTypes: updated });
    markDirty();
  };

  const handleAddTier2Item = (faultIndex: number) => {
    const updatedFaults = [...(pack.faultTypes || [])];
    const targetFault = updatedFaults[faultIndex];
    if (!targetFault) return;

    const newT2: EvidenceRule = {
      key: `${targetFault.key}_T2_${Date.now().toString().slice(-3)}`,
      title: 'Tier 2 Inspection Photo',
      description: '',
      required: true,
      mediaType: 'IMAGE',
      minimumCount: 1,
      maximumCount: 2,
      instructions: '',
      order: (targetFault.tier2Items?.length || 0) + 1,
    };

    targetFault.tier2Items = [...(targetFault.tier2Items || []), newT2];
    setPack({ ...pack, faultTypes: updatedFaults });
    markDirty();
  };

  const handleRemoveTier2Item = (faultIndex: number, t2Index: number) => {
    const updatedFaults = [...(pack.faultTypes || [])];
    updatedFaults[faultIndex]?.tier2Items?.splice(t2Index, 1);
    setPack({ ...pack, faultTypes: updatedFaults });
    markDirty();
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Scope' },
    { id: 'vehicle', label: 'Vehicle Rules' },
    { id: 'tier1', label: `Tier 1 Baseline (${pack.tier1Items?.length || 0})` },
    { id: 'faults', label: `Fault Types (${pack.faultTypes?.length || 0})` },
    { id: 'conditionals', label: `Conditionals (${pack.conditionalRules?.length || 0})` },
    { id: 'naming', label: `Naming Templates (${pack.namingRules?.length || 0})` },
    { id: 'review', label: 'Review & Publish' },
  ];

  const handleSafeNavigation = (url: string) => {
    if (isDirty) {
      setPendingNavigation(url);
      setLeaveConfirmOpen(true);
    } else {
      router.push(url);
    }
  };

  return (
    <ProtectedRoute requiredPermission="brand_packs.update">
      <AppShell>
        <PageHeader
          title={`Edit Brand Pack • ${pack.brandCode} ${pack.version}`}
          description="Configure evidence capture schema, fault categories, conditional triggers, and naming rules"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Brand Packs', href: '/brand-packs' },
            { label: `${pack.brandCode} ${pack.version}`, href: `/brand-packs/${pack.id || pack._id}` },
            { label: 'Edit Draft' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSafeNavigation(`/brand-packs/${pack.id || pack._id}`)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleSaveDraft}
                isLoading={isSaving}
                disabled={!isDirty}
              >
                Save Draft Changes
              </Button>
              <Button
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setActiveTab('review');
                  handleValidate();
                }}
              >
                Review & Publish →
              </Button>
            </div>
          }
        />

        {isDirty && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center justify-between">
            <span>⚠️ You have unsaved changes in this draft version.</span>
            <Button size="sm" variant="secondary" onClick={handleSaveDraft} isLoading={isSaving}>
              Save Now
            </Button>
          </div>
        )}

        <div className="mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Pack Metadata & Scope</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Brand Code"
                value={pack.brandCode}
                disabled
              />
              <Input
                label="Version Identifier"
                value={pack.version}
                disabled
              />
            </div>
            <Input
              label="Pack Description"
              value={pack.description}
              onChange={(e) => {
                setPack({ ...pack, description: e.target.value });
                markDirty();
              }}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applicable Dealership Sites (Comma separated, empty for all sites)
              </label>
              <input
                type="text"
                value={pack.applicableSites?.join(', ') || ''}
                onChange={(e) => {
                  const sites = e.target.value
                    .split(',')
                    .map((s) => s.trim().toUpperCase())
                    .filter(Boolean);
                  setPack({ ...pack, applicableSites: sites });
                  markDirty();
                }}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. CRANBOURNE, MELBOURNE, DANDENONG"
              />
            </div>
            <Input
              label="Changelog Note"
              value={pack.changelog || ''}
              onChange={(e) => {
                setPack({ ...pack, changelog: e.target.value });
                markDirty();
              }}
              placeholder="e.g. Updated charging port pin photo requirements"
            />
          </Card>
        )}

        {/* TAB 2: VEHICLE RULES */}
        {activeTab === 'vehicle' && (
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Vehicle Identification Configuration</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <label className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pack.vehicleRules.vinRequired}
                  onChange={(e) => {
                    setPack({
                      ...pack,
                      vehicleRules: { ...pack.vehicleRules, vinRequired: e.target.checked },
                    });
                    markDirty();
                  }}
                  className="rounded text-blue-600"
                />
                <div>
                  <span className="font-bold block">Require 17-Char VIN</span>
                  <span className="text-slate-500 text-[11px]">Validates against ISO format</span>
                </div>
              </label>

              <label className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pack.vehicleRules.vinOcrEnabled}
                  onChange={(e) => {
                    setPack({
                      ...pack,
                      vehicleRules: { ...pack.vehicleRules, vinOcrEnabled: e.target.checked },
                    });
                    markDirty();
                  }}
                  className="rounded text-blue-600"
                />
                <div>
                  <span className="font-bold block">Enable Camera OCR</span>
                  <span className="text-slate-500 text-[11px]">Mobile app scans barcode/plate</span>
                </div>
              </label>

              <label className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pack.vehicleRules.odometerRequired}
                  onChange={(e) => {
                    setPack({
                      ...pack,
                      vehicleRules: { ...pack.vehicleRules, odometerRequired: e.target.checked },
                    });
                    markDirty();
                  }}
                  className="rounded text-blue-600"
                />
                <div>
                  <span className="font-bold block">Require Odometer Photo</span>
                  <span className="text-slate-500 text-[11px]">Verified cluster mileage</span>
                </div>
              </label>

              <label className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pack.vehicleRules.frontPhotoRequired}
                  onChange={(e) => {
                    setPack({
                      ...pack,
                      vehicleRules: { ...pack.vehicleRules, frontPhotoRequired: e.target.checked },
                    });
                    markDirty();
                  }}
                  className="rounded text-blue-600"
                />
                <div>
                  <span className="font-bold block">Require Front of Vehicle</span>
                  <span className="text-slate-500 text-[11px]">Audit rego plate confirmation</span>
                </div>
              </label>
            </div>
          </Card>
        )}

        {/* TAB 3: TIER 1 EVIDENCE */}
        {activeTab === 'tier1' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Baseline Tier 1 Evidence Items</h3>
              <Button size="sm" variant="primary" onClick={handleAddTier1Item}>
                + Add Evidence Item
              </Button>
            </div>

            <div className="space-y-3">
              {pack.tier1Items?.map((item, idx) => (
                <Card key={idx} className="p-4 space-y-3 border-l-4 border-l-blue-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Item #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTier1Item(idx)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Remove Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Key (Uppercase)"
                      value={item.key}
                      onChange={(e) => {
                        const updated = [...pack.tier1Items];
                        updated[idx].key = e.target.value.toUpperCase().trim();
                        setPack({ ...pack, tier1Items: updated });
                        markDirty();
                      }}
                      required
                    />
                    <Input
                      label="Title"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...pack.tier1Items];
                        updated[idx].title = e.target.value;
                        setPack({ ...pack, tier1Items: updated });
                        markDirty();
                      }}
                      required
                    />
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Media Type</label>
                      <select
                        value={item.mediaType}
                        onChange={(e) => {
                          const updated = [...pack.tier1Items];
                          updated[idx].mediaType = e.target.value as MediaType;
                          setPack({ ...pack, tier1Items: updated });
                          markDirty();
                        }}
                        className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white"
                      >
                        <option value="IMAGE">IMAGE</option>
                        <option value="VIDEO">VIDEO</option>
                        <option value="PDF">PDF</option>
                        <option value="AUDIO">AUDIO</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Min Count"
                      type="number"
                      value={item.minimumCount}
                      onChange={(e) => {
                        const updated = [...pack.tier1Items];
                        updated[idx].minimumCount = parseInt(e.target.value, 10) || 1;
                        setPack({ ...pack, tier1Items: updated });
                        markDirty();
                      }}
                    />
                    <Input
                      label="Max Count"
                      type="number"
                      value={item.maximumCount}
                      onChange={(e) => {
                        const updated = [...pack.tier1Items];
                        updated[idx].maximumCount = parseInt(e.target.value, 10) || 1;
                        setPack({ ...pack, tier1Items: updated });
                        markDirty();
                      }}
                    />
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.required}
                          onChange={(e) => {
                            const updated = [...pack.tier1Items];
                            updated[idx].required = e.target.checked;
                            setPack({ ...pack, tier1Items: updated });
                            markDirty();
                          }}
                          className="rounded text-blue-600"
                        />
                        <span>Mandatory for claim</span>
                      </label>
                    </div>
                  </div>

                  <Input
                    label="Technician Instructions"
                    value={item.instructions}
                    onChange={(e) => {
                      const updated = [...pack.tier1Items];
                      updated[idx].instructions = e.target.value;
                      setPack({ ...pack, tier1Items: updated });
                      markDirty();
                    }}
                    placeholder="e.g. Ensure all 17 characters are sharp and glare-free"
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FAULT TYPES & TIER 2 */}
        {activeTab === 'faults' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Configured Fault Categories & Tier 2 Rules</h3>
              <Button size="sm" variant="primary" onClick={handleAddFaultType}>
                + Add Fault Category
              </Button>
            </div>

            <div className="space-y-4">
              {pack.faultTypes?.map((ft, fIdx) => (
                <Card key={fIdx} className="p-4 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold text-indigo-700">Category #{fIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaultType(fIdx)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Delete Category
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Key (Uppercase)"
                      value={ft.key}
                      onChange={(e) => {
                        const updated = [...pack.faultTypes];
                        updated[fIdx].key = e.target.value.toUpperCase().trim();
                        setPack({ ...pack, faultTypes: updated });
                        markDirty();
                      }}
                      required
                    />
                    <Input
                      label="Fault Category Display Name"
                      value={ft.name}
                      onChange={(e) => {
                        const updated = [...pack.faultTypes];
                        updated[fIdx].name = e.target.value;
                        setPack({ ...pack, faultTypes: updated });
                        markDirty();
                      }}
                      required
                    />
                  </div>

                  {/* Tier 2 Items List for this fault */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">
                        Tier 2 Evidence Requirements ({ft.tier2Items?.length || 0})
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleAddTier2Item(fIdx)}>
                        + Add Tier 2 Item
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {ft.tier2Items?.map((t2, t2Idx) => (
                        <div key={t2Idx} className="p-3 bg-slate-50 border rounded-lg grid grid-cols-3 gap-2 items-center text-xs">
                          <Input
                            label="Key"
                            value={t2.key}
                            onChange={(e) => {
                              const updated = [...pack.faultTypes];
                              updated[fIdx].tier2Items![t2Idx].key = e.target.value.toUpperCase();
                              setPack({ ...pack, faultTypes: updated });
                              markDirty();
                            }}
                          />
                          <Input
                            label="Title"
                            value={t2.title}
                            onChange={(e) => {
                              const updated = [...pack.faultTypes];
                              updated[fIdx].tier2Items![t2Idx].title = e.target.value;
                              setPack({ ...pack, faultTypes: updated });
                              markDirty();
                            }}
                          />
                          <div className="flex items-center justify-end gap-2 pt-4">
                            <button
                              type="button"
                              onClick={() => handleRemoveTier2Item(fIdx, t2Idx)}
                              className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CONDITIONALS */}
        {activeTab === 'conditionals' && (
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Conditional Rule Triggers</h3>
            <p className="text-xs text-slate-500">
              When technician toggles or triggers a capture modifier, the required evidence rules are dynamically enforced.
            </p>

            <div className="space-y-3">
              {pack.conditionalRules?.map((cr, cIdx) => (
                <div key={cr.id || cIdx} className="p-3 border rounded-lg text-xs space-y-2">
                  <div className="font-bold text-slate-800 flex justify-between">
                    <span>{cr.name}</span>
                    <span className="font-mono text-indigo-600">
                      IF {cr.condition?.field} {cr.condition?.operator} {JSON.stringify(cr.condition?.value)}
                    </span>
                  </div>
                  <div className="text-slate-600 flex gap-2">
                    <span>Actions:</span>
                    {cr.actions?.map((a, i) => (
                      <span key={i} className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                        REQUIRE {a.evidenceKey}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 6: NAMING RULES */}
        {activeTab === 'naming' && (
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 mb-2">OEM File Naming Templates</h3>
            <div className="space-y-2">
              {pack.namingRules?.map((nr, nIdx) => (
                <div key={nr.evidenceKey || nIdx} className="grid grid-cols-3 gap-3 p-2.5 bg-slate-50 border rounded-lg text-xs items-center">
                  <Input
                    label="Evidence Key"
                    value={nr.evidenceKey}
                    onChange={(e) => {
                      const updated = [...pack.namingRules];
                      updated[nIdx].evidenceKey = e.target.value.toUpperCase();
                      setPack({ ...pack, namingRules: updated });
                      markDirty();
                    }}
                  />
                  <Input
                    label="Naming Template Pattern"
                    value={nr.template}
                    onChange={(e) => {
                      const updated = [...pack.namingRules];
                      updated[nIdx].template = e.target.value;
                      setPack({ ...pack, namingRules: updated });
                      markDirty();
                    }}
                  />
                  <Input
                    label="Descriptor"
                    value={nr.descriptor}
                    onChange={(e) => {
                      const updated = [...pack.namingRules];
                      updated[nIdx].descriptor = e.target.value;
                      setPack({ ...pack, namingRules: updated });
                      markDirty();
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 7: REVIEW & PUBLISH */}
        {activeTab === 'review' && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ready to Publish</h3>
              <p className="text-xs text-slate-500 mt-1">
                Run structural consistency checks and confirm the new warranty configuration version.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">1. Integrity Validation Check:</span>
                <Button size="sm" variant="outline" onClick={handleValidate} isLoading={isValidating}>
                  Run Validation
                </Button>
              </div>

              {validationResult ? (
                <div className={`p-3 rounded-lg text-xs ${validationResult.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {validationResult.valid ? (
                    <p className="font-bold">✓ All {pack.tier1Items.length} evidence rules, {pack.faultTypes.length} fault types, and naming templates passed verification.</p>
                  ) : (
                    <div>
                      <p className="font-bold">✕ Cannot publish. The following errors must be fixed:</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {validationResult.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Click &quot;Run Validation&quot; to verify structural rules before publishing.</p>
              )}
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-2">
              <span className="font-bold text-emerald-900 block">2. Publish Warranty Version:</span>
              <p className="text-emerald-800">
                Publishing locks this draft into an immutable <strong>PUBLISHED</strong> configuration. It immediately enforces these capture rules on the technician app and web portal review queue.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setPublishModalOpen(true)}
                  disabled={validationResult ? !validationResult.valid : false}
                >
                  Confirm & Publish Version {pack.version}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* UNSAVED CHANGES MODAL */}
        <Modal
          isOpen={leaveConfirmOpen}
          onClose={() => setLeaveConfirmOpen(false)}
          title="Unsaved Changes"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <p>You have unsaved changes in this Brand Pack draft. If you leave without saving, your modifications will be lost.</p>
            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setLeaveConfirmOpen(false)}>
                Stay on Page
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setLeaveConfirmOpen(false);
                  setIsDirty(false);
                  if (pendingNavigation) router.push(pendingNavigation);
                }}
              >
                Leave Without Saving
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
          <div className="space-y-4 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">
              Are you sure you want to publish <strong>{pack.brandCode} {pack.version}</strong>?
            </p>
            <p className="text-slate-600">
              Once published, this pack cannot be edited directly (it must be cloned to create a new draft). In-flight cases will preserve this version indefinitely for audit compliance.
            </p>
            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setPublishModalOpen(false)}>
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
