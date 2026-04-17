'use client';

import { useState } from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useAppContext } from '@/context/AppContext';
import { ConfirmDialog } from './common/confirm-dialog';

export function EnhancedQuoteEditor({ quoteId }: { quoteId: number }) {
  const { quotes, updateQuote, addNotification } = useAppContext();
  const { validateField, getFieldError, isValid } = useFormValidation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  const quote = quotes.find(q => q.id === quoteId);
  if (!quote) return <div className="text-center py-8 text-gray-500">Quote not found</div>;

  const handleFieldChange = (field: string, value: any) => {
    const rules = getValidationRules(field);
    if (validateField(field, value, rules)) {
      setPendingChanges(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    if (Object.keys(pendingChanges).length === 0) {
      addNotification('No changes to save', 'info');
      return;
    }

    if (Object.keys(pendingChanges).length > 5) {
      setShowConfirm(true);
    } else {
      executeSave();
    }
  };

  const executeSave = () => {
    updateQuote(quoteId, pendingChanges);
    setPendingChanges({});
    setShowConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Read-Only Fields (Cinza) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Quote Information</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">CPO ID</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-600 text-sm">
              {quote.cpo_id}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Master Customer</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-600 text-sm">
              {quote.master_customer}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fabricante</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-600 text-sm">
              {quote.fabricante}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">USD Value</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-600 text-sm font-medium">
              ${quote.usd_value.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Probability</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-600 text-sm">
              {quote.probability}%
            </div>
          </div>
        </div>

        {/* Editable Fields (Amarelo) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Editable Fields</h3>

          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Stage</label>
            <select
              value={pendingChanges.stage || quote.stage}
              onChange={(e) => handleFieldChange('stage', e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option>Pipelined</option>
              <option>Pricing 25%</option>
              <option>Up Selling 50%</option>
              <option>Committed 75%</option>
              <option>Net Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Close Date</label>
            <input
              type="date"
              value={pendingChanges.projected_close_date || quote.projected_close_date?.split('T')[0] || ''}
              onChange={(e) => handleFieldChange('projected_close_date', e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {getFieldError('projected_close_date') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('projected_close_date')}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Quote Name</label>
            <input
              type="text"
              value={pendingChanges.quote_name || quote.quote_name}
              onChange={(e) => handleFieldChange('quote_name', e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pendingChanges.is_budgetary ?? quote.is_budgetary}
                onChange={(e) => handleFieldChange('is_budgetary', e.target.checked)}
                className="w-4 h-4 rounded border-amber-300 bg-amber-50"
              />
              <span className="text-sm font-medium text-gray-900">Budgetary</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pendingChanges.is_lost ?? quote.is_lost}
                onChange={(e) => handleFieldChange('is_lost', e.target.checked)}
                className="w-4 h-4 rounded border-amber-300 bg-amber-50"
              />
              <span className="text-sm font-medium text-gray-900">Lost</span>
            </label>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Object.keys(pendingChanges).length > 0 ? (
            <>
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-xs font-medium text-orange-700">
                Modified ({Object.keys(pendingChanges).length} field{Object.keys(pendingChanges).length !== 1 ? 's' : ''})
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-700">Saved</span>
            </>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!isValid || Object.keys(pendingChanges).length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Confirm Bulk Changes"
        description={`You are about to modify ${Object.keys(pendingChanges).length} fields. This action will update the quote immediately.`}
        confirmText="Save Changes"
        cancelText="Cancel"
        onConfirm={executeSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

function getValidationRules(field: string) {
  const rules: Record<string, any> = {
    quote_name: { maxLength: 100 },
    projected_close_date: { notInPast: true },
    stage: { required: true },
  };
  return rules[field] || {};
}
