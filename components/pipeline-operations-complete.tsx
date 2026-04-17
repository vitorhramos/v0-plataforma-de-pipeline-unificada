'use client';

import { useState } from 'react';
import GlobalNavigation from './global-navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const mockUpdates = [
  { id: 1, date: '2024-03-15', type: 'Manual', quotesCount: 3, status: 'Completed', updatedBy: 'João Silva', changes: 'Estágio atualizado para Committed' },
  { id: 2, date: '2024-03-12', type: 'Batch Excel', quotesCount: 12, status: 'Completed', updatedBy: 'Maria Santos', changes: '12 cotações importadas' },
  { id: 3, date: '2024-03-10', type: 'Manual', quotesCount: 1, status: 'Completed', updatedBy: 'Pedro Costa', changes: 'Close date alterada' },
  { id: 4, date: '2024-03-08', type: 'Batch Excel', quotesCount: 8, status: 'Completed', updatedBy: 'Ana Souza', changes: '8 cotações atualizadas' },
];

const mockQuotes = [
  { id: 'CPO-001', revender: 'TechCorp', manufacturer: 'Cisco', amount: 150000, stage: 'Committed 75%' },
  { id: 'CPO-002', revender: 'DataSys', manufacturer: 'HPE', amount: 280000, stage: 'Up Selling 50%' },
  { id: 'CPO-003', revender: 'CloudTech', manufacturer: 'VMware', amount: 95000, stage: 'Pricing 25%' },
  { id: 'CPO-004', revender: 'TechCorp', manufacturer: 'NetApp', amount: 420000, stage: 'Committed 75%' },
];

