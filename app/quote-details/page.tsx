'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumbs items={[{ label: 'Edit' }, { label: 'Quote Details' }]} />

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Details Editor</h1>
          <p className="text-gray-600 text-sm">Edite os 19 campos disponíveis • Campos em cinza são somente leitura • Campos em amarelo são críticos</p>
        </div>

        <BatchQuoteDetailsForm />

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
          >
            Salvar Alterações
          </button>
          <Link href="/dashboard">
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition">
              Cancelar
            </button>
          </Link>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="Confirmar Alterações"
          description="Você tem certeza que deseja salvar essas alterações?"
          confirmLabel="Salvar"
          cancelLabel="Cancelar"
          preview={<p className="text-sm">19 campos atualizados • Auditoria será registrada</p>}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </div>
  );
}
