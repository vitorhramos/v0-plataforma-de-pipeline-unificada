'use client';

import { useState, useMemo } from 'react';
import { getAllQuotes, filterQuotes, getUniqueFabricantes, getUniqueRevendas, getTerritories } from '@/lib/data-service';
import GlobalNavigation from './global-navigation';

const STAGES = ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed', 'Net Lost'];

export default function BatchQueryComponent() {
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
    budgetary: '',
  });

  const [hasQueried, setHasQueried] = useState(false);

  const filteredQuotes = useMemo(() => {
    if (!hasQueried) return [];
    return filterQuotes({
      minUsd: filters.minUsd ? parseInt(filters.minUsd) : null,
      maxUsd: filters.maxUsd ? parseInt(filters.maxUsd) : null,
      stage: filters.stage || null,
      revenda: filters.revenda || null,
      fabricante: filters.fabricante || null,
      territory: filters.territory ? parseInt(filters.territory) : null,
      search: filters.search || null,
      budgetary: filters.budgetary ? filters.budgetary === 'true' : undefined,
    });
  }, [filters, hasQueried]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleQuery = () => {
    setHasQueried(true);
  };

  const handleClear = () => {
    setFilters({
      minUsd: '',
      maxUsd: '',
      stage: '',
      revenda: '',
      fabricante: '',
      territory: '',
      search: '',
      budgetary: '',
    });
    setHasQueried(false);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Batch Query</h1>
          <p className="text-gray-600 mt-1">Query quotes with 10+ filters</p>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Query Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min USD</label>
              <input
                type="number"
                value={filters.minUsd}
                onChange={(e) => handleFilterChange('minUsd', e.target.value)}
                placeholder="$0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max USD</label>
              <input
                type="number"
                value={filters.maxUsd}
                onChange={(e) => handleFilterChange('maxUsd', e.target.value)}
                placeholder="$999,999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Revenda</label>
              <select
                value={filters.revenda}
                onChange={(e) => handleFilterChange('revenda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {revendas.map(revenda => (
                  <option key={revenda} value={revenda}>{revenda}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
              <select
                value={filters.fabricante}
                onChange={(e) => handleFilterChange('fabricante', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {fabricantes.map(fab => (
                  <option key={fab} value={fab}>{fab}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
              <select
                value={filters.territory}
                onChange={(e) => handleFilterChange('territory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {territories.map(ter => (
                  <option key={ter.id} value={ter.id}>{ter.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budgetary</label>
              <select
                value={filters.budgetary}
                onChange={(e) => handleFilterChange('budgetary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search (CPO, End User, Rep)</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleQuery}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Query
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results */}
        {hasQueried && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Results: {filteredQuotes.length} quotes found | Total: {formatUSD(filteredQuotes.reduce((sum, q) => sum + q.usd_value, 0))}
            </h3>

            {filteredQuotes.length > 0 ? (
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
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Prob %</th>
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
            ) : (
              <div className="text-center py-8 text-gray-600">
                No quotes found matching your criteria.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
