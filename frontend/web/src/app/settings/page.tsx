'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function SettingsPage() {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [pageSize, setPageSize] = useState('10');
  const [slaHours, setSlaHours] = useState('8');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const tabs: TabItem[] = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'preferences', label: 'System Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security & RBAC', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <ProtectedRoute requiredPermission="settings.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="System Settings"
            description="Portal preferences, administrator profile, RBAC architecture, and notification settings."
            breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Settings' }]}
          />

          {savedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <span>✓ Settings updated successfully.</span>
            </div>
          )}

          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <Card title="Administrator Profile" description="Your authenticated credentials">
                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-slate-500">{user?.email}</p>
                      <div className="mt-1">
                        <StatusBadge status={role || 'ADMIN'} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                      <input
                        type="text"
                        defaultValue={user?.firstName}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        defaultValue={user?.lastName}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      defaultValue={user?.email}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Email address changes must be requested through Supabase Auth authentication administration.
                    </p>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <Button variant="primary" size="sm" type="submit">
                      Save Profile
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* Tab 2: Preferences */}
          {activeTab === 'preferences' && (
            <div className="max-w-2xl space-y-6">
              <Card title="Portal & Operational Preferences" description="Configure table defaults and SLA targets">
                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Default Pagination Size
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                    >
                      <option value="10">10 records per page</option>
                      <option value="25">25 records per page</option>
                      <option value="50">50 records per page</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Review Turnaround SLA Threshold (Hours)
                    </label>
                    <input
                      type="number"
                      value={slaHours}
                      onChange={(e) => setSlaHours(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Claims exceeding this time in the review queue will trigger overdue indicators on the Operations dashboard.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Currency Standard
                    </label>
                    <input
                      type="text"
                      disabled
                      value="AUD ($ - Australian Dollar)"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <Button variant="primary" size="sm" type="submit">
                      Save Preferences
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* Tab 3: Security & RBAC */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card title="Role-Based Access Control Architecture" description="Current security boundary model">
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 leading-relaxed space-y-1">
                    <p className="font-bold">🛡️ Two-Role Strict RBAC Model</p>
                    <p>
                      The system strictly enforces two distinct roles: <strong>ADMIN</strong> and <strong>OPERATIONS</strong>. Field users and third-party inspectors interface via targeted mobile and technician workflows.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">ADMIN Role</span>
                        <StatusBadge status="ADMIN" />
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Full administrative governance over users, policy configurations, global audit trails, underwriting settings, and executive reporting.
                      </p>
                      <p className="font-semibold text-slate-700 pt-1">27 Assigned Permissions</p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">OPERATIONS Role</span>
                        <StatusBadge status="OPERATIONS" />
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Operational claim intake, evidence capture, quality inspection, technician task dispatch, and initial verification queue.
                      </p>
                      <p className="font-semibold text-slate-700 pt-1">16 Assigned Permissions</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Supabase Auth Handshake" description="Session security and token verification">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Identity Provider</span>
                    <span className="font-semibold text-slate-800">Supabase Auth (Cloud Project zwzebvcrabnrslzlxrcz)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Database Layer</span>
                    <span className="font-semibold text-slate-800">MongoDB Atlas (Mongoose Cluster0)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">JWT Token Expiration</span>
                    <span className="font-semibold text-slate-800">3600 seconds (Auto-refreshed by Supabase client)</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Tab 4: Notifications */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl space-y-6">
              <Card title="Email & System Notifications" description="Configure when portal alerts are dispatched">
                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-800">New Claim Lodged Alerts</p>
                      <p className="text-[11px] text-slate-400">Receive notification when a dealership submits a high-priority defect claim.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-800">Evidence Review Queue Notifications</p>
                      <p className="text-[11px] text-slate-400">Receive alert when technical evidence is uploaded for verification.</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <Button variant="primary" size="sm" type="submit">
                      Save Notification Rules
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
