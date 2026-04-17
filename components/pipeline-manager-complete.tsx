'use client';

import { useState } from 'react';
import GlobalNavigation from './global-navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const mockQuotes = [
  { id: 1, cpoId: 'CPO-001', revender: 'TechCorp', manufacturer: 'Cisco', amount: 150000, stage: 'Committed 75%', closeDate: '2024-05-15', probability: 75 },
  { id: 2, cpoId: 'CPO-002', revender: 'DataSys', manufacturer: 'HPE', amount: 280000, stage: 'Up Selling 50%', closeDate: '2024-06-20', probability: 50 },
  { id: 3, cpoId: 'CPO-003', revender: 'CloudTech', manufacturer: 'VMware', amount: 95000, stage: 'Pricing 25%', closeDate: '2024-07-10', probability: 25 },
  { id: 4, cpoId: 'CPO-004', revender: 'TechCorp', manufacturer: 'NetApp', amount: 420000, stage: 'Committed 75%', closeDate: '2024-05-30', probability: 75 },
  { id: 5, cpoId: 'CPO-005', revender: 'NetVision', manufacturer: 'Cisco', amount: 180000, stage: 'Up Selling 50%', closeDate: '2024-08-15', probability: 50 },
  { id: 6, cpoId: 'CPO-006', revender: 'DataSys', manufacturer: 'Dell', amount: 65000, stage: 'Pricing 25%', closeDate: '2024-06-30', probability: 25 },
  { id: 7, cpoId: 'CPO-007', revender: 'CloudTech', manufacturer: 'Cisco', amount: 310000, stage: 'Committed 75%', closeDate: '2024-05-25', probability: 75 },
  { id: 8, cpoId: 'CPO-008', revender: 'TechCorp', manufacturer: 'HPE', amount: 220000, stage: 'Not Classified', closeDate: '', probability: 0 },
];

const stageData = [
  { stage: 'Not Classified', count: 2, amount: 220000 },
  { stage: 'Pricing 25%', count: 2, amount: 160000 },
  { stage: 'Up Selling 50%', count: 2, amount: 400000 },
  { stage: 'Committed 75%', count: 2, amount: 860000 },
];

export default function PipelineManager() {
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  const [selectedQuotes, setSelectedQuotes] = useState<number[]>([]);
  const [bulkStage, setBulkStage] = useState('');

  const toggleSelectQuote = (id: number) => {
    setSelectedQuotes(prev => prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedQuotes.length === mockQuotes.length) {
      setSelectedQuotes([]);
    } else {
      setSelectedQuotes(mockQuotes.map(q => q.id));
    }
  };

  const handleBulkUpdate = () => {
    if (bulkStage && selectedQuotes.length > 0) {
      alert(`Atualizou ${selectedQuotes.length} cotações para: ${bulkStage}`);
      setSelectedQuotes([]);
      setBulkStage('');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Not Classified': return 'bg-gray-100 text-gray-800';
      case 'Pricing 25%': return 'bg-amber-100 text-amber-800';
      case 'Up Selling 50%': return 'bg-purple-100 text-purple-800';
      case 'Committed 75%': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Pipeline Manager</h1>
            <p className="text-gray-600 mt-2">Visualização gerencial com análise e edição em lote</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('charts')}
              className={`px-4 py-2 rounded font-medium transition ${viewMode === 'charts' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Gráficos
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded font-medium transition ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Tabela
            </button>
          </div>
        </div>

        {viewMode === 'charts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pipeline por Estágio */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline por Estágio</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Quantidade por Estágio */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantidade de Cotações</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        ) : (
          <Card className="p-6 bg-white mb-8">
            {/* Bulk Actions */}
            {selectedQuotes.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{selectedQuotes.length} cotação(ões) selecionada(s)</p>
                </div>
                <div className="flex gap-3">
                  <select
                    value={bulkStage}
                    onChange={(e) => setBulkStage(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Selecione novo estágio</option>
                    <option value="Not Classified">Não Classificado</option>
                    <option value="Pricing 25%">Pricing 25%</option>
                    <option value="Up Selling 50%">Up Selling 50%</option>
                    <option value="Committed 75%">Committed 75%</option>
                  </select>
                  <Button onClick={handleBulkUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Atualizar Estágio
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedQuotes([])}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedQuotes.length === mockQuotes.length}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">CPO ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Revenda</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Fabricante</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Valor USD</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Estágio</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Probabilidade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Close Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedQuotes.includes(quote.id)}
                          onChange={() => toggleSelectQuote(quote.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{quote.cpoId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{quote.revender}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{quote.manufacturer}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(quote.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge className={getStageColor(quote.stage)}>{quote.stage}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{quote.probability}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{quote.closeDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Summary */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Gerencial</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Cotações</p>
              <p className="text-2xl font-bold text-gray-900">{mockQuotes.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Valor Total USD</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(mockQuotes.reduce((sum, q) => sum + q.amount, 0))}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Valor Classificado</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(mockQuotes.filter(q => q.stage !== 'Not Classified').reduce((sum, q) => sum + q.amount, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Taxa Média Probabilidade</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(mockQuotes.reduce((sum, q) => sum + q.probability, 0) / mockQuotes.length)}%
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
