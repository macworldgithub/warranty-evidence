import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  badgeText?: string;
  badgeVariant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'amber' | 'slate';
  subtext?: string;
}

export function StatCard({
  label,
  value,
  icon,
  change,
  trend,
  badgeText,
  badgeVariant = 'blue',
  subtext,
}: StatCardProps) {
  return (
    <Card className="p-4 transition-all duration-150 hover:shadow-md hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-2xl select-none">{icon || '📊'}</span>
        {badgeText && (
          <Badge variant={badgeVariant} size="sm">
            {badgeText}
          </Badge>
        )}
      </div>

      <div className="mt-3">
        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
      </div>

      {(change || subtext) && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px]">
          {change && (
            <span
              className={`font-medium ${
                trend === 'up'
                  ? 'text-emerald-600'
                  : trend === 'down'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {change}
            </span>
          )}
          {subtext && <span className="text-slate-400">{subtext}</span>}
        </div>
      )}
    </Card>
  );
}
