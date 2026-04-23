import { useMemo, useState } from 'react';

const DataTable = ({ columns, rows, rowKey = 'id', emptyMessage = 'No data available.' }) => {
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) {
      return rows;
    }

    const sorted = [...rows].sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      if (valueA === valueB) return 0;
      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      return sortConfig.direction === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    return sorted;
  }, [rows, sortConfig]);

  const handleSort = (column) => {
    if (!column.sortable) return;
    setSortConfig((current) => {
      if (current.key === column.key) {
        return { key: column.key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: column.key, direction: 'asc' };
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    disabled={!column.sortable}
                    className="inline-flex items-center gap-2 disabled:cursor-default"
                    onClick={() => handleSort(column)}
                  >
                    {column.label}
                    {sortConfig.key === column.key ? (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedRows.map((row, index) => (
                <tr key={row[rowKey] || index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {column.render ? column.render(row) : row[column.key]}
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
