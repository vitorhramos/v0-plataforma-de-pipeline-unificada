'use client';

import Link from 'next/link';
import { useState } from 'react';

const USD_VALUES = [702000, 241000, 451000, 2348000, 1614000, 2301000, 890000, 340000, 1200000, 560000];
const VENDORS = ['Cisco', 'HPE', 'Dell', 'Lenovo'];
const TERRITORIES = ['Sao Paulo', 'Rio de Janeiro', 'Minas Gerais'];
const TEAMS = ['Team Alpha', 'Team Beta', 'Team Gamma'];

const mockQuotes = Array.from({ length: 543 }, (_, i) => ({
  id: i + 1,
  cpo_id: `CPO-${String(i + 1001).padStart(4, '0').slice(-4)}`,
  quote_number: `QT-${String(i + 1001).padStart(4, '0').slice(-4)}`,
  revenda: `Revenda ${String.fromCharCode(65 + (i % 5))}`,
  end_user: `Cliente ${i + 1} Ltda`,
  vendor: VENDORS[i % VENDORS.length],
  territory: TERRITORIES[i % TERRITORIES.length],
  team: TEAMS[i % TEAMS.length],
  stage: ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'][i % 5],
  usd_value: USD_VALUES[i % USD_VALUES.length],
  probability: [20, 40, 60, 80, 0][i % 5],
  is_budgetary: i % 3 === 0,
  close_date: ['2025-07-15', '2025-08-01', '2025-06-30', '2025-09-10'][i % 4],
}));

const STAGE_COLORS: Record<string, string> = {
  'Pipelined': 'bg-blue-100 text-blue-800',
  'Pricing 25%': 'bg-violet-100 text-violet-800',
  'Up Selling 50%': 'bg-amber-100 text-amber-800',
  'Committed 75%': 'bg-emerald-100 text-emerald-800',
  'Net Lost': 'bg-red-100 text-red-700',
};

const EMPTY_FILTERS = {
  quote_number: '', stage: '', revenda: '', vendor: '',
  territory: '', team: '', min_usd: '', max_usd: '',
  min_prob: '', max_prob: '', budgetary: '',
  close_date_from: '', close_date_to: '',
};

