import { useMemo, useState } from 'react';

const DataTable = ({ columns, rows, rowKey = 'id', emptyText = 'No data found' }) => {
  const [sortBy, setSortBy] = useState('');
  const [direction, setDirection] = useState('asc');

  const sortedRows = useMemo(() => {
    if (!sortBy) {
      return rows;
    }

    const sorted = [...rows].sort((a, b) => {
      const left = a[sortBy];
      const right = b[sortBy];
      if (left === right) return 0;
      if (left === undefined || left === null) return 1;
      if (right === undefined || right === null) return -1;
      if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
      }
      return String(left).localeCompare(String(right));
    });

    return direction === 'asc' ? sorted : sorted.reverse();
  }, [rows, sortBy, direction]);

  const handleSort = (column) => {
    if (!column.sortable) {
      return;
    }

    if (sortBy === column.key) {
      setDirection((value) => (value === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column.key);
      setDirection('asc');
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleSort(column)}
                    className={`inline-flex items-center gap-1 ${column.sortable ? 'hover:text-brand' : ''}`}
                  >
                    {column.label}
                    {sortBy === column.key ? (direction === 'asc' ? '↑' : '↓') : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              sortedRows.map((row, index) => (
                <tr key={row[rowKey] || `${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-slate-700">
                      {column.render ? column.render(row, index) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
