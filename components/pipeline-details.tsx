'use client';

import { useState, useMemo } from 'react';
import { getAllQuotes, filterQuotes, getUniqueFabricantes, getUniqueRevendas, getTerritories } from '@/lib/data-service';
import GlobalNavigation from './global-navigation';

const STAGES = ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed', 'Net Lost'];

export default function PipelineDetailsComponent() {
  const allQuotes = getAllQuotes();
  const territories = getTerritories();
  const fabricantes = getUniqueFabricantes();
  const revendas = getUniqueRevendas();

  const [filters, setFilters] = useState({
    minUsd: '',
    maxUsd: '',
    stage: '',
    revenda: '',
    fabricante: '',
    territory: '',
    search: '',
  });

  const [selectedQuotes, setSelectedQuotes] = useState<Set<number>>(new Set());

  const filteredQuotes = useMemo(() => {
    return filterQuotes({
      minUsd: filters.minUsd ? parseInt(filters.minUsd) : null,
      maxUsd: filters.maxUsd ? parseInt(filters.maxUsd) : null,
      stage: filters.stage || null,
      revenda: filters.revenda || null,
      fabricante: filters.fabricante || null,
      territory: filters.territory ? parseInt(filters.territory) : null,
      search: filters.search || null,
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
      search: '',
    });
  };

  const toggleSelectAll = () => {
    if (selectedQuotes.size === filteredQuotes.length) {
      setSelectedQuotes(new Set());
    } else {
      setSelectedQuotes(new Set(filteredQuotes.map(q => q.id)));
    }
  };

  const exportToCSV = () => {
    const headers = ['CPO ID', 'Revenda', 'End User', 'Fabricante', 'USD', 'Stage', 'Probability', 'Close Date', 'Sales Rep', 'Territory', 'Budgetary'];
    const rows = filteredQuotes.map(q => [
      q.cpo_id,
      q.revenda,
      q.end_user,
      q.fabricante,
      q.usd_value,
      q.stage,
      q.probability,
      q.close_date || '',
      q.sales_rep,
      territories.find(t => t.id === q.territory_id)?.name || '',
      q.is_budgetary ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-details-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToForecast = () => {
    const headers = ['CPO ID', 'Revenda', 'End User', 'Fabricante', 'USD', 'Stage', 'Close Date'];
    const rows = filteredQuotes.map(q => [
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
    a.download = `pipeline-forecast-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Details</h1>
          <p className="text-gray-600 mt-1">Line-by-line analytical view with 19 fields</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search (CPO, End User, Rep)</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={exportToForecast}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Export Forecast
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedQuotes.size === filteredQuotes.length && filteredQuotes.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">CPO ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Revenda</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">End User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Fabricante</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">USD</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Stage</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Prob %</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Close Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Sales Rep</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map(quote => (
                <tr key={quote.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedQuotes.has(quote.id)}
                      onChange={() => {
                        const newSet = new Set(selectedQuotes);
                        if (newSet.has(quote.id)) {
                          newSet.delete(quote.id);
                        } else {
                          newSet.add(quote.id);
                        }
                        setSelectedQuotes(newSet);
                      }}
                      className="rounded"
                    />
                  </td>
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
                  <td className="px-4 py-3">{quote.close_date || '-'}</td>
                  <td className="px-4 py-3">{quote.sales_rep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {filteredQuotes.length} quotes | Total: {formatUSD(filteredQuotes.reduce((sum, q) => sum + q.usd_value, 0))}
        </div>
      </main>
    </div>
  );
}
