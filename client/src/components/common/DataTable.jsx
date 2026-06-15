import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

export function DataTable({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load records.',
  onRetry,
  emptyTitle = 'No Records Found',
  emptyMessage = 'No matching data matches your query.',
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange
}) {
  if (isLoading) {
    return <LoadingSpinner text="Fetching data records..." />;
  }

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const showPagination = onPageChange && totalPages > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-800 font-bold uppercase text-xs tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className="px-6 py-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/50 transition duration-150">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 px-2">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-bold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
            <span className="font-bold">{totalItems}</span> entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-slate-200 text-xs font-semibold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition"
            >
              Previous
            </button>
            <span className="px-3 text-xs text-slate-500 font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded border border-slate-200 text-xs font-semibold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
