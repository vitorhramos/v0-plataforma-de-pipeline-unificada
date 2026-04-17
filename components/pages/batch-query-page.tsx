'use client';

import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { dataService } from '@/lib/data-service-v2';
import { useState } from 'react';

export default function BatchQueryPage() {
  const { filters, setFilters, filteredQuotes, clearFilters } = useAppContext();
  const [showPreview, setShowPreview] = useState(true);

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
