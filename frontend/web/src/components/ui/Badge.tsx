import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'amber' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  blue: 'bg-badge-blue-bg text-badge-blue-text border border-blue-200/50',
  green: 'bg-badge-green-bg text-badge-green-text border border-green-200/50',
  yellow: 'bg-badge-yellow-bg text-badge-yellow-text border border-yellow-200/50',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200/50',
  red: 'bg-badge-red-bg text-badge-red-text border border-rose-200/50',
  purple: 'bg-badge-purple-bg text-badge-purple-text border border-purple-200/50',
  gray: 'bg-badge-gray-bg text-badge-gray-text border border-slate-200/50',
  slate: 'bg-slate-100 text-slate-700 border border-slate-200/50',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'blue',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
