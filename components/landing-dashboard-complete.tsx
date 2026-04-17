'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import GlobalNavigation from './global-navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockData = {
  kpis: {
    pipelined: 2850000,
    notClassified: 450000,
    pricing25: 600000,
    up50: 920000,
    committed75: 650000,
    netLost: 180000,
  },
  chartData: [
    { stage: 'Not Classified', value: 450000, percentage: 8 },
    { stage: 'Pricing 25%', value: 600000, percentage: 11 },
    { stage: 'Up Selling 50%', value: 920000, percentage: 17 },
    { stage: 'Committed 75%', value: 650000, percentage: 12 },
    { stage: 'Net Lost', value: 180000, percentage: 3 },
    { stage: 'Pipelined', value: 1050000, percentage: 49 },
  ],
  manufacturerData: [
    { name: 'Cisco', value: 850000 },
    { name: 'HPE', value: 720000 },
    { name: 'VMware', value: 580000 },
    { name: 'NetApp', value: 450000 },
    { name: 'Dell', value: 250000 },
  ],
  revenueByRevender: [
    { name: 'TechCorp', value: 950000 },
    { name: 'DataSys', value: 780000 },
    { name: 'CloudTech', value: 620000 },
    { name: 'NetVision', value: 500000 },
  ],
};

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export default function LandingDashboard() {
  const [filters, setFilters] = useState({
    usdRange: 'all',
    manufacturer: 'all',
    revender: 'all',
    stage: 'all',
    status: 'all',
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Pipeline Dashboard Executivo</h1>
          <p className="text-gray-600 mt-2">Visão consolidada de oportunidades classificadas e não classificadas</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 bg-white border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros Avançados</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Range USD</label>
              <select
                value={filters.usdRange}
                onChange={(e) => handleFilterChange('usdRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="0-100k">$0 - $100K</option>
                <option value="100k-500k">$100K - $500K</option>
                <option value="500k-1m">$500K - $1M</option>
                <option value="1m+">$1M+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fabricante</label>
              <select
                value={filters.manufacturer}
                onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="cisco">Cisco</option>
                <option value="hpe">HPE</option>
                <option value="vmware">VMware</option>
                <option value="netapp">NetApp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Revenda</label>
              <select
                value={filters.revender}
                onChange={(e) => handleFilterChange('revender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todas</option>
                <option value="techcorp">TechCorp</option>
                <option value="datasys">DataSys</option>
                <option value="cloudtech">CloudTech</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estágio</label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="not-classified">Não Classificado</option>
                <option value="pricing-25">Pricing 25%</option>
                <option value="up-selling-50">Up Selling 50%</option>
                <option value="committed-75">Committed 75%</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="closed">Fechado</option>
                <option value="lost">Perdido</option>
              </select>
            </div>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4 bg-white border-l-4 border-l-blue-600">
            <p className="text-sm font-medium text-gray-600 mb-1">Pipelined</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.kpis.pipelined)}</p>
            <p className="text-xs text-gray-500 mt-2">Total Classificado</p>
          </Card>

          <Card className="p-4 bg-white border-l-4 border-l-orange-500">
            <p className="text-sm font-medium text-gray-600 mb-1">Não Classificado</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.kpis.notClassified)}</p>
            <p className="text-xs text-gray-500 mt-2">Pendente Classificação</p>
          </Card>

          <Card className="p-4 bg-white border-l-4 border-l-indigo-500">
            <p className="text-sm font-medium text-gray-600 mb-1">Pricing 25%</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.kpis.pricing25)}</p>
            <p className="text-xs text-gray-500 mt-2">Em Cotação</p>
          </Card>

          <Card className="p-4 bg-white border-l-4 border-l-purple-500">
            <p className="text-sm font-medium text-gray-600 mb-1">Up Selling 50%</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.kpis.up50)}</p>
            <p className="text-xs text-gray-500 mt-2">Upportunidade Ativa</p>
          </Card>

          <Card className="p-4 bg-white border-l-4 border-l-emerald-600">
            <p className="text-sm font-medium text-gray-600 mb-1">Committed 75%</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.kpis.committed75)}</p>
            <p className="text-xs text-gray-500 mt-2">Comprometida</p>
          </Card>

          <Card className="p-4 bg-white border-l-4 border-l-red-600">
            <p className="text-sm font-medium text-gray-600 mb-1">Net Lost</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.kpis.netLost)}</p>
            <p className="text-xs text-gray-500 mt-2">Perdida</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pipeline por Estágio */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Estágio</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pipeline por Fabricante */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Fabricantes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.manufacturerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribuição Percentual */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição Percentual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Revendas */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revendas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.revenueByRevender}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Actions */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/pipeline-manager">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Ir para Pipeline Manager</Button>
            </Link>
            <Link href="/pipeline-details">
              <Button variant="outline">Visualizar Detalhes</Button>
            </Link>
            <Link href="/pipeline-operations">
              <Button variant="outline">Operações em Lote</Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
