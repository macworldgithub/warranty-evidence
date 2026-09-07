'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@booran.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      await login({ email: email.trim(), password });
      router.push('/dashboard');
    } catch (err) {
      setErrorMessage((err as Error).message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Password123!');
    setErrorMessage(null);
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
          Supabase Authentication • Unified RBAC Web Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-white/20">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@booran.com"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2 font-medium">Quick Credentials:</p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => fillCredentials('abdulahadnauman10@gmail.com')}
                className="p-2 rounded-lg border border-purple-200 bg-purple-50/50 text-slate-800 hover:bg-purple-50 cursor-pointer text-xs"
              >
                <span className="font-bold text-purple-700 block">Admin (Ahad)</span>
                <span className="text-[10px] text-slate-500 truncate block">abdulahadnauman10@gmail.com</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('abdulahad.operations@gmail.com')}
                className="p-2 rounded-lg border border-blue-200 bg-blue-50/50 text-slate-800 hover:bg-blue-50 cursor-pointer text-xs"
              >
                <span className="font-bold text-blue-700 block">Operations (Ahad)</span>
                <span className="text-[10px] text-slate-500 truncate block">abdulahad.operations@gmail.com</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin@booran.com')}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 hover:bg-slate-50 cursor-pointer text-xs"
              >
                <span className="font-bold text-slate-700 block">Admin (Demo)</span>
                <span className="text-[10px] text-slate-500 truncate block">admin@booran.com</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('ops@booran.com')}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 hover:bg-slate-50 cursor-pointer text-xs"
              >
                <span className="font-bold text-slate-700 block">Operations (Demo)</span>
                <span className="text-[10px] text-slate-500 truncate block">ops@booran.com</span>
              </button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          Booran Warranty Evidence Capture System • Phase 2 Auth
        </p>
      </div>
    </div>
  );
}
