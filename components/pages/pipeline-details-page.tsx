'use client';

import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { dataService } from '@/lib/data-service-v2';

const FIELDS_19 = [
  'cpo_id', 'quote_number', 'part_no', 'sales_territory', 'team', 'vendor_name',
  'master_customer_name', 'cpo_customer', 'end_user_company', 'quote_stage',
  'quote_name', 'cif_value_usd', 'probability_percentage', 'projected_close_date',
  'cpo_entry_datetime', 'available_credit', 'available_credit_usd', 'is_budgetary', 'notes'
];

export default function PipelineDetailsPage() {
  const { filteredQuotes } = useAppContext();
  const [sortField, setSortField] = useState('cpo_id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = [...filteredQuotes].sort((a, b) => {
    const aVal = a[sortField as keyof typeof a] || '';
    const bVal = b[sortField as keyof typeof b] || '';
    return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const handleExport = (format: 'csv' | 'excel') => {
    const csv = dataService.exportToCSV(filteredQuotes);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-details.${format === 'csv' ? 'csv' : 'xlsx'}`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline Details</h1>
            <p className="text-gray-600 mt-1">Visualização analítica linha a linha com 19 campos</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleExport('csv')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Export CSV
            </button>
            <button onClick={() => handleExport('excel')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              Export Excel
            </button>
          </div>
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                {FIELDS_19.map(field => (
                  <th
                    key={field}
                    onClick={() => {
                      setSortField(field);
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    }}
                    className="px-4 py-3 text-left font-bold text-gray-700 cursor-pointer hover:bg-gray-200"
                  >
                    {field} {sortField === field && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((quote, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-blue-600">{quote.cpo_id}</td>
                  <td className="px-4 py-3">{quote.quote_number}</td>
                  <td className="px-4 py-3">{quote.part_no}</td>
                  <td className="px-4 py-3">{quote.sales_territory}</td>
                  <td className="px-4 py-3">{quote.team}</td>
                  <td className="px-4 py-3 font-medium">{quote.vendor_name}</td>
                  <td className="px-4 py-3">{quote.master_customer_name}</td>
                  <td className="px-4 py-3">{quote.cpo_customer}</td>
                  <td className="px-4 py-3">{quote.end_user_company}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{quote.quote_stage}</span></td>
                  <td className="px-4 py-3 truncate" title={quote.quote_name}>{quote.quote_name}</td>
                  <td className="px-4 py-3 text-right font-medium">${(quote.cif_value_usd / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3 text-center">{quote.probability_percentage}%</td>
                  <td className="px-4 py-3">{quote.projected_close_date}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(quote.cpo_entry_datetime).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{quote.available_credit.toLocaleString()}</td>
                  <td className="px-4 py-3">${(quote.available_credit_usd / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3">{quote.is_budgetary ? <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Yes</span> : 'No'}</td>
                  <td className="px-4 py-3 truncate text-xs text-gray-600" title={quote.notes}>{quote.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="mt-4 text-sm text-gray-600">
          Total de {filteredQuotes.length} cotações | USD Total: ${(filteredQuotes.reduce((sum, q) => sum + q.cif_value_usd, 0) / 1000).toFixed(0)}K
        </div>
      </main>
    </div>
  );
}
