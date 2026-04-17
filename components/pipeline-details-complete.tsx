'use client';

import { useState } from 'react';
import GlobalNavigation from './global-navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const mockQuotes = [
  { id: 1, cpoId: 'CPO-001', revender: 'TechCorp', manufacturer: 'Cisco', endUser: 'Acme Corp', amount: 150000, stage: 'Committed 75%', territory: 'South', region: 'SP', closeDate: '2024-05-15', createdDate: '2024-03-01', probability: 75, status: 'Active' },
  { id: 2, cpoId: 'CPO-002', revender: 'DataSys', manufacturer: 'HPE', endUser: 'TechWave Inc', amount: 280000, stage: 'Up Selling 50%', territory: 'North', region: 'RS', closeDate: '2024-06-20', createdDate: '2024-02-15', probability: 50, status: 'Active' },
  { id: 3, cpoId: 'CPO-003', revender: 'CloudTech', manufacturer: 'VMware', endUser: 'Digital Solutions', amount: 95000, stage: 'Pricing 25%', territory: 'East', region: 'MG', closeDate: '2024-07-10', createdDate: '2024-01-10', probability: 25, status: 'Active' },
  { id: 4, cpoId: 'CPO-004', revender: 'TechCorp', manufacturer: 'NetApp', endUser: 'Enterprise Labs', amount: 420000, stage: 'Committed 75%', territory: 'West', region: 'SP', closeDate: '2024-05-30', createdDate: '2024-02-01', probability: 75, status: 'Active' },
  { id: 5, cpoId: 'CPO-005', revender: 'NetVision', manufacturer: 'Cisco', endUser: 'Cloud Experts', amount: 180000, stage: 'Up Selling 50%', territory: 'South', region: 'SC', closeDate: '2024-08-15', createdDate: '2024-03-10', probability: 50, status: 'Active' },
];

export default function PipelineDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStage, setFilterStage] = useState('all');

  const filtered = mockQuotes.filter(quote => {
    const matchesSearch = quote.cpoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.revender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.endUser.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = filterStage === 'all' || quote.stage === filterStage;
    
    return matchesSearch && matchesStage;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
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

  const handleExportCSV = () => {
    const headers = ['CPO ID', 'Revenda', 'Fabricante', 'End User', 'Valor USD', 'Estágio', 'Probabilidade', 'Close Date', 'Território', 'Região', 'Status'];
    const rows = filtered.map(q => [
      q.cpoId, q.revender, q.manufacturer, q.endUser, q.amount, q.stage, q.probability, q.closeDate, q.territory, q.region, q.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-details-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleExportForecast = () => {
    const headers = ['CPO_ID', 'REVENDER', 'FABRICANTE', 'END_USER', 'USD_AMOUNT', 'STAGE', 'PROBABILITY', 'CLOSE_DATE', 'TERRITORY'];
    const rows = filtered.map(q => [
      q.cpoId, q.revender, q.manufacturer, q.endUser, q.amount, q.stage, q.probability, q.closeDate, q.territory
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Pipeline Details</h1>
          <p className="text-gray-600 mt-2">Visão analítica linha a linha com 20+ campos de análise</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-white mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Busca (CPO, Revenda, Fabricante, End User)</label>
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Estágio</label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos os Estágios</option>
                <option value="Not Classified">Não Classificado</option>
                <option value="Pricing 25%">Pricing 25%</option>
                <option value="Up Selling 50%">Up Selling 50%</option>
                <option value="Committed 75%">Committed 75%</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleExportCSV} variant="outline" className="flex-1">
                Exportar CSV
              </Button>
              <Button onClick={handleExportForecast} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Exportar Forecast
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Exibindo <strong>{filtered.length}</strong> de <strong>{mockQuotes.length}</strong> cotações
          </p>
        </Card>

        {/* Table */}
        <Card className="p-6 bg-white overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CPO ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Revenda</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Fabricante</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">End User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Valor USD</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Estágio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Prob.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Close Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Território</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Região</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quote) => (
                <tr key={quote.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">{quote.cpoId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{quote.revender}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{quote.manufacturer}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{quote.endUser}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(quote.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge className={getStageColor(quote.stage)}>{quote.stage}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{quote.probability}%</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(quote.closeDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{quote.territory}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{quote.region}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-green-100 text-green-800">{quote.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhuma cotação encontrada com os filtros aplicados.</p>
            </div>
          )}
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          <Card className="p-4 bg-white">
            <p className="text-xs font-medium text-gray-600 mb-1">Total Valor</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(filtered.reduce((sum, q) => sum + q.amount, 0))}</p>
          </Card>

          <Card className="p-4 bg-white">
            <p className="text-xs font-medium text-gray-600 mb-1">Cotações</p>
            <p className="text-xl font-bold text-gray-900">{filtered.length}</p>
          </Card>

          <Card className="p-4 bg-white">
            <p className="text-xs font-medium text-gray-600 mb-1">Prob. Média</p>
            <p className="text-xl font-bold text-gray-900">{Math.round(filtered.reduce((sum, q) => sum + q.probability, 0) / filtered.length || 0)}%</p>
          </Card>

          <Card className="p-4 bg-white">
            <p className="text-xs font-medium text-gray-600 mb-1">Valor Médio</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(Math.round(filtered.reduce((sum, q) => sum + q.amount, 0) / filtered.length) || 0)}</p>
          </Card>

          <Card className="p-4 bg-white">
            <p className="text-xs font-medium text-gray-600 mb-1">Revendas</p>
            <p className="text-xl font-bold text-gray-900">{new Set(filtered.map(q => q.revender)).size}</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
