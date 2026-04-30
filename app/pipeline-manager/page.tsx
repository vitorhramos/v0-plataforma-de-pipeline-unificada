'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Breadcrumbs } from '@/components/common/breadcrumbs-tooltips';
import { HelpCircle } from 'lucide-react';
import { useTour } from '@/hooks/useTour';
import { TourOverlay } from '@/components/common/tour-overlay';

const PART_PREFIXES = ['NX', 'HP', 'DL', 'CP', 'LN', 'ST', 'VX', 'AX'];
const USD_VALUES = [702000, 241000, 451000, 2348000, 1614000, 2301000, 890000, 340000, 1200000, 560000];
const AGES = [12, 34, 7, 56, 23, 45, 8, 67, 15, 30];
const CLOSE_DATES = ['2025-07-15', '2025-08-01', '2025-06-30', '2025-09-10', '2025-07-22', '2025-08-14', '2025-10-01', '2025-06-20', '2025-09-28', '2025-07-05'];
const STATUS_INFO: Record<string, { color: string; description: string }> = {
  S: { color: 'bg-emerald-100 text-emerald-800', description: 'Agendado' },
  N: { color: 'bg-gray-100 text-gray-600', description: 'Nao iniciado' },
  U: { color: 'bg-blue-100 text-blue-800', description: 'Atualizado' },
};

const STAGE_COLORS: Record<string, string> = {
  'Pipelined':      'bg-blue-100 text-blue-800',
  'Pricing 25%':    'bg-violet-100 text-violet-800',
  'Up Selling 50%': 'bg-amber-100 text-amber-800',
  'Committed 75%':  'bg-emerald-100 text-emerald-800',
  'Net Lost':       'bg-red-100 text-red-700',
};
const mockQuotes = Array.from({ length: 85 }, (_, i) => ({
  id: i + 1,
  cpo_id: `CPO-${String(i + 1001).padStart(4, '0').slice(-4)}`,
  part_no: `${PART_PREFIXES[i % PART_PREFIXES.length]}-${String(10000 + i * 137).slice(-5)}`,
  sales_territory: ['Sao Paulo', 'Rio de Janeiro', 'Minas Gerais'][i % 3],
  vendor: ['Cisco', 'HPE', 'Dell', 'Lenovo'][i % 4],
  master_customer: `Revenda ${String.fromCharCode(65 + (i % 5))}`,
  end_user: `Cliente ${i + 1} Ltda`,
  quote_name: `QT-${String(2024000 + i).slice(-6)}`,
  stage: ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'][i % 5],
  probability: [20, 40, 60, 80, 0][i % 5],
  usd_value: USD_VALUES[i % USD_VALUES.length],
  budgetary: i % 3 === 0 ? 'Yes' : 'No',
  close_date: CLOSE_DATES[i % CLOSE_DATES.length],
  bu: ['BU Storage', 'BU Network', 'BU Compute'][i % 3],
  quote_age: AGES[i % AGES.length],
  status: ['S', 'N', 'U'][i % 3],
}));

const mockData = {
  revendas: [
    { name: 'Revenda A', value: 24500000 },
    { name: 'Revenda B', value: 18900000 },
    { name: 'Revenda C', value: 15600000 },
    { name: 'Revenda D', value: 12300000 },
    { name: 'Revenda E', value: 10200000 },
  ],
  vendors: [
    { name: 'Vendor X', value: 35200000 },
    { name: 'Vendor Y', value: 28900000 },
    { name: 'Vendor Z', value: 15600000 },
  ],
  stageDistribution: [
    { name: 'Pricing', value: 32100000 },
    { name: 'Up Selling', value: 28900000 },
    { name: 'Committed', value: 18500000 },
  ],
  monthlyTrend: [
    { name: 'Jan', committed: 5200000, upselling: 8900000, pricing: 12500000 },
    { name: 'Feb', committed: 6100000, upselling: 9800000, pricing: 13200000 },
    { name: 'Mar', committed: 5800000, upselling: 9200000, pricing: 12600000 },
    { name: 'Apr', committed: 7200000, upselling: 10500000, pricing: 14800000 },
    { name: 'May', committed: 8100000, upselling: 11300000, pricing: 15200000 },
    { name: 'Jun', committed: 9500000, upselling: 12800000, pricing: 16000000 },
  ],
};

const MANAGER_TOUR_STEPS = [
  { id: 'summary', selector: '[data-tour="summary-cards"]', title: 'Resumo Executivo', description: 'Cards com os tres principais KPIs: pipeline total, valor committed e probabilidade media.', position: 'bottom' as const },
  { id: 'view-toggle', selector: '[data-tour="view-toggle"]', title: 'Alternar entre Graficos e Tabela', description: 'Alterne entre a visao grafica para analise visual e a visao tabular para inspecionar cada quote.', position: 'bottom' as const },
  { id: 'charts', selector: '[data-tour="manager-charts"]', title: 'Graficos Comparativos', description: 'Pipeline por Revenda, Vendor, distribuicao de Stage e tendencia mensal com multiplas linhas por estagio.', position: 'top' as const },
  { id: 'table', selector: '[data-tour="manager-table"]', title: 'Tabela de Quotes', description: 'Visao tabular com paginacao. Cada linha tem badge de stage colorido e indicador de status.', position: 'top' as const },
  { id: 'pagination', selector: '[data-tour="manager-pagination"]', title: 'Paginacao', description: 'Navegue entre as paginas de quotes com os controles de pagina.', position: 'top' as const },
];

