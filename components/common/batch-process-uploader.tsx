'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export function BatchProcessUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Simular preview
      setPreview([
        { cpo: 'CPO-1001', quote: 'QT-001', status: 'Valid', records: 1 },
        { cpo: 'CPO-1002', quote: 'QT-002', status: 'Valid', records: 1 },
        { cpo: 'CPO-1003', quote: 'QT-003', status: 'Error - Missing USD', records: 0 },
      ]);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    setProcessed(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white border-2 border-dashed border-blue-300">
        <div className="text-center">
          <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Excel Template</h3>
          <p className="text-gray-600 text-sm mb-4">Arrastar arquivo ou clicar para selecionar</p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <p className="text-sm text-blue-600 mt-2">
              Arquivo selecionado: {file.name}
            </p>
          )}
        </div>
      </Card>

      {preview.length > 0 && (
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Preview de Validação</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">CPO ID</th>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">Quote</th>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">Records</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{row.cpo}</td>
                    <td className="px-4 py-2 text-gray-900">{row.quote}</td>
                    <td className="px-4 py-2">
                      {row.status === 'Valid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          <CheckCircle className="w-4 h-4" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                          <AlertCircle className="w-4 h-4" /> {row.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-900">{row.records}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {preview.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleProcess}
            disabled={processing || processed}
            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {processing ? 'Processando...' : processed ? 'Processado!' : 'Processar'}
          </button>
          {processed && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle className="w-5 h-5" />
              2 de 3 registros processados com sucesso
            </div>
          )}
        </div>
      )}
    </div>
  );
}