export default function BatchQueryPage() {
  const [queried, setQueried] = useState(false);
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [applied, setApplied] = useState({ ...EMPTY_FILTERS });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const set = (key: string, val: string) => setFilters((p) => ({ ...p, [key]: val }));

  const filteredQuotes = queried ? mockQuotes.filter(q => {
    if (applied.quote_number && !q.quote_number.toLowerCase().includes(applied.quote_number.toLowerCase())) return false;
    if (applied.stage && q.stage !== applied.stage) return false;
    if (applied.revenda && !q.revenda.toLowerCase().includes(applied.revenda.toLowerCase())) return false;
    if (applied.vendor && q.vendor !== applied.vendor) return false;
    if (applied.territory && q.territory !== applied.territory) return false;
    if (applied.team && q.team !== applied.team) return false;
    if (applied.min_usd && q.usd_value < parseInt(applied.min_usd)) return false;
    if (applied.max_usd && q.usd_value > parseInt(applied.max_usd)) return false;
    if (applied.min_prob && q.probability < parseInt(applied.min_prob)) return false;
    if (applied.max_prob && q.probability > parseInt(applied.max_prob)) return false;
    if (applied.budgetary === 'yes' && !q.is_budgetary) return false;
    if (applied.budgetary === 'no' && q.is_budgetary) return false;
    return true;
  }) : [];

  const paginatedQuotes = filteredQuotes.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredQuotes.length / pageSize);
  const totalUsd = filteredQuotes.reduce((sum, q) => sum + q.usd_value, 0);
  const avgProb = filteredQuotes.length > 0
    ? Math.round(filteredQuotes.reduce((sum, q) => sum + q.probability, 0) / filteredQuotes.length)
    : 0;

  const activeFilterLabels = Object.entries(applied)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => ({ key: k, val: v }));

  const inputCls = 'w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Home
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-bold text-gray-900">Batch Query</h1>
          </div>
          <div className="flex gap-2">
            {[['Dashboard', '/dashboard'], ['Details', '/pipeline-details'], ['Manager', '/pipeline-manager']].map(([label, href]) => (
              <Link key={href} href={href} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* Filter Panel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">13 Filtros de Consulta</h2>
            </div>
            {activeFilterLabels.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeFilterLabels.map(({ key, val }) => (
                  <span key={key} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                    {val}
                    <button
                      onClick={() => {
                        const next = { ...applied, [key]: '' };
                        setApplied(next);
                        setFilters(next);
                      }}
                      className="hover:text-blue-900 ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Row 1: Identificacao */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Identificacao</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>Quote Number</label>
                  <input type="text" placeholder="QT-1001" value={filters.quote_number} onChange={(e) => set('quote_number', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Stage</label>
                  <select value={filters.stage} onChange={(e) => set('stage', e.target.value)} className={inputCls}>
                    <option value="">Todos</option>
                    {['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Revenda</label>
                  <input type="text" placeholder="Revenda A" value={filters.revenda} onChange={(e) => set('revenda', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Vendor</label>
                  <select value={filters.vendor} onChange={(e) => set('vendor', e.target.value)} className={inputCls}>
                    <option value="">Todos</option>
                    {VENDORS.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Row 2: Valores */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Valores e Probabilidade</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>Min USD</label>
                  <input type="number" placeholder="50 000" value={filters.min_usd} onChange={(e) => set('min_usd', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Max USD</label>
                  <input type="number" placeholder="2 500 000" value={filters.max_usd} onChange={(e) => set('max_usd', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Min Prob %</label>
                  <input type="number" min="0" max="100" placeholder="0" value={filters.min_prob} onChange={(e) => set('min_prob', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Max Prob %</label>
                  <input type="number" min="0" max="100" placeholder="100" value={filters.max_prob} onChange={(e) => set('max_prob', e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Row 3: Localizacao e outros */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Localizacao e Classificacao</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className={labelCls}>Territory</label>
                  <select value={filters.territory} onChange={(e) => set('territory', e.target.value)} className={inputCls}>
                    <option value="">Todos</option>
                    {TERRITORIES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Team</label>
                  <select value={filters.team} onChange={(e) => set('team', e.target.value)} className={inputCls}>
                    <option value="">Todos</option>
                    {TEAMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Budgetary</label>
                  <select value={filters.budgetary} onChange={(e) => set('budgetary', e.target.value)} className={inputCls}>
                    <option value="">Todos</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Close Date De</label>
                  <input type="date" value={filters.close_date_from} onChange={(e) => set('close_date_from', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Close Date Ate</label>
                  <input type="date" value={filters.close_date_to} onChange={(e) => set('close_date_to', e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions footer */}
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => { setFilters({ ...EMPTY_FILTERS }); setApplied({ ...EMPTY_FILTERS }); setQueried(false); setCurrentPage(1); }}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Limpar
            </button>
            <button
              onClick={() => { setApplied({ ...filters }); setQueried(true); setCurrentPage(1); }}
              className="px-6 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              Consultar
            </button>
          </div>
        </div>

        {/* Summary cards */}
        {queried && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Resultados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredQuotes.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-emerald-500 px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total USD</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${(totalUsd / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-violet-500 px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Prob Media</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{avgProb}%</p>
            </div>
          </div>
        )}

        {/* Results table */}
        {queried && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">
                {filteredQuotes.length > 0
                  ? `Mostrando ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredQuotes.length)} de ${filteredQuotes.length} registros`
                  : 'Nenhum registro encontrado'}
              </h3>
            </div>

            {filteredQuotes.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-bold text-gray-600 whitespace-nowrap">CPO ID</th>
                        <th className="px-4 py-2.5 text-left font-bold text-gray-600 whitespace-nowrap">Quote #</th>
                        <th className="px-4 py-2.5 text-left font-bold text-gray-600 whitespace-nowrap">Revenda</th>
                        <th className="px-4 py-2.5 text-left font-bold text-gray-600 whitespace-nowrap">End User</th>
                        <th className="px-4 py-2.5 text-left font-bold text-gray-600 whitespace-nowrap">Vendor</th>
                        <th className="px-4 py-2.5 text-left font-bold text-gray-600 whitespace-nowrap">Stage</th>
                        <th className="px-4 py-2.5 text-right font-bold text-gray-600 whitespace-nowrap">USD</th>
                        <th className="px-4 py-2.5 text-center font-bold text-gray-600 whitespace-nowrap">Prob</th>
                        <th className="px-4 py-2.5 text-center font-bold text-gray-600 whitespace-nowrap">Budget</th>
                        <th className="px-4 py-2.5 text-left font-bold text-gray-600 whitespace-nowrap">Close Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedQuotes.map((q, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50 transition text-gray-900">
                          <td className="px-4 py-2.5 font-mono text-blue-600 font-bold whitespace-nowrap">{q.cpo_id}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{q.quote_number}</td>
                          <td className="px-4 py-2.5 text-gray-800 whitespace-nowrap">{q.revenda}</td>
                          <td className="px-4 py-2.5 text-gray-800 whitespace-nowrap">{q.end_user}</td>
                          <td className="px-4 py-2.5 text-gray-800 whitespace-nowrap">{q.vendor}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded font-semibold text-xs ${STAGE_COLORS[q.stage] ?? 'bg-gray-100 text-gray-700'}`}>{q.stage}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">${(q.usd_value / 1000).toFixed(0)}K</td>
                          <td className="px-4 py-2.5 text-center font-semibold text-gray-900">{q.probability}%</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${q.is_budgetary ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                              {q.is_budgetary ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-800 whitespace-nowrap">{q.close_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Pagina {currentPage} de {totalPages}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Proximo
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">Nenhum resultado encontrado</p>
                <p className="text-xs text-gray-400 mt-1">Ajuste os filtros e consulte novamente</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
