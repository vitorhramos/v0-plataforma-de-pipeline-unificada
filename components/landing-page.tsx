'use client';

import { useState, useMemo } from 'react';
import { getAllQuotes, filterQuotes, getStatistics, getUniqueFabricantes, getUniqueRevendas, getTerritories } from '@/lib/data-service';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GlobalNavigation from './global-navigation';

const STAGES = ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed', 'Net Lost'];
const COLORS = ['#0ea5e9', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

export default function LandingPage() {
  const allQuotes = getAllQuotes();
  const territories = getTerritories();
  const fabricantes = getUniqueFabricantes();
  const revendas = getUniqueRevendas();

  // Filters state
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

  // Apply filters
  const filteredQuotes = useMemo(() => {
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
  }, [filters]);

  const stats = getStatistics(filteredQuotes);

  // Chart data
  const stageDistribution = STAGES.map(stage => {
    const count = filteredQuotes.filter(q => q.stage === stage).length;
    const value = filteredQuotes.filter(q => q.stage === stage).reduce((sum, q) => sum + q.usd_value, 0);
    return { name: stage, count, value };
  });

  const fabricanteData = [...new Set(filteredQuotes.map(q => q.fabricante))].map(fab => {
    const value = filteredQuotes.filter(q => q.fabricante === fab).reduce((sum, q) => sum + q.usd_value, 0);
    return { name: fab, value, count: filteredQuotes.filter(q => q.fabricante === fab).length };
  }).sort((a, b) => b.value - a.value).slice(0, 6);

  const territoryData = territories.map(ter => {
    const value = filteredQuotes.filter(q => q.territory_id === ter.id).reduce((sum, q) => sum + q.usd_value, 0);
    return { name: ter.name, value, count: filteredQuotes.filter(q => q.territory_id === ter.id).length };
  }).filter(t => t.count > 0);

  const usdRanges = [
    { range: '$0-100K', min: 0, max: 100000 },
    { range: '$100-200K', min: 100000, max: 200000 },
    { range: '$200-300K', min: 200000, max: 300000 },
    { range: '$300-500K', min: 300000, max: 500000 },
    { range: '>$500K', min: 500000, max: Infinity },
  ];

  const usdRangeData = usdRanges.map(r => {
    const count = filteredQuotes.filter(q => q.usd_value >= r.min && q.usd_value < r.max).length;
    return { name: r.range, count, value: filteredQuotes.filter(q => q.usd_value >= r.min && q.usd_value < r.max).reduce((sum, q) => sum + q.usd_value, 0) };
  });

  const probabilityData = [
    { name: 'Not Classified', value: filteredQuotes.filter(q => q.probability === 0).length },
    { name: '25%', value: filteredQuotes.filter(q => q.probability === 25).length },
    { name: '50%', value: filteredQuotes.filter(q => q.probability === 50).length },
    { name: '75%', value: filteredQuotes.filter(q => q.probability === 75).length },
  ];

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
      budgetary: '',
    });
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Pipeline Dashboard</h1>
          <p className="text-gray-600 mt-2">Executive view with KPIs, analytics and advanced filters</p>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
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
            {/* USD Range */}
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

            {/* Stage */}
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

            {/* Revenda */}
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

            {/* Fabricante */}
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

            {/* Territory */}
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

            {/* Budgetary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budgetary Only</label>
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

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="CPO, End User, Rep"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Pipelined */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Pipelined</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatUSD(stats.pipelinedUSD)}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.notClassifiedCount} quotes</p>
          </div>

          {/* Not Classified */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-cyan-500">
            <p className="text-sm text-gray-600">Not Classified</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.notClassifiedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Quotes</p>
          </div>

          {/* Pricing 25% */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-500">
            <p className="text-sm text-gray-600">Pricing 25%</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatUSD(stats.pricing25USD)}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredQuotes.filter(q => q.stage === 'Pricing 25%').length} quotes</p>
          </div>

          {/* Up Selling 50% */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600">Up Selling 50%</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatUSD(stats.upSelling50USD)}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredQuotes.filter(q => q.stage === 'Up Selling 50%').length} quotes</p>
          </div>

          {/* Committed 75% */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Committed 75%</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatUSD(stats.committed75USD)}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredQuotes.filter(q => q.stage === 'Committed').length} quotes</p>
          </div>

          {/* Net Lost */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Net Lost</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatUSD(stats.netLostUSD)}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredQuotes.filter(q => q.is_lost).length} quotes</p>
          </div>

          {/* Total USD */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Total USD</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatUSD(filteredQuotes.reduce((sum, q) => sum + q.usd_value, 0))}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredQuotes.length} quotes</p>
          </div>

          {/* Budgetary */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-600">Budgetary</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{filteredQuotes.filter(q => q.is_budgetary).length}</p>
            <p className="text-xs text-gray-500 mt-1">Quotes</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stage Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribution by Stage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatUSD(value)} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Manufacturer Distribution */}
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

          {/* Territory Distribution */}
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

          {/* USD Range Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribution by USD Range</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usdRangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatUSD(value)} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Probability Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribution by Probability</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={probabilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {probabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Quote Count by Stage */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quote Count by Stage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
