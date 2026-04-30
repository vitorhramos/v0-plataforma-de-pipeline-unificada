'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Breadcrumbs, Tooltip as CustomTooltip } from '@/components/common/breadcrumbs-tooltips';
import { AdditionalCharts } from '@/components/common/additional-charts';
import { useKeyboardShortcuts } from '@/components/common/keyboard-shortcuts';
import { HelpCircle } from 'lucide-react';
import { useTour } from '@/hooks/useTour';
import { TourOverlay } from '@/components/common/tour-overlay';

// KPI accent colors per index
const KPI_COLORS = [
  'border-l-blue-500',
  'border-l-violet-500',
  'border-l-amber-500',
  'border-l-emerald-500',
  'border-l-red-500',
  'border-l-cyan-500',
  'border-l-orange-500',
  'border-l-sky-500',
  'border-l-teal-500',
  'border-l-rose-500',
  'border-l-indigo-500',
  'border-l-green-500',
];

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

const mockData = {
  kpis: [
    { label: 'Pipelined', value: '125', unit: '$45.2M', trend: '+15%' },
    { label: 'Pricing 25%', value: '89', unit: '$32.1M', trend: '+8%' },
    { label: 'Up Selling 50%', value: '56', unit: '$28.9M', trend: '+12%' },
    { label: 'Committed 75%', value: '34', unit: '$18.5M', trend: '+22%' },
    { label: 'Net Lost', value: '12', unit: '$5.2M', trend: '-5%' },
    { label: 'Total USD', value: '316', unit: '$130.0M', trend: '+10%' },
    { label: 'Budgetary', value: '87 quotes', unit: '$45.3M', trend: '+18%' },
    { label: 'Quote Count', value: 'total', unit: '543', trend: '+7%' },
    { label: 'Avg USD', value: 'por quote', unit: '$239K', trend: '+3%' },
    { label: 'Min USD', value: 'menor deal', unit: '$50K', trend: '-2%' },
    { label: 'Max USD', value: 'maior deal', unit: '$2.5M', trend: '+15%' },
    { label: 'Win Rate', value: 'taxa de ganho', unit: '68%', trend: '+5%' },
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

const DASHBOARD_TOUR_STEPS = [
  { id: 'kpis', selector: '[data-tour="kpi-grid"]', title: 'KPIs Executivos', description: 'Cards com os principais indicadores do pipeline. Passe o mouse em cada card para ver o detalhamento. As cores das bordas diferenciam cada estagio.', position: 'bottom' as const },
  { id: 'filters', selector: '[data-tour="dash-filters-btn"]', title: 'Filtros Rapidos', description: 'Filtre os dados por Stage, Territory, Vendor e BU. Os graficos e KPIs atualizam em tempo real. Atalho: Ctrl+F.', position: 'bottom' as const },
  { id: 'bar-chart', selector: '[data-tour="bar-chart"]', title: 'Grafico de Barras por Stage', description: 'Visualize o valor total ($) e a quantidade de quotes agrupados por estagio do pipeline.', position: 'top' as const },
  { id: 'line-chart', selector: '[data-tour="line-chart"]', title: 'Evolucao Mensal', description: 'Acompanhe a evolucao do pipeline mes a mes com a tendencia de crescimento.', position: 'top' as const },
  { id: 'pie-chart', selector: '[data-tour="pie-chart"]', title: 'Distribuicao por Vendor', description: 'Proporcao de participacao de cada fabricante no pipeline total.', position: 'top' as const },
  { id: 'additional', selector: '[data-tour="additional-charts"]', title: 'Graficos Adicionais', description: 'Analises complementares por territorio, BU e evolucao historica de win rate.', position: 'top' as const },
];

export default function DashboardPage() {
  const [expandFilters, setExpandFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const tour = useTour(DASHBOARD_TOUR_STEPS);

  useKeyboardShortcuts({
    export: () => alert('Exportando dados...'),
    filter: () => setExpandFilters(!expandFilters),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Executivo</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Pipeline em tempo real. Pressione{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-600">Ctrl+F</kbd>{' '}
              para abrir filtros.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={tour.startTour}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-sm shadow-sm"
            >
              <HelpCircle className="w-4 h-4" />
              Iniciar Tour
            </button>
            <button
              onClick={() => setExpandFilters(!expandFilters)}
              data-tour="dash-filters-btn"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                expandFilters
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtros
            {activeFilters.length > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div data-tour="kpi-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {mockData.kpis.map((kpi, idx) => (
            <CustomTooltip key={idx} content={`${kpi.value} quotes — ${kpi.trend} vs. mes anterior`}>
              <div className={`bg-white rounded-xl border-l-4 ${KPI_COLORS[idx]} border border-gray-200 px-4 py-3 hover:shadow-md transition cursor-help group`}>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide truncate leading-none mb-2">{kpi.label}</p>
                <p className="text-lg font-bold text-gray-900 leading-none">{kpi.unit}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-gray-400">{kpi.value}</span>
                  <span className={`text-[11px] font-semibold ${kpi.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                    {kpi.trend}
                  </span>
                </div>
              </div>
            </CustomTooltip>
          ))}
        </div>

        {/* Filters panel */}
        {expandFilters && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">14 Filtros Avancados</h2>
              <button
                onClick={() => setExpandFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Fechar filtros"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: 'Min USD', type: 'number', placeholder: '0' },
                { label: 'Max USD', type: 'number', placeholder: '999M' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stage</label>
                <select className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Todos</option>
                  <option>Pipelined</option>
                  <option>Pricing 25%</option>
                  <option>Up Selling 50%</option>
                  <option>Committed 75%</option>
                  <option>Net Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Territory</label>
                <select className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Todos</option>
                  <option>Sao Paulo</option>
                  <option>Rio de Janeiro</option>
                  <option>Minas Gerais</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Revenda</label>
                <input type="text" placeholder="Buscar..." className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fabricante</label>
                <input type="text" placeholder="Buscar..." className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Budgetary</label>
                <select className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Todos</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">BU</label>
                <input type="text" placeholder="Buscar..." className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CPO Date De</label>
                <input type="date" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CPO Date Ate</label>
                <input type="date" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Close Date De</label>
                <input type="date" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Close Date Ate</label>
                <input type="date" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Todos</option>
                  <option>S</option>
                  <option>N</option>
                  <option>U</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sales Team</label>
                <input type="text" placeholder="Buscar..." className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200">
              <button className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Limpar
              </button>
              <button className="px-5 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Charts */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Graficos Analiticos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div data-tour="bar-chart" className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Stage Distribution</h3>
                <span className="text-xs text-gray-400 font-medium">USD</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={mockData.stageData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" angle={-30} height={60} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`, 'USD']} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Top Revendas</h3>
                <span className="text-xs text-gray-400 font-medium">por valor</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={mockData.topRevendas} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`, 'USD']} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Territorio</h3>
                <span className="text-xs text-gray-400 font-medium">distribuicao</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={mockData.territoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40}>
                    {mockData.territoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${(Number(value) / 1000000).toFixed(1)}M`} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div data-tour="line-chart" className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Tendencia Mensal</h3>
                <span className="text-xs text-emerald-600 font-semibold">+18.8%</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={mockData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`, 'Pipeline']} />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div data-tour="additional-charts">
          <AdditionalCharts />
        </div>
      </div>

      <TourOverlay
        isActive={tour.isTourActive}
        currentStep={tour.currentStep}
        steps={DASHBOARD_TOUR_STEPS}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onClose={tour.closeTour}
        totalSteps={tour.totalSteps}
      />
    </div>
  );
}
