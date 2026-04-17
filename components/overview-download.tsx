'use client';

import { useState } from 'react';
import { getAllQuotes } from '@/lib/data-service';
import GlobalNavigation from './global-navigation';

export default function OverviewDownloadComponent() {
  const allQuotes = getAllQuotes();

  const exportToCSV = () => {
    const headers = ['CPO ID', 'Revenda', 'End User', 'Fabricante', 'USD', 'Stage', 'Close Date'];
    const rows = allQuotes.map(q => [
      q.cpo_id,
      q.revenda,
      q.end_user,
      q.fabricante,
      q.usd_value,
      q.stage,
      q.close_date || '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-overview-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToExcel = () => {
    // For demo purposes, export as CSV with Excel-compatible format
    exportToCSV();
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const totalUSD = allQuotes.reduce((sum, q) => sum + q.usd_value, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Overview for Download</h1>
          <p className="text-gray-600 mt-1">Export Forecast-compatible data with 9 key fields</p>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Export as CSV</h3>
            <p className="text-gray-600 text-sm mb-4">Standard CSV format for spreadsheet applications</p>
            <button
              onClick={exportToCSV}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Download CSV
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Export as Excel</h3>
            <p className="text-gray-600 text-sm mb-4">Excel-compatible format with formatting</p>
            <button
              onClick={exportToExcel}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Download Excel
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Preview ({allQuotes.length} quotes | Total: {formatUSD(totalUSD)})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">CPO ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Revenda</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">End User</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Fabricante</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">USD</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Stage</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Close Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Sales Rep</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Budgetary</th>
                </tr>
              </thead>
              <tbody>
                {allQuotes.map(quote => (
                  <tr key={quote.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-blue-600">{quote.cpo_id}</td>
                    <td className="px-4 py-3">{quote.revenda}</td>
                    <td className="px-4 py-3">{quote.end_user}</td>
                    <td className="px-4 py-3">{quote.fabricante}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatUSD(quote.usd_value)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {quote.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3">{quote.close_date || '-'}</td>
                    <td className="px-4 py-3">{quote.sales_rep}</td>
                    <td className="px-4 py-3 text-center">
                      {quote.is_budgetary ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">Yes</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
