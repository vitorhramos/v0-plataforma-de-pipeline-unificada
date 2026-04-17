'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Breadcrumbs } from '@/components/common/breadcrumbs-tooltips';
import { Card } from '@/components/ui/card';

const PART_PREFIXES = ['NX', 'HP', 'DL', 'CP', 'LN', 'ST', 'VX', 'AX'];
const USD_VALUES = [702000, 241000, 451000, 2348000, 1614000, 2301000, 890000, 340000, 1200000, 560000];
const AGES = [12, 34, 7, 56, 23, 45, 8, 67, 15, 30];
const CLOSE_DATES = ['2025-07-15', '2025-08-01', '2025-06-30', '2025-09-10', '2025-07-22', '2025-08-14', '2025-10-01', '2025-06-20', '2025-09-28', '2025-07-05'];
const STATUS_INFO: Record<string, { color: string; description: string }> = {
  S: { color: 'bg-green-100 text-green-800', description: 'Agendado' },
  N: { color: 'bg-gray-100 text-gray-700', description: 'Nao iniciado' },
  U: { color: 'bg-blue-100 text-blue-800', description: 'Atualizado' },
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

export default function PipelineManagerPage() {
  const [view, setView] = useState<'charts' | 'table'>('charts');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const totalPages = Math.ceil(mockQuotes.length / pageSize);
  const paginatedQuotes = mockQuotes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-blue-600 hover:text-blue-700">← Home</Link>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Manager</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Dashboard
            </Link>
            <Link href="/pipeline-details" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Details
            </Link>
            <Link href="/batch-query" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Batch
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumbs items={[{ label: 'Pipeline Manager' }]} />

        <Card className="p-6 bg-white border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Toggle View</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setView('charts')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  view === 'charts'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Gráficos
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  view === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Tabela
              </button>
            </div>
          </div>
        </Card>

        {view === 'charts' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-white">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Volume por Revenda (Top 10)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={mockData.revendas} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-white">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Volume por Fabricante</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={mockData.vendors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} height={80} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6 bg-white">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Distribuição de Stages (6 meses)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Line type="monotone" dataKey="committed" stroke="#10b981" strokeWidth={2} name="Committed" />
                  <Line type="monotone" dataKey="upselling" stroke="#f59e0b" strokeWidth={2} name="Up Selling" />
                  <Line type="monotone" dataKey="pricing" stroke="#3b82f6" strokeWidth={2} name="Pricing" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-600">
                Mostrando {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, mockQuotes.length)} de {mockQuotes.length} registros
              </p>
            </div>
            <Card className="overflow-hidden bg-white shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">CPO ID</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Part No</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Territory</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Vendor</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Revenda</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">End User</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Quote Name</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Stage</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 whitespace-nowrap">Prob %</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 whitespace-nowrap">USD Value</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 whitespace-nowrap">Budget</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Close Date</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 whitespace-nowrap">Age</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 whitespace-nowrap">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">BU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQuotes.map((q, idx) => (
                      <tr key={idx} className="border-b hover:bg-indigo-50 transition text-gray-900">
                        <td className="px-3 py-2 text-xs font-mono text-blue-600 font-bold whitespace-nowrap">{q.cpo_id}</td>
                        <td className="px-3 py-2 text-xs font-mono text-gray-800 whitespace-nowrap">{q.part_no}</td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">{q.sales_territory}</td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">{q.vendor}</td>
                        <td className="px-3 py-2 text-xs font-medium text-gray-900 whitespace-nowrap">{q.master_customer}</td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">{q.end_user}</td>
                        <td className="px-3 py-2 text-xs font-medium text-gray-900 whitespace-nowrap">{q.quote_name}</td>
                        <td className="px-3 py-2 text-xs whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs font-semibold">{q.stage}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-gray-900">{q.probability}%</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-green-700">${(q.usd_value / 1000).toFixed(0)}K</td>
                        <td className="px-3 py-2 text-center text-xs">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${q.budgetary === 'Yes' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>{q.budgetary}</span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">{q.close_date}</td>
                        <td className="px-3 py-2 text-center text-xs font-medium text-gray-800">{q.quote_age}d</td>
                        <td className="px-3 py-2 text-center text-xs">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_INFO[q.status]?.color ?? ''}`}>{q.status}</span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">{q.bu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
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
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded text-sm font-medium transition ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
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
        )}
      </div>
    </div>
  );
}
