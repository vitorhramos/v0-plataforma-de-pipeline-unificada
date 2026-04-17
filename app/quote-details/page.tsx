'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/breadcrumbs-tooltips';
import { BatchQuoteDetailsForm } from '@/components/common/batch-quote-details';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useToast } from '@/components/common/toast';

export default function QuoteDetailsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toast = useToast();

  const handleSave = () => {
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    toast.success('Alterações salvas com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs items={[{ label: 'Edit' }, { label: 'Quote Details' }]} />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quote Details</h1>
            <p className="text-sm text-gray-500 mt-1">19 campos. Use os badges para identificar campos criticos e somente leitura.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </button>
            </Link>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </div>

        <BatchQuoteDetailsForm />

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-400">Ultima atualizacao: hoje</p>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </button>
            </Link>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="Confirmar Alterações"
          description="Voce tem certeza que deseja salvar essas alterações?"
          confirmText="Salvar"
          cancelText="Cancelar"
          onConfirm={handleConfirm}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </div>
  );
}
