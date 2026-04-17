'use client';

import { useState } from 'react';
import { getAllQuotes } from '@/lib/data-service';
import GlobalNavigation from './global-navigation';

const STAGES = ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed', 'Net Lost'];
const LOST_REASONS = ['Price', 'Competition', 'No Budget', 'Timing', 'Technical', 'Other'];

export default function BatchDetailsComponent() {
  const allQuotes = getAllQuotes();
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(allQuotes.length > 0 ? allQuotes[0].id : null);
  const [editedQuotes, setEditedQuotes] = useState<Map<number, any>>(new Map());

  const selectedQuote = allQuotes.find(q => q.id === selectedQuoteId);

  const handleFieldChange = (fieldName: string, value: any) => {
    if (!selectedQuoteId) return;

    const currentEdits = editedQuotes.get(selectedQuoteId) || { ...selectedQuote };
    currentEdits[fieldName] = value;
    
    const newEdits = new Map(editedQuotes);
    newEdits.set(selectedQuoteId, currentEdits);
    setEditedQuotes(newEdits);
  };

  const handleSave = () => {
    if (editedQuotes.size === 0) {
      alert('No changes to save');
      return;
    }
    alert(`Saved changes for ${editedQuotes.size} quote(s)`);
    setEditedQuotes(new Map());
  };

  const handleReset = () => {
    setEditedQuotes(new Map());
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  if (!selectedQuote) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalNavigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">No quotes available</p>
        </main>
      </div>
    );
  }

  const displayQuote = editedQuotes.has(selectedQuoteId) ? { ...selectedQuote, ...editedQuotes.get(selectedQuoteId) } : selectedQuote;
  const isModified = editedQuotes.has(selectedQuoteId);

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Batch Details</h1>
          <p className="text-gray-600 mt-1">Edit individual quotes with field-level control</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quote List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit">
            <h3 className="font-bold text-gray-900 mb-3">Quotes ({allQuotes.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allQuotes.map(quote => (
                <button
                  key={quote.id}
                  onClick={() => setSelectedQuoteId(quote.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedQuoteId === quote.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${isModified && selectedQuoteId === quote.id ? 'ring-2 ring-orange-500' : ''}`}
                >
                  <div className="font-mono font-bold">{quote.cpo_id}</div>
                  <div className="text-xs">{quote.revenda}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Form */}
          <div className="lg:col-span-3 space-y-4">
            {/* Save/Reset Buttons */}
            {isModified && (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Discard
                </button>
              </div>
            )}

            {/* Editable Fields (Yellow background) */}
            <div className="bg-yellow-50 rounded-lg shadow-sm border-2 border-yellow-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Editable Fields</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    value={displayQuote.stage}
                    onChange={(e) => handleFieldChange('stage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STAGES.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Close Date</label>
                  <input
                    type="date"
                    value={displayQuote.close_date || ''}
                    onChange={(e) => handleFieldChange('close_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Probability %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={displayQuote.probability}
                    onChange={(e) => handleFieldChange('probability', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      checked={displayQuote.is_budgetary}
                      onChange={(e) => handleFieldChange('is_budgetary', e.target.checked)}
                      className="mr-2"
                    />
                    Budgetary
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      checked={displayQuote.is_lost}
                      onChange={(e) => handleFieldChange('is_lost', e.target.checked)}
                      className="mr-2"
                    />
                    Lost
                  </label>
                </div>

                {displayQuote.is_lost && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lost Reason</label>
                    <select
                      value={displayQuote.lost_reason || ''}
                      onChange={(e) => handleFieldChange('lost_reason', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select reason</option>
                      {LOST_REASONS.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Read-only Fields (Gray background) */}
            <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-300 p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Information (Read-only)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPO ID</label>
                  <input type="text" value={displayQuote.cpo_id} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenda</label>
                  <input type="text" value={displayQuote.revenda} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End User</label>
                  <input type="text" value={displayQuote.end_user} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fabricante</label>
                  <input type="text" value={displayQuote.fabricante} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">USD Value</label>
                  <input type="text" value={formatUSD(displayQuote.usd_value)} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Rep</label>
                  <input type="text" value={displayQuote.sales_rep} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            {isModified && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-700">
                  <strong>Modified (U)</strong> - Changes not yet saved
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
