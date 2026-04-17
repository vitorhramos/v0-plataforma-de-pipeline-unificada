'use client';

import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { dataService } from '@/lib/data-service-v2';
import { useState } from 'react';
import { SmartPagination } from '@/components/common/smart-pagination';
import { AlertBadge } from '@/components/common/alert-badges';

export default function BatchQueryPage() {
  const { filters, setFilters, filteredQuotes, clearFilters, dataCompactMode } = useAppContext();
  const [showPreview, setShowPreview] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const start = (currentPage - 1) * pageSize;
  const paginatedQuotes = filteredQuotes.slice(start, start + pageSize);

  const totalUSD = filteredQuotes.reduce((sum, q) => sum + q.cif_value_usd, 0);
  const avgProbability = filteredQuotes.length > 0 
    ? Math.round(filteredQuotes.reduce((sum, q) => sum + q.probability_percentage, 0) / filteredQuotes.length)
    : 0;

  return (
    <div className={`min-h-screen bg-gray-50 ${dataCompactMode ? 'space-y-4' : 'space-y-8'}`}>
      <main className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Batch Query</h1>
        <p className="text-gray-600 mb-8">Consulta avançada com 13 filtros, preview inteligente e pagination</p>

        {/* 13 Filters */}
        <Card className="p-8 mb-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-blue-500">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            Filtros de Pesquisa (13)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Quote #" 
              onChange={(e) => setFilters({ ...filters, quote_number: e.target.value })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <select 
              onChange={(e) => setFilters({ ...filters, quote_stage: e.target.value || undefined })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Quote Stage</option>
              {['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              onChange={(e) => setFilters({ ...filters, vendor_name: e.target.value || undefined })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Vendor</option>
              {dataService.getUniqueValues('vendor_name').map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input 
              type="text" 
              placeholder="Master Customer" 
              onChange={(e) => setFilters({ ...filters, master_customer: e.target.value })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <input 
              type="number" 
              placeholder="Min Probability" 
              onChange={(e) => setFilters({ ...filters, probability_min: parseInt(e.target.value) || undefined })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <input 
              type="number" 
              placeholder="Max Probability" 
              onChange={(e) => setFilters({ ...filters, probability_max: parseInt(e.target.value) || undefined })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <input 
              type="date" 
              placeholder="CPO Date From" 
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <input 
              type="date" 
              placeholder="CPO Date To" 
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <input 
              type="date" 
              placeholder="Close Date From" 
              onChange={(e) => setFilters({ ...filters, close_date_from: e.target.value })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <input 
              type="date" 
              placeholder="Close Date To" 
              onChange={(e) => setFilters({ ...filters, close_date_to: e.target.value })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <select 
              onChange={(e) => setFilters({ ...filters, sales_territory: e.target.value || undefined })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Territory</option>
              {dataService.getUniqueValues('sales_territory').map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select 
              onChange={(e) => setFilters({ ...filters, team: e.target.value || undefined })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Team</option>
              {dataService.getUniqueValues('team').map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select 
              onChange={(e) => setFilters({ ...filters, is_budgetary: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })} 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Budgetary</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="flex gap-2 mt-6">
            <button 
              onClick={() => {
                setShowPreview(true);
                setCurrentPage(1);
              }} 
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
            >
              Consultar ({filteredQuotes.length})
            </button>
            <button 
              onClick={() => {
                clearFilters();
                setCurrentPage(1);
              }} 
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Limpar
            </button>
          </div>
        </Card>

        {/* Query Stats */}
        {showPreview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-l-blue-600">
              <p className="text-gray-600 text-sm">Total Results</p>
              <p className="text-2xl font-bold text-blue-900">{filteredQuotes.length}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-green-600">
              <p className="text-gray-600 text-sm">Total USD Value</p>
              <p className="text-2xl font-bold text-green-900">${(totalUSD / 1000000).toFixed(1)}M</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-l-purple-600">
              <p className="text-gray-600 text-sm">Avg Probability</p>
              <p className="text-2xl font-bold text-purple-900">{avgProbability}%</p>
            </Card>
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <Card className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 border-b">
              <h2 className="text-lg font-bold text-gray-900">Preview ({filteredQuotes.length} resultados encontrados)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full ${dataCompactMode ? 'text-xs' : 'text-sm'}`}>
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">CPO ID</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Quote #</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Revenda</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Stage</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-700">USD</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Prob</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        <p className="text-lg">Nenhum resultado encontrado</p>
                        <p className="text-sm mt-2">Ajuste seus filtros e tente novamente</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedQuotes.map(q => (
                      <tr key={q.id} className="border-b hover:bg-blue-50 transition-colors animate-fadeIn">
                        <td className="px-4 py-3 font-mono text-blue-600 font-semibold">{q.cpo_id}</td>
                        <td className="px-4 py-3 font-medium">{q.quote_number}</td>
                        <td className="px-4 py-3">{q.revenda}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">{q.quote_stage}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-700">${(q.cif_value_usd / 1000).toFixed(0)}K</td>
                        <td className="px-4 py-3 text-center font-semibold">{q.probability_percentage}%</td>
                        <td className="px-4 py-3 text-center">
                          {q.is_budgetary ? (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Budget</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Standard</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredQuotes.length > 0 && (
              <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
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
            )}
          </Card>
        )}
      </main>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Batch Query</h1>
        <p className="text-gray-600 mb-8">Consulta avançada com 13 filtros e preview de resultado</p>

        {/* 13 Filters */}
        <Card className="p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Filtros de Pesquisa (13)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Quote #" onChange={(e) => setFilters({ ...filters, quote_number: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <select onChange={(e) => setFilters({ ...filters, quote_stage: e.target.value || undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Quote Stage</option>
              {['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select onChange={(e) => setFilters({ ...filters, vendor_name: e.target.value || undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Vendor</option>
              {dataService.getUniqueValues('vendor_name').map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input type="text" placeholder="Master Customer" onChange={(e) => setFilters({ ...filters, master_customer: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="number" placeholder="Min Probability" onChange={(e) => setFilters({ ...filters, probability_min: parseInt(e.target.value) || undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="number" placeholder="Max Probability" onChange={(e) => setFilters({ ...filters, probability_max: parseInt(e.target.value) || undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="date" placeholder="CPO Date From" onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="date" placeholder="CPO Date To" onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="date" placeholder="Close Date From" onChange={(e) => setFilters({ ...filters, close_date_from: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="date" placeholder="Close Date To" onChange={(e) => setFilters({ ...filters, close_date_to: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <select onChange={(e) => setFilters({ ...filters, sales_territory: e.target.value || undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Territory</option>
              {dataService.getUniqueValues('sales_territory').map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select onChange={(e) => setFilters({ ...filters, team: e.target.value || undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Team</option>
              {dataService.getUniqueValues('team').map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select onChange={(e) => setFilters({ ...filters, is_budgetary: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Budgetary</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={() => setShowPreview(!showPreview)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              Consultar
            </button>
            <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
              Limpar
            </button>
          </div>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Preview ({filteredQuotes.length} resultados)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-bold">CPO ID</th>
                    <th className="px-4 py-2 text-left font-bold">Quote #</th>
                    <th className="px-4 py-2 text-left font-bold">Revenda</th>
                    <th className="px-4 py-2 text-left font-bold">Stage</th>
                    <th className="px-4 py-2 text-right font-bold">USD</th>
                    <th className="px-4 py-2 text-center font-bold">Prob</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.slice(0, 10).map(q => (
                    <tr key={q.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-blue-600">{q.cpo_id}</td>
                      <td className="px-4 py-2">{q.quote_number}</td>
                      <td className="px-4 py-2">{q.master_customer_name}</td>
                      <td className="px-4 py-2"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{q.quote_stage}</span></td>
                      <td className="px-4 py-2 text-right font-medium">${(q.cif_value_usd / 1000).toFixed(0)}K</td>
                      <td className="px-4 py-2 text-center">{q.probability_percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredQuotes.length > 10 && <p className="text-sm text-gray-600 mt-2">... e mais {filteredQuotes.length - 10} resultados</p>}
          </Card>
        )}
      </main>
    </div>
  );
}
