'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Breadcrumbs } from '@/components/common/breadcrumbs-tooltips';
import { HelpCircle, Layers, Star } from 'lucide-react';
import { useTour } from '@/hooks/useTour';
import { TourOverlay } from '@/components/common/tour-overlay';
import { getQuotes, getScenarioGroups, getPrimaryQuotes } from '@/lib/mock-store';

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
  {
    id: 'summary',
    selector: '[data-tour="summary-cards"]',
    title: 'Resumo Executivo',
    description: 'Cards com os três principais KPIs do pipeline: total em USD, valor committed (75%), e probabilidade média dos quotes.',
    position: 'bottom' as const,
    icon: 'Zap',
    callToAction: 'Clique em qualquer card para expandir e ver detalhes completos',
    proTip: 'Monitor o "Committed 75%": quanto maior, mais saudável o pipeline',
    nextStep: 'Próximo: alterne entre visão gráfica e tabular conforme sua análise',
  },
  {
    id: 'view-toggle',
    selector: '[data-tour="view-toggle"]',
    title: 'Alternar Visão: Gráficos vs Tabela',
    description: 'Use os botões no topo para trocar entre a visão de gráficos (análise rápida) e tabela (detalhes por quote).',
    position: 'bottom' as const,
    icon: 'Layers',
    callToAction: 'Clique no botão "Tabela" agora e veja a lista completa de quotes',
    proTip: 'Gráficos são melhores para executivos; Tabela é melhor para trabalho operacional',
    nextStep: 'Próximo: explore os gráficos comparativos por revenda e vendor',
  },
  {
    id: 'charts',
    selector: '[data-tour="manager-charts"]',
    title: 'Gráficos Comparativos',
    description: '4 visualizações: Pipeline por Revenda, por Vendor, Distribuição de Stage e Tendência Mensal com múltiplas linhas por estágio.',
    position: 'top' as const,
    icon: 'BarChart3',
    callToAction: 'Passe o mouse sobre os gráficos para ver valores exactos. Clique em legendas para mostrar/ocultar séries',
    proTip: 'Compare revendas: se uma está abaixo da média, ela pode precisar de suporte comercial',
    nextStep: 'Próximo: vire para tabela para editar quotes individuais',
  },
  {
    id: 'table',
    selector: '[data-tour="manager-table"]',
    title: 'Tabela de Quotes',
    description: 'Visão tabular com 25 quotes por página. Cada linha mostra CPO, Part No, Stage (com cor), Vendor, Cliente e Valor. Clique em uma linha para editar.',
    position: 'top' as const,
    icon: 'Table2',
    callToAction: 'Clique em qualquer linha da tabela para abrir o modal de edição completo',
    proTip: 'Ordene pelo Stage: identifique "Net Lost" para análise pós-mortem de oportunidades perdidas',
    nextStep: 'Próximo: use os controles de paginação para navegar entre as 85 quotes',
  },
  {
    id: 'pagination',
    selector: '[data-tour="manager-pagination"]',
    title: 'Navegação entre Páginas',
    description: 'Controles de paginação na base da tabela. Navigate entre as 85 quotes em blocos de 25 por página.',
    position: 'top' as const,
    icon: 'ChevronRight',
    callToAction: 'Clique em "Próxima" ou selecione a página que deseja ver',
    proTip: 'Use Search/Filter na barra de navegação para saltar direto para uma quote específica',
    nextStep: 'Perfeito! Você dominou o Pipeline Manager. Visite Details para análises avançadas.',
  },
];

