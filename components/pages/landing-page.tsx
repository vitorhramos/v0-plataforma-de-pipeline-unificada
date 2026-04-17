'use client';

import { useAppContext } from '@/context/AppContext';
import { dataService } from '@/lib/data-service-v2';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

export default function LandingPage() {
  const { quotes, filters, setFilters, clearFilters } = useAppContext();
  const kpis = dataService.getKPIs(quotes);
  const stageData = dataService.getStageDistribution(quotes);
  const vendorData = dataService.getTopVendors(quotes);
  const revendaData = dataService.getTopRevendas(quotes);
  const territoryData = dataService.getTerritoryDistribution(quotes);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600 mt-2">Visão executiva do pipeline comercial com 12 KPIs e 8 gráficos analíticos</p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, idx) => (
            <Card key={idx} className="p-6 border-l-4" style={{ borderLeftColor: kpi.color }}>
              <div className="text-sm text-gray-600 mb-2">{kpi.label}</div>
              <div className="text-2xl font-bold text-gray-900">
                {kpi.format === 'currency' ? `$${(kpi.value / 1000).toFixed(0)}K` : kpi.format === 'percentage' ? `${kpi.value}%` : kpi.value.toLocaleString()}
              </div>
              {kpi.trend && <div className="text-sm text-green-600 mt-2">↑ {kpi.trend}%</div>}
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 border-t-4 border-t-blue-500">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Quote #"
              onChange={(e) => setFilters({ ...filters, quote_number: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              onChange={(e) => setFilters({ ...filters, quote_stage: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stages</option>
              <option value="Pipelined">Pipelined</option>
              <option value="Pricing 25%">Pricing 25%</option>
              <option value="Up Selling 50%">Up Selling 50%</option>
              <option value="Committed 75%">Committed 75%</option>
              <option value="Net Lost">Net Lost</option>
            </select>
            <select
              onChange={(e) => setFilters({ ...filters, vendor_name: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Vendors</option>
              {dataService.getUniqueValues('vendor_name').map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pipeline por Stage (USD)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Revendas */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 Revendas por Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revendaData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Vendor Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Fabricante</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={vendorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {vendorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Territory Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Território</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={territoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Probability Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quotes por Probabilidade</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: '0-25%', count: quotes.filter(q => q.probability_percentage <= 25).length },
                { name: '26-50%', count: quotes.filter(q => q.probability_percentage > 25 && q.probability_percentage <= 50).length },
                { name: '51-75%', count: quotes.filter(q => q.probability_percentage > 50 && q.probability_percentage <= 75).length },
                { name: '76-100%', count: quotes.filter(q => q.probability_percentage > 75).length },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Stage vs Quote Count */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quote Count por Stage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Budgetary vs Non-Budgetary */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Budgetary vs Non-Budgetary</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Budgetary', value: quotes.filter(q => q.is_budgetary).reduce((sum, q) => sum + q.cif_value_usd, 0) },
                    { name: 'Non-Budgetary', value: quotes.filter(q => !q.is_budgetary).reduce((sum, q) => sum + q.cif_value_usd, 0) },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  <Cell fill="#ec4899" />
                  <Cell fill="#14b8a6" />
                </Pie>
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Lost Deals Analysis */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Análise de Deals Perdidos</h3>
            <div className="space-y-3">
              {quotes
                .filter(q => q.is_lost)
                .reduce((acc: any, q) => {
                  const reason = q.lost_reason || 'Other';
                  acc[reason] = (acc[reason] || 0) + 1;
                  return acc;
                }, {})
              ? Object.entries(quotes
                  .filter(q => q.is_lost)
                  .reduce((acc: any, q) => {
                    const reason = q.lost_reason || 'Other';
                    acc[reason] = (acc[reason] || 0) + 1;
                    return acc;
                  }, {}))
                .map(([reason, count]: [string, any]) => (
                  <div key={reason} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span className="text-sm font-medium text-gray-700">{reason}</span>
                    <span className="text-sm font-bold text-red-600">{count} deals</span>
                  </div>
                ))
              : <p className="text-gray-600 text-sm">Nenhum deal perdido</p>
              }
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
