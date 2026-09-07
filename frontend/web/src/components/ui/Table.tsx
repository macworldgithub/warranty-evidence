import React from 'react';

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No records found',
  className = '',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-500 bg-white rounded-lg border border-slate-200">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-slate-200 bg-white ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3 px-4 font-semibold text-xs text-slate-600 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item, rowIdx) => (
            <tr key={keyExtractor(item, rowIdx)} className="hover:bg-slate-50/50 transition-colors">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`py-3.5 px-4 text-slate-700 ${col.className || ''}`}>
                  {col.render
                    ? col.render(item)
                    : col.accessor
                    ? String(item[col.accessor] ?? '')
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