export default function PipelineManagerPage() {
  const [view, setView] = useState<'charts' | 'table'>('charts');
  const tour = useTour(MANAGER_TOUR_STEPS, 'manager-tour');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Listen to sidebar feature actions
  useEffect(() => {
    const handleFeatureAction = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action } = customEvent.detail;
      
      if (action === 'tour') {
        tour.startTour();
      } else if (action === 'filters') {
        // Open filters modal (if implemented)
      } else if (action === 'view-list') {
        setView('charts');
      } else if (action === 'view-cards') {
        // Cards view functionality (if implemented)
      } else if (action === 'view-kanban') {
        // Kanban view functionality (if implemented)
      } else if (action === 'export') {
        // Trigger export
      }
    };

    window.addEventListener('sidebar-feature-action', handleFeatureAction);
    return () => window.removeEventListener('sidebar-feature-action', handleFeatureAction);
  }, [tour]);

  // ── Real store data ────────────────────────────────────────────────────────
  const allQuotes = useMemo(() => getQuotes(), []);
  const groups = useMemo(() => getScenarioGroups(), []);
  // KPIs use only primary quotes (non-primary scenarios excluded)
  const primaryQuotes = useMemo(() => getPrimaryQuotes(allQuotes), [allQuotes]);

  const totalPages = Math.ceil(allQuotes.length / pageSize);
  const paginatedQuotes = allQuotes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // KPIs — derived from primary quotes to avoid inflating the pipeline
  const totalUsd = primaryQuotes.reduce((s, q) => s + q.usd_value, 0);
  const committed = primaryQuotes.filter(q => q.stage === 'Committed 75%').reduce((s, q) => s + q.usd_value, 0);
  const avgProb = primaryQuotes.length ? Math.round(primaryQuotes.reduce((s, q) => s + q.probability, 0) / primaryQuotes.length) : 0;

  // Real chart data from store
  const revendasData = useMemo(() => {
    const map: Record<string, number> = {};
    primaryQuotes.forEach(q => { map[q.master_customer] = (map[q.master_customer] ?? 0) + q.usd_value; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [primaryQuotes]);

  const vendorsData = useMemo(() => {
    const map: Record<string, number> = {};
    primaryQuotes.forEach(q => { map[q.vendor] = (map[q.vendor] ?? 0) + q.usd_value; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [primaryQuotes]);

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
        </div>
        <div data-tour="summary-cards" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Quotes Totais</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{allQuotes.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{primaryQuotes.length} no pipeline</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-emerald-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total USD</p>
            <p className="text-xl font-bold text-gray-900 mt-1">${(totalUsd / 1_000_000).toFixed(1)}M</p>
            <p className="text-[10px] text-gray-400 mt-0.5">cenarios principais</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-violet-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Committed</p>
            <p className="text-xl font-bold text-gray-900 mt-1">${(committed / 1_000_000).toFixed(1)}M</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-amber-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Prob Media</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{avgProb}%</p>
          </div>
          {groups.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-violet-400 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-violet-500" />
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Cenarios</p>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{groups.length} grupos</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{groups.reduce((s, g) => s + g.scenarios.length, 0)} quotes agrupadas</p>
            </div>
          )}
        </div>

        {/* Charts view */}
        {view === 'charts' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Volume por Revenda</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Apenas cenarios principais</p>
                  </div>
                  <span className="text-xs text-gray-400">Top 5</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={revendasData} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `$${(v/1_000_000).toFixed(1)}M`} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip formatter={(value) => [`$${(Number(value) / 1_000_000).toFixed(1)}M`, 'USD']} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Volume por Fabricante</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Apenas cenarios principais</p>
                  </div>
                  <span className="text-xs text-gray-400">USD</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={vendorsData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `$${(v/1_000_000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [`$${(Number(value) / 1_000_000).toFixed(1)}M`, 'USD']} />
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
                  {paginatedQuotes.map((q, idx) => {
                    const group = q.scenarioGroupId ? groups.find(g => g.id === q.scenarioGroupId) : null;
                    const scenarioMeta = group ? group.scenarios.find(s => s.quoteId === q.id) : null;
                    return (
                    <tr key={idx} className={`hover:bg-blue-50 transition-colors text-gray-900 ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}>
                      <td className="px-3 py-2.5 pl-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-blue-600 font-bold">{q.cpo_id}</span>
                          {group && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[9px] font-bold border border-violet-200" title={`Grupo: ${group.name}`}>
                              <Layers className="w-2.5 h-2.5" />
                              {scenarioMeta?.isPrimary && <Star className="w-2 h-2 fill-current" />}
                            </span>
                          )}
        </div>

        {/* Summary cards — KPIs from primary quotes only */}
                      </td>
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
                    );
                  })}
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
          onSkip={tour.skipTour}
          onNeverShow={tour.neverShowThisTourAgain}
          totalSteps={tour.totalSteps}
        />
      </div>
    </div>
  );
}
