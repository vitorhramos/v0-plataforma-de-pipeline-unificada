'use client';

import { useState, useMemo } from 'react';
import { getAllQuotes, filterQuotes, getUniqueFabricantes, getUniqueRevendas, getTerritories } from '@/lib/data-service';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import GlobalNavigation from './global-navigation';

const STAGES = ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed', 'Net Lost'];
const COLORS = ['#0ea5e9', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

export default function PipelineManagerComponent() {
  const allQuotes = getAllQuotes();
  const territories = getTerritories();
  const fabricantes = getUniqueFabricantes();
  const revendas = getUniqueRevendas();

  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  const [filters, setFilters] = useState({
    minUsd: '',
    maxUsd: '',
    stage: '',
    revenda: '',
    fabricante: '',
    territory: '',
  });

  const filteredQuotes = useMemo(() => {
    return filterQuotes({
      minUsd: filters.minUsd ? parseInt(filters.minUsd) : null,
      maxUsd: filters.maxUsd ? parseInt(filters.maxUsd) : null,
      stage: filters.stage || null,
      revenda: filters.revenda || null,
      fabricante: filters.fabricante || null,
      territory: filters.territory ? parseInt(filters.territory) : null,
    });
  }, [filters]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      minUsd: '',
      maxUsd: '',
      stage: '',
      revenda: '',
      fabricante: '',
      territory: '',
    });
  };

  // Chart data
  const stageData = STAGES.map(stage => {
    const count = filteredQuotes.filter(q => q.stage === stage).length;
    const value = filteredQuotes.filter(q => q.stage === stage).reduce((sum, q) => sum + q.usd_value, 0);
    return { name: stage, count, value };
  });

  const territoryData = territories.map(ter => {
    const value = filteredQuotes.filter(q => q.territory_id === ter.id).reduce((sum, q) => sum + q.usd_value, 0);
    return { name: ter.name, value, count: filteredQuotes.filter(q => q.territory_id === ter.id).length };
  }).filter(t => t.count > 0);

  const fabricanteData = [...new Set(filteredQuotes.map(q => q.fabricante))].map(fab => {
    const value = filteredQuotes.filter(q => q.fabricante === fab).reduce((sum, q) => sum + q.usd_value, 0);
    return { name: fab, value, count: filteredQuotes.filter(q => q.fabricante === fab).length };
  }).sort((a, b) => b.value - a.value).slice(0, 5);

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Manager</h1>
          <p className="text-gray-600 mt-1">Managerial view with toggle charts/table</p>
        </div>

        {/* Toggle View */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setViewMode('charts')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'charts'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Charts View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Table View
          </button>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min USD</label>
              <input
                type="number"
                value={filters.minUsd}
                onChange={(e) => handleFilterChange('minUsd', e.target.value)}
                placeholder="$0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max USD</label>
              <input
                type="number"
                value={filters.maxUsd}
                onChange={(e) => handleFilterChange('maxUsd', e.target.value)}
                placeholder="$999,999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Stages</option>
                {STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revenda</label>
              <select
                value={filters.revenda}
                onChange={(e) => handleFilterChange('revenda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Revendas</option>
                {revendas.map(revenda => (
                  <option key={revenda} value={revenda}>{revenda}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <select
                value={filters.fabricante}
                onChange={(e) => handleFilterChange('fabricante', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Manufacturers</option>
                {fabricantes.map(fab => (
                  <option key={fab} value={fab}>{fab}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Territory</label>
              <select
                value={filters.territory}
                onChange={(e) => handleFilterChange('territory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Territories</option>
                {territories.map(ter => (
                  <option key={ter.id} value={ter.id}>{ter.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Charts View */}
        {viewMode === 'charts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Distribution by Stage (USD)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatUSD(value)} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stage Count */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quote Count by Stage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Territory */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Distribution by Territory</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={territoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {territoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatUSD(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Manufacturer */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Manufacturers</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fabricanteData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => formatUSD(value)} />
                  <Bar dataKey="value" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">CPO ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Revenda</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">End User</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Fabricante</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">USD</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Stage</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Prob</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map(quote => (
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
                    <td className="px-4 py-3 text-center font-medium">{quote.probability}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          {filteredQuotes.length} quotes | Total: {formatUSD(filteredQuotes.reduce((sum, q) => sum + q.usd_value, 0))}
        </div>
      </main>
    </div>
  );
}
