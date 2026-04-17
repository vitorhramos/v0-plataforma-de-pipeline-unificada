'use client';

import { useAppContext } from '@/context/AppContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { dataService } from '@/lib/data-service-v2';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

export default function PipelineManagerPage() {
  const { filteredQuotes, filters, setFilters, clearFilters } = useAppContext();
  const [viewMode, setViewMode] = useLocalStorage<'charts' | 'table'>('pipeline-manager-view', 'charts');
  const [selectedQuotes, setSelectedQuotes] = useState<Set<number>>(new Set());

  const stageData = dataService.getStageDistribution(filteredQuotes);
  const vendorData = dataService.getTopVendors(filteredQuotes, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Manager</h1>
          <p className="text-gray-600">Visualização gerencial com toggle gráficos/tabelas</p>
        </div>

        {/* Toggle View */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('charts')}
            className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'charts' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Charts
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Table
          </button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">Filtros (6)</h2>
            <button onClick={clearFilters} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="date" placeholder="Data Criação" onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="date" placeholder="Data Fechamento" onChange={(e) => setFilters({ ...filters, close_date_from: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <select onChange={(e) => setFilters({ ...filters, vendor_name: e.target.value || undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Vendors</option>
              {dataService.getUniqueValues('vendor_name').map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select onChange={(e) => setFilters({ ...filters, master_customer: e.target.value || undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Revendas</option>
              {dataService.getUniqueValues('master_customer_name').map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select onChange={(e) => setFilters({ ...filters, quote_stage: e.target.value || undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Stages</option>
              {['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select onChange={(e) => setFilters({ ...filters, team: e.target.value || undefined })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Teams</option>
              {dataService.getUniqueValues('team').map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </Card>

        {viewMode === 'charts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Distribution */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">USD por Stage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} height={80} />
                  <YAxis />
                  <Tooltip formatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Vendor Distribution */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Top Fabricantes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={vendorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {vendorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Quote Count */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quantidade por Stage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} height={80} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Status Summary */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Resumo por Status</h3>
              <div className="space-y-3">
                {stageData.map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-100 rounded">
                    <span className="font-medium text-gray-700">{s.name}</span>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${(s.value / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-gray-600">{s.count} quotes</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">CPO ID</th>
                  <th className="px-4 py-3 text-left font-bold">Revenda</th>
                  <th className="px-4 py-3 text-left font-bold">Fabricante</th>
                  <th className="px-4 py-3 text-left font-bold">Stage</th>
                  <th className="px-4 py-3 text-right font-bold">USD</th>
                  <th className="px-4 py-3 text-center font-bold">Prob%</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map(q => (
                  <tr key={q.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-blue-600">{q.cpo_id}</td>
                    <td className="px-4 py-3">{q.master_customer_name}</td>
                    <td className="px-4 py-3">{q.vendor_name}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{q.quote_stage}</span></td>
                    <td className="px-4 py-3 text-right font-medium">${(q.cif_value_usd / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-center">{q.probability_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
