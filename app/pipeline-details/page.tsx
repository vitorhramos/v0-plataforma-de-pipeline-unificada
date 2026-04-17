'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

const mockQuotes = Array.from({ length: 85 }, (_, i) => ({
  id: i + 1,
  cpo_id: `CPO-${String(i + 1001).slice(-4)}`,
  part_no: `PN-${String(Math.random() * 100000).slice(0, 6)}`,
  sales_territory: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais'][i % 3],
  team: ['Team A', 'Team B', 'Team C'][i % 3],
  vendor: ['Vendor X', 'Vendor Y', 'Vendor Z'][i % 3],
  master_customer: `Revenda ${String.fromCharCode(65 + (i % 5))}`,
  end_user: `End User ${i + 1}`,
  description: `Product Description ${i + 1}`,
  quote_name: `Quote ${i + 1}`,
  quote_number: `QT-${String(i + 1001).slice(-4)}`,
  stage: ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'][i % 5],
  probability: [20, 40, 60, 80, 0][i % 5],
  usd_value: Math.floor(Math.random() * 2500000) + 50000,
  budgetary: i % 3 === 0 ? 'Yes' : 'No',
  close_date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  bu: ['BU A', 'BU B', 'BU C'][i % 3],
  quote_age: Math.floor(Math.random() * 90),
  status: ['S', 'N', 'U'][i % 3],
}));

export default function PipelineDetailsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-blue-600 hover:text-blue-700">← Home</Link>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Details</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Dashboard
            </Link>
            <Link href="/pipeline-manager" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Manager
            </Link>
            <Link href="/batch-query" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Batch
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="p-6 bg-white border-t-4 border-t-amber-600">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Busca e Filtros</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by Quote Name, CPO ID, or Part Number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition">
              Exportar CSV
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition">
              Exportar Excel
            </button>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {filteredQuotes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredQuotes.length)} de {filteredQuotes.length} registros
          </p>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        </div>

        <Card className="overflow-hidden bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">CPO ID</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Part No</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Territory</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Vendor</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Revenda</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">End User</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Quote Name</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Stage</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">Prob %</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">USD Value</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Budget</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Close Date</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Age (days)</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">BU</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuotes.map((quote, idx) => (
                  <tr key={idx} className="border-b hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-mono text-blue-600 font-bold text-xs">{quote.cpo_id}</td>
                    <td className="px-4 py-3 text-xs font-mono">{quote.part_no}</td>
                    <td className="px-4 py-3 text-xs">{quote.sales_territory}</td>
                    <td className="px-4 py-3 text-xs">{quote.vendor}</td>
                    <td className="px-4 py-3 text-xs font-medium">{quote.master_customer}</td>
                    <td className="px-4 py-3 text-xs truncate max-w-xs">{quote.end_user}</td>
                    <td className="px-4 py-3 text-xs font-medium">{quote.quote_name}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold whitespace-nowrap">
                        {quote.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-xs">{quote.probability}%</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">${(quote.usd_value / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-center text-xs">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${quote.budgetary === 'Yes' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                        {quote.budgetary}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{quote.close_date}</td>
                    <td className="px-4 py-3 text-center text-xs font-medium">{quote.quote_age}</td>
                    <td className="px-4 py-3 text-center text-xs font-bold">
                      <span className={`px-2 py-1 rounded ${
                        quote.status === 'S' ? 'bg-green-100 text-green-800' :
                        quote.status === 'N' ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{quote.bu}</td>
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

        <div className="flex items-center justify-between">
          <div />
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Anterior
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage - 2 + i;
                return page > 0 && page <= totalPages ? (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded text-sm font-medium transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ) : null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Próximo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
