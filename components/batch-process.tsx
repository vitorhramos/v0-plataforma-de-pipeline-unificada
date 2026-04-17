'use client';

import { useState, useMemo } from 'react';
import { getAllQuotes, filterQuotes } from '@/lib/data-service';
import GlobalNavigation from './global-navigation';

const BATCH_OPERATIONS = [
  { id: 'update-stage', label: 'Update Stage for Selected' },
  { id: 'bulk-classify', label: 'Bulk Classify by Value' },
  { id: 'mark-lost', label: 'Mark as Lost' },
  { id: 'export-batch', label: 'Export Selected Batch' },
];

export default function BatchProcessComponent() {
  const allQuotes = getAllQuotes();

  const [selectedQuoteIds, setSelectedQuoteIds] = useState<Set<number>>(new Set());
  const [selectedOperation, setSelectedOperation] = useState<string>('update-stage');
  const [batchParams, setBatchParams] = useState({
    newStage: 'Pricing 25%',
    minUsd: '',
    maxUsd: '',
    operation: 'mark-lost',
  });
  const [processLog, setProcessLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectQuote = (id: number) => {
    const newSelected = new Set(selectedQuoteIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuoteIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuoteIds(new Set(allQuotes.map(q => q.id)));
    } else {
      setSelectedQuoteIds(new Set());
    }
  };

  const handleExecuteProcess = async () => {
    if (selectedQuoteIds.size === 0) {
      setProcessLog(['Error: No quotes selected']);
      return;
    }

    setIsProcessing(true);
    const logs: string[] = [];

    logs.push(`[${new Date().toLocaleTimeString()}] Starting batch process...`);
    logs.push(`[${new Date().toLocaleTimeString()}] Selected quotes: ${selectedQuoteIds.size}`);

    switch (selectedOperation) {
      case 'update-stage':
        logs.push(`[${new Date().toLocaleTimeString()}] Updating stage to: ${batchParams.newStage}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        logs.push(`[${new Date().toLocaleTimeString()}] ✓ Stage updated for ${selectedQuoteIds.size} quotes`);
        break;

      case 'bulk-classify':
        logs.push(`[${new Date().toLocaleTimeString()}] Classifying quotes by value range: ${batchParams.minUsd} - ${batchParams.maxUsd}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        logs.push(`[${new Date().toLocaleTimeString()}] ✓ Classification completed`);
        break;

      case 'mark-lost':
        logs.push(`[${new Date().toLocaleTimeString()}] Marking ${selectedQuoteIds.size} quotes as lost...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        logs.push(`[${new Date().toLocaleTimeString()}] ✓ Quotes marked as lost`);
        break;

      case 'export-batch':
        logs.push(`[${new Date().toLocaleTimeString()}] Exporting ${selectedQuoteIds.size} quotes...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        logs.push(`[${new Date().toLocaleTimeString()}] ✓ Export completed: batch_${Date.now()}.csv`);
        break;
    }

    logs.push(`[${new Date().toLocaleTimeString()}] Process completed successfully`);
    setProcessLog(logs);
    setIsProcessing(false);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Batch Process</h1>
          <p className="text-gray-600 mt-1">Execute bulk operations on multiple quotes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-3">Operations</h3>
              <div className="space-y-2">
                {BATCH_OPERATIONS.map(op => (
                  <button
                    key={op.id}
                    onClick={() => {
                      setSelectedOperation(op.id);
                      setProcessLog([]);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      selectedOperation === op.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters */}
            {selectedOperation === 'update-stage' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="font-bold text-gray-900 mb-2">Parameters</h4>
                <select
                  value={batchParams.newStage}
                  onChange={(e) => setBatchParams({ ...batchParams, newStage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option>Pricing 25%</option>
                  <option>Up Selling 50%</option>
                  <option>Committed</option>
                  <option>Net Lost</option>
                </select>
              </div>
            )}

            {selectedOperation === 'bulk-classify' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="font-bold text-gray-900 mb-2">Value Range</h4>
                <input
                  type="number"
                  placeholder="Min USD"
                  value={batchParams.minUsd}
                  onChange={(e) => setBatchParams({ ...batchParams, minUsd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                />
                <input
                  type="number"
                  placeholder="Max USD"
                  value={batchParams.maxUsd}
                  onChange={(e) => setBatchParams({ ...batchParams, maxUsd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}

            <button
              onClick={handleExecuteProcess}
              disabled={selectedQuoteIds.size === 0 || isProcessing}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Execute'}
            </button>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Quote Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Select Quotes ({selectedQuoteIds.size})</h3>
                <button
                  onClick={() => handleSelectAll(selectedQuoteIds.size !== allQuotes.length)}
                  className="text-sm px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  {selectedQuoteIds.size === allQuotes.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {allQuotes.map(quote => (
                  <label key={quote.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedQuoteIds.has(quote.id)}
                      onChange={() => handleSelectQuote(quote.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-mono text-blue-600">{quote.cpo_id}</span>
                    <span className="text-xs text-gray-600">{quote.revenda}</span>
                    <span className="ml-auto text-xs font-medium text-gray-900">{formatUSD(quote.usd_value)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Process Log */}
            {processLog.length > 0 && (
              <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-4 font-mono text-sm text-green-400">
                <h3 className="font-bold mb-2 text-white">Process Log</h3>
                <div className="space-y-1">
                  {processLog.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
