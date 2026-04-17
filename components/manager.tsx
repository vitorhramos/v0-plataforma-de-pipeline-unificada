'use client';

import { useState } from 'react';
import GlobalNavigation from './global-navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const quotesData = [
  { id: 1, cpoId: 'CPO-001', revenda: 'TechCorp', fabricante: 'Cisco', estágio: 'Pipelined', usd: 125000, probabilidade: 25 },
  { id: 2, cpoId: 'CPO-002', revenda: 'DataSys', fabricante: 'HPE', estágio: 'Pricing', usd: 89000, probabilidade: 50 },
  { id: 3, cpoId: 'CPO-003', revenda: 'CloudTech', fabricante: 'VMware', estágio: 'UpSelling', usd: 210000, probabilidade: 50 },
  { id: 4, cpoId: 'CPO-004', revenda: 'NetVision', fabricante: 'NetApp', estágio: 'Committed', usd: 95000, probabilidade: 75 },
  { id: 5, cpoId: 'CPO-005', revenda: 'TechCorp', fabricante: 'Dell', estágio: 'Committed', usd: 420000, probabilidade: 75 },
  { id: 6, cpoId: 'CPO-006', revenda: 'DataSys', fabricante: 'Cisco', estágio: 'Pricing', usd: 156000, probabilidade: 25 },
];

const stageChartData = [
  { stage: 'Pipelined', count: 1 },
  { stage: 'Pricing', count: 2 },
  { stage: 'UpSelling', count: 1 },
  { stage: 'Committed', count: 2 },
];

export default function Manager() {
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const toggleAll = () => {
    if (selected.length === quotesData.length) {
      setSelected([]);
    } else {
      setSelected(quotesData.map(q => q.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline Manager</h1>
            <p className="text-gray-600 mt-2">Gestão gerencial com visualização em gráficos ou tabelas</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setViewMode('charts')}
              className={`px-4 py-2 rounded ${viewMode === 'charts' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
            >
              Gráficos
            </Button>
            <Button 
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
            >
              Tabela
            </Button>
          </div>
        </div>

        {viewMode === 'charts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Cotações por Estágio</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Revenda</h2>
              <div className="space-y-2">
                {['TechCorp', 'DataSys', 'CloudTech', 'NetVision'].map(revenda => (
                  <div key={revenda} className="flex items-center justify-between">
                    <span className="text-gray-600">{revenda}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${Math.random() * 100}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <input 
                        type="checkbox" 
                        checked={selected.length === quotesData.length}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPO ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenda</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fabricante</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estágio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">USD</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Probabilidade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotesData.map(quote => (
                    <tr key={quote.id} className={selected.includes(quote.id) ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={selected.includes(quote.id)}
                          onChange={() => toggleSelect(quote.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.cpoId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quote.revenda}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quote.fabricante}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {quote.estágio}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${quote.usd.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quote.probabilidade}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
