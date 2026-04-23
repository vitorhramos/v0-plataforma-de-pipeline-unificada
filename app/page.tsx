import Link from 'next/link';
import {
  BarChart3,
  ArrowRightLeft,
  ListFilter,
  PlusCircle,
  Cog,
  ArrowRight,
  TrendingUp,
  Filter,
  Download,
  Pencil,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

export const metadata = {
  title: 'TD SYNNEX Pipeline UPP - Home',
  description: 'Unified Pipeline Platform',
};

const NAV_CARDS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    desc: 'KPIs executivos, graficos analiticos e visao consolidada do pipeline.',
    icon: BarChart3,
    color: 'bg-blue-600',
    textAccent: 'text-blue-600',
    borderAccent: 'hover:border-blue-300',
    stats: ['12 KPIs', '8 Graficos'],
  },
  {
    href: '/pipeline-manager',
    label: 'Manager',
    desc: 'Visao gerencial com tabelas comparativas e acoes de gerenciamento.',
    icon: ArrowRightLeft,
    color: 'bg-teal-600',
    textAccent: 'text-teal-600',
    borderAccent: 'hover:border-teal-300',
    stats: ['Visao comparativa', 'Acoes em lote'],
  },
  {
    href: '/pipeline-details',
    label: 'Details',
    desc: 'Tabela completa com 15 colunas, filtros avancados, ordenacao e exportacao.',
    icon: ListFilter,
    color: 'bg-blue-600',
    textAccent: 'text-blue-600',
    borderAccent: 'hover:border-blue-300',
    stats: ['15 Colunas', 'Export CSV'],
  },
  {
    href: '/quote-details',
    label: 'New Quote',
    desc: 'Crie um novo quote com todos os campos e ele aparece automaticamente em Details.',
    icon: PlusCircle,
    color: 'bg-teal-600',
    textAccent: 'text-teal-600',
    borderAccent: 'hover:border-teal-300',
    stats: ['Criacao rapida', 'Sync automatico'],
  },
  {
    href: '/batch-process',
    label: 'Process',
    desc: 'Processamento em lote de quotes com regras de negocio e automacoes.',
    icon: Cog,
    color: 'bg-gray-700',
    textAccent: 'text-gray-700',
    borderAccent: 'hover:border-gray-300',
    stats: ['Processamento', 'Automacao'],
  },
];

const HIGHLIGHTS = [
  {
    icon: Filter,
    label: 'Filtros persistidos na URL',
    desc: 'Compartilhe links com filtros ja aplicados com qualquer pessoa do time.',
  },
  {
    icon: Pencil,
    label: 'Edicao individual e em lote',
    desc: 'Edite um quote ou selecione centenas e atualize um campo de uma vez so.',
  },
  {
    icon: RotateCcw,
    label: 'Desfazer edicoes',
    desc: 'Undo com um clique. As ultimas 10 acoes em lote podem ser desfeitas.',
  },
  {
    icon: Download,
    label: 'Exportacao CSV real',
    desc: 'Exporta exatamente os registros filtrados e ordenados da tabela.',
  },
  {
    icon: TrendingUp,
    label: 'Historico de versoes',
    desc: 'Cada alteracao em um quote fica gravada com timestamp para auditoria.',
  },
  {
    icon: ShieldCheck,
    label: 'Confirmacao de operacoes criticas',
    desc: 'Edicoes em lote exigem confirmacao com resumo do impacto antes de aplicar.',
  },
];

const STATS = [
  { val: '543', label: 'Quotes ativos' },
  { val: '$130M', label: 'Pipeline total' },
  { val: '68%', label: 'Win rate' },
  { val: '85', label: 'Registros mock' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">

      {/* ── Hero ── */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
        {/* Blue glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-20">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">U</div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">TD SYNNEX &mdash; Pipeline UPP</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-balance mb-5">
            Unified Pipeline<br />
            <span className="text-blue-400">Platform</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed mb-10">
            Visibilidade total do pipeline comercial — do KPI executivo a edicao em massa, tudo em um lugar.
          </p>

          <div className="flex flex-wrap gap-8">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-white tabular-nums">{s.val}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nav cards ── */}
      <section className="max-w-6xl mx-auto w-full px-6 sm:px-10 lg:px-16 -mt-5 mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {NAV_CARDS.map(({ href, label, desc, icon: Icon, color, textAccent, borderAccent, stats }) => (
            <Link key={href} href={href} className="group">
              <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 ${borderAccent} p-5 h-full flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}>
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-h-0">
                  <h3 className={`text-sm font-bold ${textAccent} mb-1`}>{label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stats.map(s => (
                    <span key={s} className="text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-semibold ${textAccent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Acessar <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="max-w-6xl mx-auto w-full px-6 sm:px-10 lg:px-16 mb-14">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">O que esta implementado</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recursos que nao aparecem em print mas fazem diferenca no uso.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex gap-4 items-start">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="max-w-6xl mx-auto w-full px-6 sm:px-10 lg:px-16 mb-14">
        <div className="bg-gray-950 rounded-2xl px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3 className="text-base font-bold text-white">Pronto para comecar?</h3>
            <p className="text-sm text-gray-400 mt-1">Acesse o Details para explorar os dados com filtros e edicao em lote.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/pipeline-details"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
            >
              Ir para Details <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition"
            >
              Ver Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">U</div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pipeline UPP</span>
          </div>
          <p className="text-xs text-gray-400">TD SYNNEX &mdash; v2.0</p>
        </div>
      </footer>

    </div>
  );
}
