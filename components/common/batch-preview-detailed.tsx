'use client';

interface BatchPreviewRow {
  cpoId: string;
  customer: string;
  field: string;
  before: string;
  after: string;
}

interface BatchPreviewDetailedProps {
  rows: BatchPreviewRow[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function BatchPreviewDetailed({ rows, onConfirm, onCancel }: BatchPreviewDetailedProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-96 flex flex-col">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Preview Batch Changes</h2>
          <p className="text-sm text-gray-600 mt-1">
            {rows.length} changes will be made to {new Set(rows.map(r => r.cpoId)).size} quotes
          </p>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">CPO ID</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Field</th>
                <th className="px-4 py-2 text-left">Before</th>
                <th className="px-4 py-2 text-left">After</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b hover:bg-yellow-50">
                  <td className="px-4 py-2 font-medium text-blue-600">{row.cpoId}</td>
                  <td className="px-4 py-2 text-gray-600">{row.customer}</td>
                  <td className="px-4 py-2 font-medium">{row.field}</td>
                  <td className="px-4 py-2 text-gray-500 line-through">{row.before}</td>
                  <td className="px-4 py-2 text-green-600 font-medium">{row.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Confirm & Process
          </button>
        </div>
      </div>
    </div>
  );
}
