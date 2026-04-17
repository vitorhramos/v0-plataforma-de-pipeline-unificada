'use client';

import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export default function QuoteDetailsPage() {
  const { filteredQuotes, updateQuote } = useAppContext();
  const [selectedId, setSelectedId] = useState<number | null>(filteredQuotes[0]?.id || null);
  const quote = filteredQuotes.find(q => q.id === selectedId);
  const [changes, setChanges] = useState<Record<string, any>>({});

  if (!quote) return <div className="min-h-screen bg-gray-50"><main className="max-w-4xl mx-auto px-4 py-8"><p>Nenhuma cotação selecionada</p></main></div>;

  const readOnlyFields = ['quote_number', 'master_customer_name', 'cpo_customer', 'sales_territory', 'probability_percentage', 'cif_value_usd', 'available_credit', 'available_credit_usd', 'vendor_name'];
  const editableFields = ['quote_stage', 'quote_name', 'projected_close_date', 'end_user_company', 'is_budgetary', 'is_lost', 'lost_reason', 'notes'];

  const handleSave = () => {
    updateQuote(quote.id, changes);
    setChanges({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Quote Details - Editor Individual</h1>

        {/* Quote Selector */}
        <Card className="p-6 mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">Selecione uma cotação</label>
          <select value={selectedId || ''} onChange={(e) => { setSelectedId(parseInt(e.target.value)); setChanges({}); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            {filteredQuotes.map(q => (
              <option key={q.id} value={q.id}>{q.cpo_id} - {q.quote_number} ({q.master_customer_name})</option>
            ))}
          </select>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Read-Only Fields (Cinza) */}
          <Card className="p-6 bg-gray-100 border-l-4 border-l-gray-500">
            <h2 className="font-bold text-gray-900 mb-4">Informações (Não Editáveis)</h2>
            <div className="space-y-4">
              {readOnlyFields.map(field => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{field}</label>
                  <input disabled type="text" value={quote[field as keyof typeof quote] || ''} className="w-full px-3 py-2 bg-gray-300 text-gray-700 rounded border border-gray-400 text-sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* Editable Fields (Amarelo) */}
          <Card className="p-6 bg-yellow-50 border-l-4 border-l-yellow-500">
            <h2 className="font-bold text-gray-900 mb-4">Editáveis</h2>
            <div className="space-y-4">
              {editableFields.map(field => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{field}</label>
                  {field === 'is_budgetary' || field === 'is_lost' ? (
                    <input
                      type="checkbox"
                      checked={changes[field] !== undefined ? changes[field] : quote[field as keyof typeof quote]}
                      onChange={(e) => setChanges({ ...changes, [field]: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                  ) : field === 'projected_close_date' ? (
                    <input type="date" value={changes[field] || quote[field]} onChange={(e) => setChanges({ ...changes, [field]: e.target.value })} className="w-full px-3 py-2 border border-yellow-300 rounded bg-white text-sm" />
                  ) : (
                    <input type="text" value={changes[field] || quote[field as keyof typeof quote] || ''} onChange={(e) => setChanges({ ...changes, [field]: e.target.value })} className="w-full px-3 py-2 border border-yellow-300 rounded bg-white text-sm" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Status Badge */}
        <div className="mt-6 flex items-center gap-4">
          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${Object.keys(changes).length === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
            {Object.keys(changes).length === 0 ? 'Saved (S)' : `Modified - ${Object.keys(changes).length} fields (U)`}
          </span>
          {Object.keys(changes).length > 0 && (
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              Save Changes
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
