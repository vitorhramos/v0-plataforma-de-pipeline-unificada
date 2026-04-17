'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BatchQuote {
  id: string;
  cpo_id: string;
  quote_name: string;
  quote_stage: string;
  projected_close_date: string;
  eu_company_name: string;
  budgetary: boolean;
  lost_reason: string;
  lost_other: string;
  comments: string;
  status: 'unchanged' | 'updated' | 'saved' | 'error';
}

const mockBatchQuotes: BatchQuote[] = [
  {
    id: '1',
    cpo_id: 'PO-2024-001',
    quote_name: 'Large Migration Project',
    quote_stage: '75',
    projected_close_date: '2024-02-28',
    eu_company_name: 'Global Corp',
    budgetary: false,
    lost_reason: '',
    lost_other: '',
    comments: 'High priority account',
    status: 'unchanged',
  },
  {
    id: '2',
    cpo_id: 'PO-2024-002',
    quote_name: 'Workstation Refresh',
    quote_stage: '50',
    projected_close_date: '2024-03-15',
    eu_company_name: 'Finance Dept',
    budgetary: false,
    lost_reason: '',
    lost_other: '',
    comments: 'Waiting for approval',
    status: 'unchanged',
  },
  {
    id: '3',
    cpo_id: 'PO-2024-003',
    quote_name: 'Network Upgrade',
    quote_stage: '25',
    projected_close_date: '2024-04-10',
    eu_company_name: 'IT Dept',
    budgetary: false,
    lost_reason: '',
    lost_other: '',
    comments: 'In pricing stage',
    status: 'unchanged',
  },
];

const lostReasons = [
  'Lost to Competitor',
  'Budget Cut',
  'No Longer Needed',
  'Moved to Another Vendor',
  'Price Too High',
  'Other',
];

export default function PipelineOperations() {
  const [quotes, setQuotes] = useState<BatchQuote[]>(mockBatchQuotes);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState<'manual' | 'excel'>('manual');
  const [fileUploadStatus, setFileUploadStatus] = useState<string>('');

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === quotes.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(quotes.map((q) => q.id));
    }
  };

  const handleQuoteChange = (id: string, field: string, value: any) => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              [field]: value,
              status: q.status === 'saved' ? 'saved' : 'updated',
            }
          : q
      )
    );
  };

  const handleSaveRow = (id: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'saved' } : q))
    );
  };

  const handleBatchSave = () => {
    setQuotes((prev) =>
      prev.map((q) =>
        selectedRows.includes(q.id) && q.status === 'updated'
          ? { ...q, status: 'saved' }
          : q
      )
    );
    setSelectedRows([]);
  };

  const handleUndo = () => {
    setQuotes(mockBatchQuotes);
    setSelectedRows([]);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'PO ID',
      'Quote Name',
      'Quote Stage (25/50/70)',
      'Projected Close Date',
      'EU Company Name',
      'Budgetary (Yes/No)',
      'Lost Reason',
      'Lost Other',
      'Comments',
    ];

    const csvContent = [
      headers.join(','),
      'PO-2024-001,New Name,75,2024-03-15,Company Name,No,,,"',
      'PO-2024-002,New Name,50,2024-03-20,Company Name,Yes,Lost to Competitor,,Extra info',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline-batch-template.csv';
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileUploadStatus(`Arquivo "${file.name}" enviado com sucesso. 3 linhas processadas.`);
      // In a real app, parse the CSV and update quotes
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'saved':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline Operations</h1>
        <p className="text-gray-600 mt-2">Gestão operacional em lote e atualização individual</p>
      </div>

      {/* Mode Selector */}
      <div className="mb-8 flex gap-2">
        <Button
          onClick={() => setBatchMode('manual')}
          variant={batchMode === 'manual' ? 'default' : 'outline'}
        >
          Edição Manual
        </Button>
        <Button
          onClick={() => setBatchMode('excel')}
          variant={batchMode === 'excel' ? 'default' : 'outline'}
        >
          Batch Process (Excel)
        </Button>
      </div>

      {batchMode === 'manual' ? (
        <>
          {/* Manual Edit Mode */}
          <div className="mb-6 flex gap-2">
            <Button onClick={handleBatchSave} disabled={selectedRows.length === 0} className="gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Salvar Lote
            </Button>
            <Button onClick={handleUndo} variant="outline" className="gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6m-6 6h12a6 6 0 010 12h-3" />
              </svg>
              Desfazer
            </Button>
          </div>

          {/* Table */}
          <Card className="p-6 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === quotes.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">CPO ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Quote Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Quote Stage</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Close Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Budgetary</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Comments</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className={`border-t border-gray-200 hover:bg-gray-50 ${
                      quote.status === 'updated' ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(quote.id)}
                        onChange={() => handleSelectRow(quote.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColor(quote.status)}`}>
                        {quote.status === 'unchanged' ? 'N' : quote.status === 'updated' ? 'U' : 'S'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">{quote.cpo_id}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={quote.quote_name}
                        onChange={(e) => handleQuoteChange(quote.id, 'quote_name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={quote.quote_stage}
                        onChange={(e) => handleQuoteChange(quote.id, 'quote_stage', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      >
                        <option value="25">25%</option>
                        <option value="50">50%</option>
                        <option value="70">70%</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={quote.projected_close_date}
                        onChange={(e) => handleQuoteChange(quote.id, 'projected_close_date', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={quote.budgetary}
                        onChange={(e) => handleQuoteChange(quote.id, 'budgetary', e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={quote.comments}
                        onChange={(e) => handleQuoteChange(quote.id, 'comments', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        placeholder="Adicionar nota..."
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleSaveRow(quote.id)}
                        disabled={quote.status === 'saved'}
                      >
                        Salvar Linha
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      ) : (
        <>
          {/* Excel Batch Mode */}
          <Card className="p-8 bg-white text-center">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Process via Excel</h2>
              <p className="text-gray-600 mb-6">
                Baixe o template, preencha com os dados desejados e faça upload para atualizar em massa
              </p>

              <Button onClick={handleDownloadTemplate} className="gap-2 mb-8">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Baixar Template
              </Button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-500 cursor-pointer transition">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="excel-upload"
                />
                <label htmlFor="excel-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-gray-600 mb-2">Clique ou arraste o arquivo Excel aqui</p>
                  <p className="text-sm text-gray-500">Formatos aceitos: CSV, XLSX, XLS</p>
                </label>
              </div>

              {fileUploadStatus && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">{fileUploadStatus}</p>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campos Editáveis:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-semibold text-yellow-900">Quote Stage</p>
                  <p className="text-sm text-yellow-700">25 / 50 / 70</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-semibold text-yellow-900">Quote Name</p>
                  <p className="text-sm text-yellow-700">Nome da cotação</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-semibold text-yellow-900">Projected Close Date</p>
                  <p className="text-sm text-yellow-700">Data de fechamento</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-semibold text-yellow-900">EU Company Name</p>
                  <p className="text-sm text-yellow-700">Empresa end user</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-semibold text-yellow-900">Budgetary</p>
                  <p className="text-sm text-yellow-700">Yes/No</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-semibold text-yellow-900">Lost Reason</p>
                  <p className="text-sm text-yellow-700">Motivo da perda</p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
