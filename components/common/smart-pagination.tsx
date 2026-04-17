'use client';

interface SmartPaginationProps {
  current: number;
  total: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function SmartPagination({ current, total, itemsPerPage, onPageChange }: SmartPaginationProps) {
  const totalPages = Math.ceil(total / itemsPerPage);
  const start = (current - 1) * itemsPerPage + 1;
  const end = Math.min(current * itemsPerPage, total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(1, current - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing {start} to {end} of {total}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(current - 1)}
          disabled={current === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Prev
        </button>

        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm rounded transition ${
              page === current
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(current + 1)}
          disabled={current === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <select
        onChange={(e) => onPageChange(1)}
        className="px-2 py-1 text-sm border border-gray-300 rounded"
      >
        <option value="25">25 per page</option>
        <option value="50">50 per page</option>
        <option value="100">100 per page</option>
      </select>
    </div>
  );
}
