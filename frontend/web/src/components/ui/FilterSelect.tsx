import React from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className = '',
}: FilterSelectProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {label && <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{label}:</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