export default function PipelineOperations() {
  const [activeTab, setActiveTab] = useState<'manual' | 'batch'>('manual');
  const [selectedQuote, setSelectedQuote] = useState('');
  const [newStage, setNewStage] = useState('');
  const [newCloseDate, setNewCloseDate] = useState('');
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const getStatusColor = (status: string) => {
    return status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const handleManualUpdate = () => {
    if (selectedQuote && newStage) {
      setIsProcessing(true);
      setTimeout(() => {
        setSuccessMessage(`Cotação ${selectedQuote} atualizada para ${newStage}`);
        setSelectedQuote('');
        setNewStage('');
        setNewCloseDate('');
        setIsProcessing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 1500);
    }
  };

  const handleBatchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setBatchFile(e.target.files[0]);
    }
  };

  const handleBatchUpload = () => {
    if (batchFile) {
      setIsProcessing(true);
      setTimeout(() => {
        setSuccessMessage(`${batchFile.name} processado com sucesso! 8 cotações atualizadas.`);
        setBatchFile(null);
        setIsProcessing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 2000);
    }
  };

  const downloadTemplate = () => {
    const template = 'CPO_ID,REVENDER,FABRICANTE,AMOUNT,NOVO_STAGE,CLOSE_DATE\nCPO-001,TechCorp,Cisco,150000,Committed 75%,2024-05-15\nCPO-002,DataSys,HPE,280000,Up Selling 50%,2024-06-20';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline-batch-template.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Pipeline Operations</h1>
          <p className="text-gray-600 mt-2">Edição manual ou em massa de cotações</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="p-4 mb-8 bg-green-50 border border-green-200">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-lg border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-6 py-2 rounded font-medium transition ${activeTab === 'manual' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Edição Manual
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-6 py-2 rounded font-medium transition ${activeTab === 'batch' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Batch Excel/CSV
          </button>
        </div>

        {/* Manual Update */}
        {activeTab === 'manual' && (
          <Card className="p-8 bg-white mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Atualização Manual de Cotação</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Cotação (CPO ID)</label>
                <select
                  value={selectedQuote}
                  onChange={(e) => setSelectedQuote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Escolha uma cotação...</option>
                  {mockQuotes.map(q => (
                    <option key={q.id} value={q.id}>{q.id} - {q.revender} - {formatCurrency(q.amount)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Novo Estágio</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Selecione estágio...</option>
                  <option value="Not Classified">Não Classificado</option>
                  <option value="Pricing 25%">Pricing 25%</option>
                  <option value="Up Selling 50%">Up Selling 50%</option>
                  <option value="Committed 75%">Committed 75%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Data de Fechamento (Opcional)</label>
                <Input
                  type="date"
                  value={newCloseDate}
                  onChange={(e) => setNewCloseDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleManualUpdate}
                  disabled={!selectedQuote || !newStage || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {isProcessing ? 'Atualizando...' : 'Atualizar Cotação'}
                </Button>
              </div>
            </div>

            {selectedQuote && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Informações da Cotação Selecionada</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mockQuotes.filter(q => q.id === selectedQuote).map(q => (
                    <>
                      <div key="revender">
                        <p className="text-xs text-gray-600 mb-1">Revenda</p>
                        <p className="font-semibold text-gray-900">{q.revender}</p>
                      </div>
                      <div key="manufacturer">
                        <p className="text-xs text-gray-600 mb-1">Fabricante</p>
                        <p className="font-semibold text-gray-900">{q.manufacturer}</p>
                      </div>
                      <div key="amount">
                        <p className="text-xs text-gray-600 mb-1">Valor USD</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(q.amount)}</p>
                      </div>
                      <div key="stage">
                        <p className="text-xs text-gray-600 mb-1">Estágio Atual</p>
                        <p className="font-semibold text-gray-900">{q.stage}</p>
                      </div>
                    </>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Batch Upload */}
        {activeTab === 'batch' && (
          <Card className="p-8 bg-white mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Atualização em Lote (Batch)</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Como funciona?</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li>Baixe o template de exemplo abaixo</li>
                <li>Preencha com os dados das cotações a atualizar</li>
                <li>Valide os valores antes de enviar</li>
                <li>O sistema processará e atualizará todas as linhas</li>
              </ul>
            </div>

            <div className="mb-6">
              <Button onClick={downloadTemplate} variant="outline" className="mb-4">
                Baixar Template CSV
              </Button>
              <p className="text-xs text-gray-500">Campos esperados: CPO_ID, REVENDER, FABRICANTE, AMOUNT, NOVO_STAGE, CLOSE_DATE</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar arquivo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleBatchFileSelect}
                  className="hidden"
                  id="batch-file"
                />
                <label htmlFor="batch-file" className="cursor-pointer">
                  <p className="text-gray-600 font-medium mb-1">Arraste o arquivo aqui ou clique para selecionar</p>
                  <p className="text-xs text-gray-500">Formatos suportados: CSV, XLSX (Máx 5MB)</p>
                  {batchFile && (
                    <p className="mt-3 text-blue-600 font-semibold">{batchFile.name}</p>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleBatchUpload}
                disabled={!batchFile || isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isProcessing ? 'Processando...' : 'Processar Arquivo'}
              </Button>
              {batchFile && (
                <Button
                  onClick={() => setBatchFile(null)}
                  variant="outline"
                >
                  Limpar
                </Button>
              )}
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Validações Aplicadas</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li>CPO ID deve existir no sistema</li>
                <li>Estágio deve ser um valor válido</li>
                <li>Valor USD deve ser numérico e positivo</li>
                <li>Data deve estar no formato correto (YYYY-MM-DD)</li>
              </ul>
            </div>
          </Card>
        )}

        {/* History */}
        <Card className="p-6 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Operações</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Qtd Cotações</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Atualizado Por</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Alterações</th>
                </tr>
              </thead>
              <tbody>
                {mockUpdates.map((update) => (
                  <tr key={update.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(update.date)}</td>
                    <td className="px-4 py-3">
                      <Badge className={update.type === 'Manual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                        {update.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{update.quotesCount}</td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(update.status)}>{update.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{update.updatedBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{update.changes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
