'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

const mockQuotes = Array.from({ length: 543 }, (_, i) => ({
  id: i + 1,
  cpo_id: `CPO-${String(i + 1001).slice(-4)}`,
  quote_number: `QT-${String(i + 1001).slice(-4)}`,
  revenda: `Revenda ${String.fromCharCode(65 + (i % 5))}`,
  stage: ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'][i % 5],
  usd_value: Math.floor(Math.random() * 2500000) + 50000,
  probability: [20, 40, 60, 80, 0][i % 5],
  is_budgetary: i % 3 === 0,
}));

export default function BatchQueryPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [filters, setFilters] = useState({
    quote_number: '',
    stage: '',
    revenda: '',
    min_usd: '',
    max_usd: '',
    min_prob: '',
    max_prob: '',
    budgetary: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filteredQuotes = mockQuotes.filter(q => {
    if (filters.quote_number && !q.quote_number.includes(filters.quote_number)) return false;
    if (filters.stage && q.stage !== filters.stage) return false;
    if (filters.revenda && !q.revenda.includes(filters.revenda)) return false;
    if (filters.min_usd && q.usd_value < parseInt(filters.min_usd)) return false;
    if (filters.max_usd && q.usd_value > parseInt(filters.max_usd)) return false;
    if (filters.min_prob && q.probability < parseInt(filters.min_prob)) return false;
    if (filters.max_prob && q.probability > parseInt(filters.max_prob)) return false;
    if (filters.budgetary === 'yes' && !q.is_budgetary) return false;
    if (filters.budgetary === 'no' && q.is_budgetary) return false;
    return true;
  });

  const paginatedQuotes = filteredQuotes.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalUsd = filteredQuotes.reduce((sum, q) => sum + q.usd_value, 0);
  const avgProb = Math.round(filteredQuotes.reduce((sum, q) => sum + q.probability, 0) / filteredQuotes.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-blue-600 hover:text-blue-700">← Home</Link>
            <h1 className="text-2xl font-bold text-gray-900">Batch Query</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Dashboard
            </Link>
            <Link href="/pipeline-details" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Details
            </Link>
            <Link href="/pipeline-manager" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Manager
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="p-8 bg-white border-t-4 border-t-emerald-600">
          <h2 className="text-lg font-bold text-gray-900 mb-6">13 Filtros de Consulta Avançada</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quote Number</label>
              <input
                type="text"
                placeholder="QT-1001"
                value={filters.quote_number}
                onChange={(e) => setFilters({ ...filters, quote_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Stages</option>
                <option value="Pipelined">Pipelined</option>
                <option value="Pricing 25%">Pricing 25%</option>
                <option value="Up Selling 50%">Up Selling 50%</option>
                <option value="Committed 75%">Committed 75%</option>
                <option value="Net Lost">Net Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Revenda</label>
              <input
                type="text"
                placeholder="Revenda A"
                value={filters.revenda}
                onChange={(e) => setFilters({ ...filters, revenda: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min USD</label>
              <input
                type="number"
                placeholder="50000"
                value={filters.min_usd}
                onChange={(e) => setFilters({ ...filters, min_usd: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max USD</label>
              <input
                type="number"
                placeholder="2500000"
                value={filters.max_usd}
                onChange={(e) => setFilters({ ...filters, max_usd: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Probability</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                max="100"
                value={filters.min_prob}
                onChange={(e) => setFilters({ ...filters, min_prob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Probability</label>
              <input
                type="number"
                placeholder="100"
                min="0"
                max="100"
                value={filters.max_prob}
                onChange={(e) => setFilters({ ...filters, max_prob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Budgetary</label>
              <select
                value={filters.budgetary}
                onChange={(e) => setFilters({ ...filters, budgetary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowPreview(true)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 transition"
              >
                Consultar ({filteredQuotes.length})
              </button>
              <button
                onClick={() => {
                  setFilters({
                    quote_number: '',
                    stage: '',
                    revenda: '',
                    min_usd: '',
                    max_usd: '',
                    min_prob: '',
                    max_prob: '',
                    budgetary: '',
                  });
                  setShowPreview(false);
                  setCurrentPage(1);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400 transition"
              >
                Limpar
              </button>
            </div>
          </div>
        </Card>

        {showPreview && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                <p className="text-gray-600 text-xs font-medium">Total Results</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">{filteredQuotes.length}</p>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                <p className="text-gray-600 text-xs font-medium">Total USD</p>
                <p className="text-2xl font-bold text-green-900 mt-2">${(totalUsd / 1000000).toFixed(1)}M</p>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                <p className="text-gray-600 text-xs font-medium">Avg Probability</p>
                <p className="text-2xl font-bold text-purple-900 mt-2">{avgProb}%</p>
              </Card>
            </div>

            <Card className="bg-white shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">CPO ID</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Quote #</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Revenda</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Stage</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700">USD</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700">Prob</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700">Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQuotes.map((q, idx) => (
                      <tr key={idx} className="border-b hover:bg-blue-50 transition">
                        <td className="px-4 py-3 font-mono text-blue-600 font-bold text-xs">{q.cpo_id}</td>
                        <td className="px-4 py-3 text-xs font-medium">{q.quote_number}</td>
                        <td className="px-4 py-3 text-xs">{q.revenda}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">{q.stage}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-700">${(q.usd_value / 1000).toFixed(0)}K</td>
                        <td className="px-4 py-3 text-center font-semibold">{q.probability}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${q.is_budgetary ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                            {q.is_budgetary ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredQuotes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredQuotes.length)} of {filteredQuotes.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(filteredQuotes.length / pageSize), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(filteredQuotes.length / pageSize)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Próximo →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
