'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
  S: { color: 'bg-green-100 text-green-800', description: 'Agendado para processamento' },
  N: { color: 'bg-gray-100 text-gray-800', description: 'Nao iniciado' },
  U: { color: 'bg-blue-100 text-blue-800', description: 'Atualizado recentemente' },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs items={[{ label: 'Pipeline' }, { label: 'Details' }]} />

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pipeline Details</h1>
          <p className="text-gray-600 text-sm">
            19 campos de analise. Busca em tempo real, paginacao inteligente e Status badges S/N/U.
          </p>
        </div>

        <Card className="p-6 bg-white border-t-4 border-t-amber-600">
          <div className="flex gap-4 flex-col md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Busca</label>
              <input
                type="text"
                placeholder="Buscar por Quote Name, CPO ID ou Part Number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Tooltip content="Exportar em CSV">
              <button
                onClick={() => handleExport('CSV')}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition"
              >
                CSV
              </button>
            </Tooltip>
            <Tooltip content="Exportar em Excel">
              <button
                onClick={() => handleExport('Excel')}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition"
              >
                Excel
              </button>
            </Tooltip>
          </div>
        </Card>

        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Mostrando {filteredQuotes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            -{Math.min(currentPage * pageSize, filteredQuotes.length)} de {filteredQuotes.length} registros
          </p>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={25}>25 por pagina</option>
            <option value={50}>50 por pagina</option>
            <option value={100}>100 por pagina</option>
          </select>
        </div>

        <Card className="overflow-hidden bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-[1400px] w-full text-xs">
              <thead className="bg-gray-100 border-b sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">CPO ID</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">Part No</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">Territory</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">Vendor</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">Revenda</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">End User</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">Quote Name</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">Stage</th>
                  <th className="px-3 py-2 text-right font-bold text-gray-700 whitespace-nowrap">Prob %</th>
                  <th className="px-3 py-2 text-right font-bold text-gray-700 whitespace-nowrap">USD Value</th>
                  <th className="px-3 py-2 text-center font-bold text-gray-700 whitespace-nowrap">Budget</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">Close Date</th>
                  <th className="px-3 py-2 text-center font-bold text-gray-700 whitespace-nowrap">Age</th>
                  <th className="px-3 py-2 text-center font-bold text-gray-700 whitespace-nowrap">Status</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">BU</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuotes.map((quote, idx) => (
                  <tr key={idx} className="border-b hover:bg-blue-50 transition">
                    <td className="px-3 py-2 font-mono text-blue-600 font-bold whitespace-nowrap">{quote.cpo_id}</td>
                    <td className="px-3 py-2 font-mono whitespace-nowrap">{quote.part_no}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{quote.sales_territory}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{quote.vendor}</td>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{quote.master_customer}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{quote.end_user}</td>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{quote.quote_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold whitespace-nowrap">
                        {quote.stage}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-bold whitespace-nowrap">{quote.probability}%</td>
                    <td className="px-3 py-2 text-right font-bold text-green-700 whitespace-nowrap">
                      ${(quote.usd_value / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-semibold ${quote.budgetary === 'Yes' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                        {quote.budgetary}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{quote.close_date}</td>
                    <td className="px-3 py-2 text-center font-medium whitespace-nowrap">{quote.quote_age}d</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <Tooltip content={STATUS_INFO[quote.status]?.description ?? ''}>
                        <span className={`px-2 py-0.5 rounded font-semibold ${STATUS_INFO[quote.status]?.color ?? ''}`}>
                          {quote.status}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{quote.bu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredQuotes.length === 0 && (
          <Card className="p-12 bg-white text-center">
            <p className="text-gray-500">Nenhum resultado encontrado</p>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Anterior
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = currentPage - 2 + i;
            if (page < 1 || page > totalPages) return null;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded text-sm font-medium transition ${
                  currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Proximo
          </button>
        </div>
      </div>
    </div>
  );
}
