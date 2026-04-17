'use client';

import { useState } from 'react';
import { Breadcrumbs, Tooltip } from '@/components/common/breadcrumbs-tooltips';
import { useOperationHistory } from '@/components/common/operation-history';
import { useToast } from '@/components/common/toast';

// deterministic pseudo-random based on seed to avoid hydration mismatch
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const PART_PREFIXES = ['NX', 'HP', 'DL', 'CP', 'LN', 'ST', 'VX', 'AX'];
const USD_VALUES = [702000, 241000, 451000, 2348000, 1614000, 2301000, 890000, 340000, 1200000, 560000];
const AGES = [12, 34, 7, 56, 23, 45, 8, 67, 15, 30];
const CLOSE_DATES = ['2025-07-15', '2025-08-01', '2025-06-30', '2025-09-10', '2025-07-22', '2025-08-14', '2025-10-01', '2025-06-20', '2025-09-28', '2025-07-05'];

const mockQuotes = Array.from({ length: 85 }, (_, i) => ({
  id: i + 1,
  cpo_id: `CPO-${String(i + 1001).padStart(4, '0').slice(-4)}`,
  part_no: `${PART_PREFIXES[i % PART_PREFIXES.length]}-${String(10000 + i * 137).slice(-5)}`,
  sales_territory: ['Sao Paulo', 'Rio de Janeiro', 'Minas Gerais'][i % 3],
  team: ['Team Alpha', 'Team Beta', 'Team Gamma'][i % 3],
  vendor: ['Cisco', 'HPE', 'Dell', 'Lenovo'][i % 4],
  master_customer: `Revenda ${String.fromCharCode(65 + (i % 5))}`,
  end_user: `Cliente ${i + 1} Ltda`,
  description: `Solucao ${PART_PREFIXES[i % PART_PREFIXES.length]} Enterprise`,
  quote_name: `QT-${String(2024000 + i).slice(-6)}`,
  quote_number: `QN-${String(i + 1001).padStart(4, '0').slice(-4)}`,
  stage: ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'][i % 5],
  probability: [20, 40, 60, 80, 0][i % 5],
  usd_value: USD_VALUES[i % USD_VALUES.length],
  budgetary: i % 3 === 0 ? 'Yes' : 'No',
  close_date: CLOSE_DATES[i % CLOSE_DATES.length],
  bu: ['BU Storage', 'BU Network', 'BU Compute'][i % 3],
  quote_age: AGES[i % AGES.length],
  status: ['S', 'N', 'U'][i % 3],
}));

const STATUS_INFO: Record<string, { color: string; description: string }> = {
  S: { color: 'bg-emerald-100 text-emerald-800', description: 'Agendado para processamento' },
  N: { color: 'bg-gray-100 text-gray-600', description: 'Nao iniciado' },
  U: { color: 'bg-blue-100 text-blue-800', description: 'Atualizado recentemente' },
};

const STAGE_COLORS: Record<string, string> = {
  'Pipelined':      'bg-blue-100 text-blue-800',
  'Pricing 25%':    'bg-violet-100 text-violet-800',
  'Up Selling 50%': 'bg-amber-100 text-amber-800',
  'Committed 75%':  'bg-emerald-100 text-emerald-800',
  'Net Lost':       'bg-red-100 text-red-700',
};

export default function PipelineDetailsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const { add: addToHistory } = useOperationHistory();
  const toast = useToast();

  const filteredQuotes = mockQuotes.filter(q =>
    q.quote_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.cpo_id.includes(searchTerm) ||
    q.part_no.includes(searchTerm)
  );

  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredQuotes.length / pageSize);

  const handleExport = (format: string) => {
    addToHistory('Export', `Exportado ${filteredQuotes.length} registros em ${format}`, 'success');
    toast.success(`Exportados ${filteredQuotes.length} registros em ${format}`);
  };

  const totalUsd = filteredQuotes.reduce((sum, q) => sum + q.usd_value, 0);
  const budgetaryCount = filteredQuotes.filter(q => q.budgetary === 'Yes').length;
  const avgProb = filteredQuotes.length > 0
    ? Math.round(filteredQuotes.reduce((s, q) => s + q.probability, 0) / filteredQuotes.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <Breadcrumbs items={[{ label: 'Pipeline' }, { label: 'Details' }]} />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Details</h1>
            <p className="text-sm text-gray-500 mt-0.5">19 campos de analise — busca em tempo real, paginacao e badges S/N/U.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip content="Exportar em CSV">
              <button
                onClick={() => handleExport('CSV')}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                CSV
              </button>
            </Tooltip>
            <Tooltip content="Exportar em Excel">
              <button
                onClick={() => handleExport('Excel')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-sm"
              >
                Excel
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Registros</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{filteredQuotes.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-emerald-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total USD</p>
            <p className="text-xl font-bold text-gray-900 mt-1">${(totalUsd / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-violet-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Prob Media</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{avgProb}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-amber-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Budgetary</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{budgetaryCount}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por Quote Name, CPO ID ou Part Number..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            )}
          </div>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value={25}>25 / pag</option>
            <option value={50}>50 / pag</option>
            <option value={100}>100 / pag</option>
          </select>
        </div>

        {/* Count */}
        <p className="text-xs text-gray-500">
          Mostrando <span className="font-semibold text-gray-700">{filteredQuotes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredQuotes.length)}</span> de <span className="font-semibold text-gray-700">{filteredQuotes.length}</span> registros
        </p>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1400px] w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">CPO ID</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Part No</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Territory</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Vendor</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Revenda</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">End User</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Quote Name</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Stage</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Prob</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">USD</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Budget</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Close Date</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Age</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">BU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="py-16 text-center">
                      <p className="text-sm font-medium text-gray-400">Nenhum resultado encontrado</p>
                      <p className="text-xs text-gray-400 mt-1">Tente outro termo de busca</p>
                    </td>
                  </tr>
                ) : paginatedQuotes.map((quote, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-blue-50 transition-colors text-gray-900 ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                  >
                    <td className="px-3 py-2.5 font-mono text-blue-600 font-bold whitespace-nowrap">{quote.cpo_id}</td>
                    <td className="px-3 py-2.5 font-mono text-gray-700 whitespace-nowrap">{quote.part_no}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{quote.sales_territory}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{quote.vendor}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{quote.master_customer}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{quote.end_user}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{quote.quote_name}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STAGE_COLORS[quote.stage] ?? 'bg-gray-100 text-gray-700'}`}>
                        {quote.stage}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-gray-800 whitespace-nowrap">{quote.probability}%</td>
                    <td className="px-3 py-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">
                      ${(quote.usd_value / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${quote.budgetary === 'Yes' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>
                        {quote.budgetary}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{quote.close_date}</td>
                    <td className="px-3 py-2.5 text-center text-gray-600 whitespace-nowrap">
                      <span className={`font-semibold ${quote.quote_age > 30 ? 'text-red-600' : 'text-gray-700'}`}>
                        {quote.quote_age}d
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <Tooltip content={STATUS_INFO[quote.status]?.description ?? ''}>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_INFO[quote.status]?.color ?? ''}`}>
                          {quote.status}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-[11px]">{quote.bu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination inside table card */}
          {filteredQuotes.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">Pagina {currentPage} de {totalPages}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
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
          )}
        </div>
      </div>
    </div>
  );
}