export default function PipelineManagerPage() {
  const [view, setView] = useState<'charts' | 'table'>('charts');
  const tour = useTour(MANAGER_TOUR_STEPS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const totalPages = Math.ceil(mockQuotes.length / pageSize);
  const paginatedQuotes = mockQuotes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalUsd = mockQuotes.reduce((s, q) => s + q.usd_value, 0);
  const committed = mockQuotes.filter(q => q.stage === 'Committed 75%').reduce((s, q) => s + q.usd_value, 0);
  const avgProb = Math.round(mockQuotes.reduce((s, q) => s + q.probability, 0) / mockQuotes.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <Breadcrumbs items={[{ label: 'Pipeline Manager' }]} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Manager</h1>
            <p className="text-sm text-gray-500 mt-0.5">Graficos e tabela de 85 quotes ativos.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={tour.startTour}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-sm shadow-sm"
            >
              <HelpCircle className="w-4 h-4" />
              Iniciar Tour
            </button>
          {/* View toggle */}
          <div data-tour="view-toggle" className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setView('charts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                view === 'charts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Graficos
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                view === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 4v16M3 6a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" /></svg>
              Tabela
            </button>
          </div>
          </div>
          </div>
        </div>

        {/* Summary cards */}
        <div data-tour="summary-cards" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Quotes</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{mockQuotes.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-emerald-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total USD</p>
            <p className="text-xl font-bold text-gray-900 mt-1">${(totalUsd / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-violet-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Committed</p>
            <p className="text-xl font-bold text-gray-900 mt-1">${(committed / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-amber-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Prob Media</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{avgProb}%</p>
          </div>
        </div>

        {/* Charts view */}
        {view === 'charts' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Volume por Revenda</h3>
                  <span className="text-xs text-gray-400">Top 5</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={mockData.revendas} layout="vertical" barSize={16}>
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
                  <h3 className="text-sm font-semibold text-gray-900">Volume por Fabricante</h3>
                  <span className="text-xs text-gray-400">USD</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={mockData.vendors} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`, 'USD']} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Distribuicao de Stages — Ultimos 6 Meses</h3>
                <span className="text-xs text-emerald-600 font-semibold">Committed em alta</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={mockData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`]} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="committed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} name="Committed 75%" />
                  <Line type="monotone" dataKey="upselling" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} name="Up Selling 50%" />
                  <Line type="monotone" dataKey="pricing" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} name="Pricing 25%" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Table view */}
        {view === 'table' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <p className="text-xs text-gray-500">
                Mostrando <span className="font-semibold text-gray-700">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, mockQuotes.length)}</span> de <span className="font-semibold text-gray-700">{mockQuotes.length}</span> registros
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1400px] w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['CPO ID','Part No','Territory','Vendor','Revenda','End User','Quote Name','Stage','Prob','USD','Budget','Close Date','Age','Status','BU'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap first:pl-5 last:pr-5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedQuotes.map((q, idx) => (
                    <tr key={idx} className={`hover:bg-blue-50 transition-colors text-gray-900 ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}>
                      <td className="px-3 py-2.5 pl-5 font-mono text-blue-600 font-bold whitespace-nowrap">{q.cpo_id}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-700 whitespace-nowrap">{q.part_no}</td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{q.sales_territory}</td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{q.vendor}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{q.master_customer}</td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{q.end_user}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{q.quote_name}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STAGE_COLORS[q.stage] ?? 'bg-gray-100 text-gray-700'}`}>{q.stage}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-gray-800">{q.probability}%</td>
                      <td className="px-3 py-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">${(q.usd_value / 1000).toFixed(0)}K</td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${q.budgetary === 'Yes' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>{q.budgetary}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{q.close_date}</td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={`font-semibold ${q.quote_age > 30 ? 'text-red-600' : 'text-gray-700'}`}>{q.quote_age}d</span>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_INFO[q.status]?.color ?? ''}`}>{q.status}</span>
                      </td>
                      <td className="px-3 py-2.5 pr-5 text-gray-600 whitespace-nowrap text-[11px]">{q.bu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">Pagina {currentPage} de {totalPages}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                  if (page > totalPages) return null;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
                      {page}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Proximo
                </button>
              </div>
            </div>
          </div>
        )}
      <TourOverlay
        isActive={tour.isTourActive}
        currentStep={tour.currentStep}
        steps={MANAGER_TOUR_STEPS}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onClose={tour.closeTour}
        totalSteps={tour.totalSteps}
      />
    </div>
  );
}
