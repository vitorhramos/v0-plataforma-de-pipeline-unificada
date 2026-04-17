'use client';

import { useState } from 'react';
import GlobalNavigation from './global-navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Operations() {
  const [batchInput, setBatchInput] = useState('');
  const [operations, setOperations] = useState<{id: string; action: string; timestamp: string}[]>([]);

  const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newOp = {
        id: `OP-${Date.now()}`,
        action: `Upload: ${file.name} (${file.size} bytes)`,
        timestamp: new Date().toLocaleString('pt-BR'),
      };
      setOperations([newOp, ...operations]);
    }
  };

  const handleBatchUpdate = () => {
    if (batchInput.trim()) {
      const newOp = {
        id: `OP-${Date.now()}`,
        action: `Batch Update: ${batchInput}`,
        timestamp: new Date().toLocaleString('pt-BR'),
      };
      setOperations([newOp, ...operations]);
      setBatchInput('');
    }
  };

  const downloadTemplate = () => {
    const template = 'CPO ID,Estágio,Close Date,Probability\nCPO-001,Committed,2026-05-20,75\nCPO-002,Pricing,2026-06-30,50';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Operations</h1>
          <p className="text-gray-600 mt-2">Gestão operacional com edição manual ou em massa via Excel</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Manual Edit Section */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edição Manual</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CPO ID</label>
                <input type="text" placeholder="CPO-001" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Novo Estágio</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Pipelined</option>
                  <option>Pricing</option>
                  <option>UpSelling</option>
                  <option>Committed</option>
                  <option>Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Close Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 py-2 rounded">
                Atualizar
              </Button>
            </div>
          </Card>

          {/* Batch Section */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edição em Lote</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Excel/CSV</label>
                <input 
                  type="file" 
                  accept=".csv,.xlsx"
                  onChange={handleUploadCSV}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <Button onClick={downloadTemplate} className="w-full bg-gray-600 text-white hover:bg-gray-700 py-2 rounded">
                Baixar Template
              </Button>
            </div>
          </Card>

          {/* Batch Input */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-4">
              <textarea 
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="Descrever ação em lote..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <Button onClick={handleBatchUpdate} className="w-full bg-green-600 text-white hover:bg-green-700 py-2 rounded">
                Executar
              </Button>
            </div>
          </Card>
        </div>

        {/* Operations History */}
        <Card className="p-6 mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Histórico de Operações</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Operação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operations.length > 0 ? (
                  operations.map(op => (
                    <tr key={op.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{op.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{op.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{op.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Concluído
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-600">
                      Nenhuma operação realizada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
