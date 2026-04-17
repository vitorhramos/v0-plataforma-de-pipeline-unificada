'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { operationHistory } from '@/components/common/operation-history';

interface OperationRecord {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  status: 'success' | 'error' | 'pending';
}

export function OperationHistoryPanel() {
  const [records, setRecords] = useState<OperationRecord[]>([]);

  useEffect(() => {
    const unsubscribe = operationHistory.subscribe(setRecords);
    return unsubscribe;
  }, []);

  const statusColors = {
    success: 'bg-green-50 border-l-green-600 text-green-800',
    error: 'bg-red-50 border-l-red-600 text-red-800',
    pending: 'bg-yellow-50 border-l-yellow-600 text-yellow-800',
  };

  const statusBadges = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <Card className="p-6 bg-white">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Histórico de Operações</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {records.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Nenhuma operação registrada</p>
        ) : (
          records.map(record => (
            <div key={record.id} className={`p-3 border-l-4 rounded ${statusColors[record.status]}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{record.action}</p>
                  <p className="text-xs text-gray-600 mt-1">{record.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${statusBadges[record.status]}`}>
                  {record.status === 'success' ? '✓' : record.status === 'error' ? '✕' : '...'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(record.timestamp).toLocaleTimeString('pt-BR')}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
