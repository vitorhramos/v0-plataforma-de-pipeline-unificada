'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Breadcrumbs, Tooltip as CustomTooltip } from '@/components/common/breadcrumbs-tooltips';
import { AdditionalCharts } from '@/components/common/additional-charts';
import { useKeyboardShortcuts } from '@/components/common/keyboard-shortcuts';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

const mockData = {
  kpis: [
    { label: 'Pipelined', value: '125', unit: '$45.2M', trend: '+15%' },
    { label: 'Pricing 25%', value: '89', unit: '$32.1M', trend: '+8%' },
    { label: 'Up Selling 50%', value: '56', unit: '$28.9M', trend: '+12%' },
    { label: 'Committed 75%', value: '34', unit: '$18.5M', trend: '+22%' },
    { label: 'Net Lost', value: '12', unit: '$5.2M', trend: '-5%' },
    { label: 'Total USD', value: '316', unit: '$130.0M', trend: '+10%' },
    { label: 'Budgetary', value: '87', unit: '$45.3M', trend: '+18%' },
    { label: 'Quote Count', value: '543', unit: 'quotes', trend: '+7%' },
    { label: 'Avg USD', value: '$239K', unit: 'avg', trend: '+3%' },
    { label: 'Min USD', value: '$50K', unit: 'min', trend: '-2%' },
    { label: 'Max USD', value: '$2.5M', unit: 'max', trend: '+15%' },
    { label: 'Win Rate', value: '68%', unit: 'rate', trend: '+5%' },
  ],
  stageData: [
    { name: 'Pipelined', value: 45200000 },
    { name: 'Pricing 25%', value: 32100000 },
    { name: 'Up Selling 50%', value: 28900000 },
    { name: 'Committed 75%', value: 18500000 },
    { name: 'Net Lost', value: 5200000 },
  ],
  topRevendas: [
    { name: 'Revenda A', value: 24500000 },
    { name: 'Revenda B', value: 18900000 },
    { name: 'Revenda C', value: 15600000 },
    { name: 'Revenda D', value: 12300000 },
    { name: 'Revenda E', value: 10200000 },
    { name: 'Others', value: 48500000 },
  ],
  territoryData: [
    { name: 'São Paulo', value: 45200000 },
    { name: 'Rio de Janeiro', value: 28900000 },
    { name: 'Minas Gerais', value: 18500000 },
    { name: 'Brasília', value: 15600000 },
    { name: 'Salvador', value: 12300000 },
    { name: 'Others', value: 9500000 },
  ],
  monthlyData: [
    { name: 'Jan', value: 18900000 },
    { name: 'Feb', value: 21200000 },
    { name: 'Mar', value: 19800000 },
    { name: 'Apr', value: 22500000 },
    { name: 'May', value: 25600000 },
    { name: 'Jun', value: 28300000 },
  ],
};

export default function DashboardPage() {
  const [expandFilters, setExpandFilters] = useState(true);

  useKeyboardShortcuts({
    export: () => alert('Exportando dados...'),
    filter: () => setExpandFilters(!expandFilters),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Executivo</h1>
          <p className="text-gray-600 text-sm">12 KPIs, 8 gráficos e 14 filtros avançados • Pressione <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+F</kbd> para filtros</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">12 KPIs Executivos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockData.kpis.map((kpi, idx) => (
              <CustomTooltip key={idx} content={`${kpi.trend} from last month`}>
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-l-blue-600 hover:shadow-lg transition cursor-help">
                  <p className="text-gray-600 text-sm font-medium">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.unit}</p>
                  <p className="text-xs text-green-600 mt-2">{kpi.value} {kpi.trend}</p>
                </Card>
              </CustomTooltip>
            ))}
          </div>
        </div>

        <Card className="p-6 bg-white border-t-4 border-t-blue-600">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandFilters(!expandFilters)}
          >
            <h2 className="text-lg font-bold text-gray-900">14 Filtros Avançados</h2>
            <span className={`text-2xl transition-transform ${expandFilters ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {expandFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <CustomTooltip content="Filtro por valor mínimo em USD">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min USD</label>
                  <input type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </CustomTooltip>
              <CustomTooltip content="Filtro por valor máximo em USD">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max USD</label>
                  <input type="number" placeholder="999M" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </CustomTooltip>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Stages</option>
                  <option>Pipelined</option>
                  <option>Pricing 25%</option>
                  <option>Up Selling 50%</option>
                  <option>Committed 75%</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Revenda</label>
                <input type="text" placeholder="Search..." className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fabricante</label>
                <input type="text" placeholder="Search..." className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Territory</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Territories</option>
                  <option>São Paulo</option>
                  <option>Rio de Janeiro</option>
                  <option>Minas Gerais</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Budgetary</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">CPO Date From</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">CPO Date To</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Close Date From</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Close Date To</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">BU</label>
                <input type="text" placeholder="Search..." className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2 flex gap-2 items-end">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition">
                  Filtrar
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 transition">
                  Limpar
                </button>
              </div>
            </div>
          )}
        </Card>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Primeiros 4 Gráficos Analíticos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Stage Distribution (USD)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mockData.stageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} height={80} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Top 10 Revendas</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mockData.topRevendas} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Territory Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={mockData.territoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {mockData.territoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={mockData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        <AdditionalCharts />
      </div>
    </div>
  );
}
