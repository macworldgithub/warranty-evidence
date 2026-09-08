'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FolderOpen,
  Camera,
  FileCheck,
  CheckSquare,
  BarChart3,
  History,
  Settings,
  FileText,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFilteredNavigation } from '../../lib/navigation';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  users: Users,
  warranties: ShieldCheck,
  cases: FolderOpen,
  evidence: Camera,
  reviews: FileCheck,
  tasks: CheckSquare,
  reports: BarChart3,
  audit: History,
  settings: Settings,
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { permissions, role } = useAuth();

  const navItems = getFilteredNavigation(permissions);

  const roleBadgeVariant = (() => {
    switch (role) {
      case 'ADMIN': return 'purple' as const;
      case 'MANAGER': return 'amber' as const;
      case 'CLERK': return 'blue' as const;
      case 'ADVISOR': return 'green' as const;
      case 'TECHNICIAN': return 'slate' as const;
      default: return 'blue' as const;
    }
  })();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg flex flex-col
          transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20 text-white font-bold text-base">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">BOORAN</span>
              </div>
              <span className="block text-[10px] text-sidebar-text-muted uppercase tracking-wider">
                Warranty Platform
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 -mr-1 rounded-lg text-sidebar-text-muted hover:text-white hover:bg-white/5 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role Banner */}
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-medium text-sidebar-text-muted">Active Role</span>
          <Badge variant={roleBadgeVariant} size="sm">
            {role || 'GUEST'}
          </Badge>
        </div>

        {/* Dynamic Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = iconMap[item.icon] || FileText;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${isActive
                    ? 'bg-sidebar-active text-white shadow-lg shadow-blue-600/30'
                    : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                  }
                `}
              >
                <IconComponent className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="flex-1 truncate">{item.name}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Portal Meta Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white">RBAC Unified Web</p>
              <p className="text-[10px] text-sidebar-text-muted">Phase 1 Foundation</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
