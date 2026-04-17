'use client';

import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export default function BatchProcessPage() {
  const { addNotification } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      // Simulate preview
      setPreview([
        { cpo_id: 'CPO-2024-001', action: 'UPDATE', fields_changed: 3 },
        { cpo_id: 'CPO-2024-002', action: 'UPDATE', fields_changed: 1 },
        { cpo_id: 'CPO-2024-003', action: 'SKIP', reason: 'No changes' },
      ]);
    }
  };

  const handleDownloadTemplate = () => {
    const template = `CPO ID,Quote #,Quote Stage,Projected Close Date,End User Company,Is Budgetary,Lost Reason,Notes
CPO-2024-001,QT-101,Committed 75%,2024-04-30,TechCorp Brasil,No,,Strategic account
CPO-2024-002,QT-102,Up Selling 50%,2024-05-15,DataSys Solutions,Yes,,Budget approved`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline-batch-template.csv';
    a.click();
  };

  const handleProcess = async () => {
    setProcessing(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    
    const newOp = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('pt-BR'),
      operation: 'Batch Upload',
      quotes_affected: preview.filter(p => p.action === 'UPDATE').length,
      status: 'Completed',
    };
    setHistory([newOp, ...history]);
    addNotification(`Batch processado: ${newOp.quotes_affected} cotações atualizadas`, 'success');
    setFile(null);
    setPreview([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Batch Process</h1>
        <p className="text-gray-600 mb-8">Processamento em massa com upload, preview e histórico</p>

        {/* Upload Section */}
        <Card className="p-8 mb-8 border-2 border-dashed border-blue-300 bg-blue-50">
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Batch File</h2>
            <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" id="file-input" />
            <label htmlFor="file-input" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer inline-block">
              Select File
            </label>
            {file && <p className="text-sm text-gray-700 mt-2">📄 {file.name}</p>}
            <button onClick={handleDownloadTemplate} className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
              Download Template
            </button>
          </div>
        </Card>

        {/* Preview */}
        {preview.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="font-bold text-gray-900 mb-4">Preview ({preview.length} linhas)</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">CPO ID</th>
                  <th className="px-4 py-2 text-left font-bold">Action</th>
                  <th className="px-4 py-2 text-center font-bold">Fields Changed</th>
                  <th className="px-4 py-2 text-center font-bold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p, i) => (
                  <tr key={i} className={`border-b ${p.action === 'SKIP' ? 'bg-gray-100' : ''}`}>
                    <td className="px-4 py-2 font-mono">{p.cpo_id}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${p.action === 'UPDATE' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                        {p.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">{p.fields_changed || '-'}</td>
                    <td className="px-4 py-2 text-center text-gray-600">{p.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={handleProcess}
              disabled={processing}
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
            >
              {processing ? 'Processing...' : 'Process Batch'}
            </button>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card className="p-6">
            <h2 className="font-bold text-gray-900 mb-4">Histórico de Operações</h2>
            <div className="space-y-2">
              {history.map((op, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-100 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{op.operation}</div>
                    <div className="text-sm text-gray-600">{op.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{op.quotes_affected} quotes</div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">{op.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
