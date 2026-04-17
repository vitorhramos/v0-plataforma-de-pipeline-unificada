'use client';

import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { dataService } from '@/lib/data-service-v2';
import { AlertBadge } from '@/components/common/alert-badges';
import { SmartPagination } from '@/components/common/smart-pagination';
import { useExport } from '@/hooks/useExport';

const FIELDS_19 = [
  'cpo_id', 'quote_number', 'part_no', 'sales_territory', 'team', 'vendor_name',
  'master_customer_name', 'cpo_customer', 'end_user_company', 'quote_stage',
  'quote_name', 'cif_value_usd', 'probability_percentage', 'projected_close_date',
  'cpo_entry_datetime', 'available_credit', 'available_credit_usd', 'is_budgetary', 'notes'
];

export default function PipelineDetailsPage() {
  const { filteredQuotes, dataCompactMode } = useAppContext();
  const { exportToCSV, exportToExcel } = useExport();
  const [sortField, setSortField] = useState('cpo_id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const sorted = [...filteredQuotes].sort((a, b) => {
    const aVal = a[sortField as keyof typeof a] || '';
    const bVal = b[sortField as keyof typeof b] || '';
    return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const start = (currentPage - 1) * pageSize;
  const paginatedQuotes = sorted.slice(start, start + pageSize);

  const handleExport = (format: 'csv' | 'excel') => {
    if (format === 'csv') {
      exportToCSV(filteredQuotes, 'pipeline-details.csv');
    } else {
      exportToExcel(filteredQuotes, 'pipeline-details.xlsx');
    }
  };

  const getAlertType = (quote: any) => {
    const daysToClose = Math.ceil((new Date(quote.projected_close_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysToClose <= 3) return 'critical';
    if (daysToClose <= 7) return 'expires';
    if (quote.quote_stage === 'Pipelined') return 'new';
    if (quote.quote_stage === 'Net Lost') return 'lost';
    return null;
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${dataCompactMode ? 'space-y-4' : 'space-y-8'}`}>
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline Details</h1>
            <p className="text-gray-600 mt-1">Visualização analítica linha a linha com 19 campos e trending</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleExport('csv')} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              Export CSV
            </button>
            <button 
              onClick={() => handleExport('excel')} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all transform hover:scale-105"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-l-blue-600">
            <p className="text-gray-600 text-sm">Total Quotes</p>
            <p className="text-2xl font-bold text-blue-900">{filteredQuotes.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-green-600">
            <p className="text-gray-600 text-sm">Total USD</p>
            <p className="text-2xl font-bold text-green-900">${(filteredQuotes.reduce((sum, q) => sum + q.cif_value_usd, 0) / 1000000).toFixed(1)}M</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-l-purple-600">
            <p className="text-gray-600 text-sm">Avg Probability</p>
            <p className="text-2xl font-bold text-purple-900">{Math.round(filteredQuotes.reduce((sum, q) => sum + q.probability_percentage, 0) / filteredQuotes.length)}%</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-l-orange-600">
            <p className="text-gray-600 text-sm">Expiring Soon</p>
            <p className="text-2xl font-bold text-orange-900">
              {filteredQuotes.filter(q => {
                const daysToClose = Math.ceil((new Date(q.projected_close_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysToClose <= 7 && daysToClose > 0;
              }).length}
            </p>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-x-auto shadow-lg hover:shadow-xl transition-shadow">
          <table className={`w-full ${dataCompactMode ? 'text-xs' : 'text-sm'}`}>
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b">
              <tr>
                {FIELDS_19.map(field => (
                  <th
                    key={field}
                    onClick={() => {
                      setSortField(field);
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    }}
                    className="px-4 py-3 text-left font-bold text-gray-700 cursor-pointer hover:bg-gray-300 transition-colors whitespace-nowrap"
                  >
                    {field} {sortField === field && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-bold text-gray-700">Alert</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Updated</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuotes.map((quote, idx) => {
                const alertType = getAlertType(quote);
                return (
                  <tr key={idx} className="border-b hover:bg-blue-50 transition-colors animate-fadeIn">
                    <td className="px-4 py-3 font-mono text-blue-600 font-semibold">{quote.cpo_id}</td>
                    <td className="px-4 py-3">{quote.quote_number}</td>
                    <td className="px-4 py-3">{quote.part_no}</td>
                    <td className="px-4 py-3">{quote.sales_territory}</td>
                    <td className="px-4 py-3">{quote.team}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{quote.vendor_name}</td>
                    <td className="px-4 py-3 truncate" title={quote.master_customer_name}>{quote.master_customer_name}</td>
                    <td className="px-4 py-3">{quote.cpo_customer}</td>
                    <td className="px-4 py-3">{quote.end_user_company}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">{quote.quote_stage}</span>
                    </td>
                    <td className="px-4 py-3 truncate max-w-xs" title={quote.quote_name}>{quote.quote_name}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">${(quote.cif_value_usd / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-center font-semibold">{quote.probability_percentage}%</td>
                    <td className="px-4 py-3 font-medium">{quote.projected_close_date}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(quote.cpo_entry_datetime).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">{quote.available_credit.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold">${(quote.available_credit_usd / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3">
                      {quote.is_budgetary ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 truncate text-xs text-gray-600 max-w-xs" title={quote.notes}>{quote.notes}</td>
                    <td className="px-4 py-3 flex gap-1">
                      {alertType && <AlertBadge type={alertType as any} label="" />}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{timeAgo(quote.cpo_entry_datetime)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {start + 1}-{Math.min(start + pageSize, filteredQuotes.length)} of {filteredQuotes.length} quotes
          </div>
          <SmartPagination
            total={filteredQuotes.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>
    </div>
  );
}

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
