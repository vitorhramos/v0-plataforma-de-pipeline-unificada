'use client';

import { Card } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/common/breadcrumbs-tooltips';
import { BatchProcessUploader } from '@/components/common/batch-process-uploader';

export default function BatchProcessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumbs items={[{ label: 'Process' }, { label: 'Batch Upload' }]} />

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Batch Process - Upload Excel</h1>
          <p className="text-gray-600 text-sm">Faça upload de um arquivo Excel com template. Validação automática, preview de resultados e processamento seguro.</p>
        </div>

        <BatchProcessUploader />

        <Card className="p-6 bg-blue-50 border-l-4 border-l-blue-600">
          <h3 className="text-sm font-bold text-blue-900 mb-2">Informações Importantes</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Máximo 1000 registros por arquivo</li>
            <li>Formatos aceitos: .xlsx, .xls, .csv</li>
            <li>Todos os registros são validados antes do processamento</li>
            <li>Histórico de operações é mantido para auditoria</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
