'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import type { UserRole } from '../../types/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@booran.com');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [loading, setLoading] = useState(false);

  const roles: { role: UserRole; title: string; desc: string; badge: 'purple' | 'blue' }[] = [
    {
      role: 'ADMIN',
      title: 'Administrator',
      desc: 'Full system management, audit logs, user provisioning & global settings',
      badge: 'purple',
    },
    {
      role: 'OPERATIONS',
      title: 'Operations Team',
      desc: 'Manage warranties, dispatch tasks, process claims & manage evidence',
      badge: 'blue',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password, role: selectedRole });
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setLoading(true);
    try {
      await login({ email: `${role.toLowerCase()}@booran.com`, role });
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 text-white font-bold text-2xl mb-4">
          B
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Booran Warranty System
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Unified RBAC Web Portal • Single Sign-On
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-white/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Select Persona (Role-Based Access)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {roles.map((item) => (
                  <button
                    type="button"
                    key={item.role}
                    onClick={() => {
                      setSelectedRole(item.role);
                      setEmail(`${item.role.toLowerCase()}@booran.com`);
                    }}
                    className={`
                      p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between
                      ${
                        selectedRole === item.role
                          ? 'border-primary bg-blue-50/70 ring-2 ring-primary/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <Badge variant={item.badge} size="sm">
                        {item.role}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Sign In as {selectedRole}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-3 font-medium">Quick 1-Click Persona Login:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {roles.map((r) => (
                <Button
                  key={r.role}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin(r.role)}
                  className="text-xs"
                >
                  Log in as {r.role}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          Booran Warranty Evidence Capture System • Phase 1
        </p>
      </div>
    </div>
  );
}
