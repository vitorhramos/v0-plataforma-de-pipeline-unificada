'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Table, TableBody, TableCell, TableHead, TableRow } from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
  meta?: string;
}

interface TableRow {
  status: string;
  volume: number;
  meta: string;
  target: number;
}

export default function PipelineManager() {
  const [viewMode, setViewMode] = useState<'charts' | 'tables'>('charts');
  const [selectedFilters, setSelectedFilters] = useState({
    dateCreation: 'all',
    dateClose: 'all',
    reseller: '',
    vendor: '',
    status: '',
    bu: '',
  });

  // Mock data
  const volumeByReseller: ChartDataPoint[] = [
    { name: 'Tech Reseller Inc', value: 125000 },
    { name: 'Enterprise Solutions', value: 85000 },
    { name: 'Network Plus', value: 225000 },
    { name: 'Tech Consulting', value: 150000 },
    { name: 'Business Tech Dist', value: 65000 },
  ];

  const volumeByVendor: ChartDataPoint[] = [
    { name: 'NetApp', value: 320000 },
    { name: 'VMware', value: 200000 },
    { name: 'HPE', value: 125000 },
    { name: 'IBM', value: 150000 },
    { name: 'Dell', value: 85000 },
  ];

  const volumeByTeam: ChartDataPoint[] = [
    { name: 'Team A', value: 450000 },
    { name: 'Team B', value: 260000 },
    { name: 'Team C', value: 335000 },
  ];

  const volumeByBusinessType: ChartDataPoint[] = [
    { name: 'Hardware', value: 1100000 },
    { name: 'Services', value: 460000 },
  ];

  const monthlyEvolution: ChartDataPoint[] = [
    { name: 'Jan', value: 450000 },
    { name: 'Feb', value: 595000 },
    { name: 'Mar', value: 625000 },
  ];

  const committedVsUp: ChartDataPoint[] = [
    { name: 'Committed', value: 394000 },
    { name: 'Up Selling', value: 365000 },
  ];

  const pipelineStatus: TableRow[] = [
    { status: 'Committed (75%)', volume: 394000, meta: 'Strong', target: 500000 },
    { status: 'Up Selling (50%)', volume: 365000, meta: 'On Track', target: 400000 },
    { status: 'Pricing (25%)', volume: 286000, meta: 'Needs Attention', target: 350000 },
  ];

  const COLORS = ['#3b82f6', '#1d4ed8', '#0c2340', '#2563eb', '#1e40af'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline Manager</h1>
        <p className="text-gray-600 mt-2">Gestão gerencial e análise de oportunidades comerciais</p>
      </div>

      {/* View Toggle */}
      <div className="mb-8 flex gap-2">
        <Button
          onClick={() => setViewMode('charts')}
          variant={viewMode === 'charts' ? 'default' : 'outline'}
          className="gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Gráficos
        </Button>
        <Button
          onClick={() => setViewMode('tables')}
          variant={viewMode === 'tables' ? 'default' : 'outline'}
          className="gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Tabelas
        </Button>
        <Button variant="outline" className="ml-auto">Limpar Filtros</Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-8 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Data Criação</label>
            <select className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>Tudo</option>
              <option>Últimos 30 dias</option>
              <option>Últimos 60 dias</option>
              <option>Últimos 90 dias</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Data Fechamento</label>
            <select className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>Tudo</option>
              <option>Fevereiro</option>
              <option>Março</option>
              <option>Abril</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Revenda</label>
            <input type="text" placeholder="Buscar..." className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Fabricante</label>
            <input type="text" placeholder="Buscar..." className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
            <select className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>Tudo</option>
              <option>Committed</option>
              <option>Up Selling</option>
              <option>Pricing</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">BU Vendas</label>
            <input type="text" placeholder="Buscar..." className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>
      </Card>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Total Classificado</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">$1,045K</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Não Classificado</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">$125K</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Up Selling 50%</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">$365K</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Committed 75%</p>
          <p className="text-2xl font-bold text-green-600 mt-2">$394K</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Pricing 25%</p>
          <p className="text-2xl font-bold text-blue-400 mt-2">$286K</p>
        </Card>
      </div>

      {viewMode === 'charts' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume USD por Revenda</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeByReseller}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume USD por Fabricante</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeByVendor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="value" fill="#1d4ed8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume por Time de Vendas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeByTeam}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume por Tipo de Negócio</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={volumeByBusinessType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {volumeByBusinessType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Mensal de Volume (USD)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} name="Volume" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Proporção Committed vs Up Selling</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={committedVsUp}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {committedVsUp.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      ) : (
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline por Status vs Meta</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Volume</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Meta</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Diferença</th>
                </tr>
              </thead>
              <tbody>
                {pipelineStatus.map((row, idx) => (
                  <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3 font-semibold">${row.volume / 1000}K</td>
                    <td className="px-4 py-3 font-semibold">${row.target / 1000}K</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${row.meta === 'Strong' ? 'bg-green-100 text-green-800' : row.meta === 'On Track' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {row.meta}
                      </span>
                    </td>
                    <td className="px-4 py-3">${((row.volume - row.target) / 1000).toFixed(0)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
