import Link from 'next/link';
import { BarChart3, ArrowRightLeft, ListFilter, Search, TrendingUp, SlidersHorizontal, PieChart, Table2 } from 'lucide-react';

export const metadata = {
  title: 'TD SYNNEX Pipeline UPP - Home',
  description: 'Unified Pipeline Platform',
};

const NAV_CARDS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    desc: 'KPIs executivos, graficos analiticos e filtros avancados em tempo real.',
    icon: BarChart3,
    accent: 'border-t-blue-500',
    iconBg: 'bg-blue-50 text-blue-600',
    tag: '12 KPIs · 8 Graficos',
  },
  {
    href: '/pipeline-manager',
    label: 'Manager',
    desc: 'Visao gerencial com tabelas, graficos e acoes de gerenciamento de quotes.',
    icon: ArrowRightLeft,
    accent: 'border-t-violet-500',
    iconBg: 'bg-violet-50 text-violet-600',
    tag: 'Graficos · Tabelas',
  },
  {
    href: '/pipeline-details',
    label: 'Details',
    desc: '19 campos de analise com busca em tempo real, exportacao CSV e Excel.',
    icon: ListFilter,
    accent: 'border-t-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600',
    tag: '19 Campos · Export',
  },
  {
    href: '/batch-query',
    label: 'Batch Query',
    desc: '13 filtros avancados para consulta e edicao em massa de quotes.',
    icon: Search,
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-50 text-amber-600',
    tag: '13 Filtros · Edicao em Massa',
  },
];

const FEATURES = [
  {
    count: '12',
    label: 'KPIs Executivos',
    desc: 'Pipelined, Pricing, Up Selling, Committed, Net Lost, Total USD e mais.',
    icon: TrendingUp,
    color: 'bg-blue-600',
  },
  {
    count: '14',
    label: 'Filtros Avancados',
    desc: 'Range USD, Stage, Revenda, Territory, Budgetary, Date Range.',
    icon: SlidersHorizontal,
    color: 'bg-violet-600',
  },
  {
    count: '8',
    label: 'Graficos Analiticos',
    desc: 'Stage Distribution, Top Revendas, Territory, Tendencia Mensal, Win Rate.',
    icon: PieChart,
    color: 'bg-amber-500',
  },
  {
    count: '19',
    label: 'Campos de Analise',
    desc: 'CPO ID, Part No, Vendor, USD Value, Probability, Close Date e outros.',
    icon: Table2,
    color: 'bg-emerald-600',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Hero */}
      <div className="bg-gray-900 text-white px-6 sm:px-10 lg:px-16 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">TD SYNNEX</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-balance mb-4">
            Unified Pipeline<br />
            <span className="text-blue-400">Platform</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl leading-relaxed mb-8">
            Gestao inteligente de pipeline comercial — visibilidade total, do KPI executivo a edicao em massa.
          </p>
          {/* Stats strip */}
          <div className="flex flex-wrap gap-6">
            {[
              { val: '543', label: 'Quotes ativos' },
              { val: '$130M', label: 'Pipeline total' },
              { val: '75%', label: 'Committed' },
              { val: '68%', label: 'Win rate' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav cards */}
      <div className="max-w-5xl mx-auto w-full px-6 sm:px-10 lg:px-16 -mt-6 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NAV_CARDS.map(({ href, label, desc, icon: Icon, accent, iconBg, tag }) => (
            <Link key={href} href={href}>
              <div className={`bg-white rounded-xl border border-gray-200 border-t-4 ${accent} p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col gap-3 cursor-pointer`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900">{label}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                </div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto w-full px-6 sm:px-10 lg:px-16 mb-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Funcionalidades Principais</h2>
            <p className="text-sm text-gray-500 mt-1">Tudo que voce precisa para gerenciar seu pipeline comercial.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(({ count, label, desc, icon: Icon, color }) => (
              <div key={label} className="flex gap-4 items-start">
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${color} flex flex-col items-center justify-center text-white`}>
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] font-bold leading-none">{count}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">U</div>
            <span className="text-sm font-semibold text-gray-700">Pipeline UPP</span>
          </div>
          <p className="text-xs text-gray-400">TD SYNNEX &mdash; v2.0</p>
        </div>
      </footer>
    </div>
  );
}

