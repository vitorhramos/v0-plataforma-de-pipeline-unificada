'use client';

import { useState } from 'react';
import { getAllQuotes } from '@/lib/data-service';
import GlobalNavigation from './global-navigation';

const STAGES = ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed'];

export default function ClassificationComponent() {
  const allQuotes = getAllQuotes();
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(allQuotes.length > 0 ? allQuotes[0].id : null);
  const [formData, setFormData] = useState({
    stage: 'Pricing 25%',
    probability: 25,
    close_date: '',
    is_budgetary: false,
  });

  const selectedQuote = allQuotes.find(q => q.id === selectedQuoteId);

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    alert(`Quote ${selectedQuote?.cpo_id} classified as:\n- Stage: ${formData.stage}\n- Probability: ${formData.probability}%\n- Close Date: ${formData.close_date || 'Not set'}\n- Budgetary: ${formData.is_budgetary ? 'Yes' : 'No'}`);
  };

  const handleNext = () => {
    const currentIndex = allQuotes.findIndex(q => q.id === selectedQuoteId);
    if (currentIndex < allQuotes.length - 1) {
      setSelectedQuoteId(allQuotes[currentIndex + 1].id);
      setFormData({
        stage: 'Pricing 25%',
        probability: 25,
        close_date: '',
        is_budgetary: false,
      });
    }
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

  const currentIndex = allQuotes.findIndex(q => q.id === selectedQuoteId);

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quote Classification</h1>
          <p className="text-gray-600 mt-1">Classify individual quotes with probability and close date</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quote Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quote Information</h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">CPO ID</p>
                <p className="font-mono font-bold text-blue-600">{selectedQuote.cpo_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Revenda</p>
                <p className="font-medium text-gray-900">{selectedQuote.revenda}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">End User</p>
                <p className="font-medium text-gray-900">{selectedQuote.end_user}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fabricante</p>
                <p className="font-medium text-gray-900">{selectedQuote.fabricante}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">USD Value</p>
                <p className="font-bold text-lg text-gray-900">{formatUSD(selectedQuote.usd_value)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sales Rep</p>
                <p className="font-medium text-gray-900">{selectedQuote.sales_rep}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${((currentIndex + 1) / allQuotes.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {currentIndex + 1} of {allQuotes.length} quotes
              </p>
            </div>
          </div>

          {/* Classification Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Classification</h3>

            <div className="space-y-6">
              {/* Stage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleFieldChange('stage', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              {/* Probability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Probability: {formData.probability}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.probability}
                  onChange={(e) => handleFieldChange('probability', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex gap-2 mt-2">
                  {[25, 50, 75, 100].map(val => (
                    <button
                      key={val}
                      onClick={() => handleFieldChange('probability', val)}
                      className={`flex-1 px-2 py-1 rounded text-sm font-medium transition ${
                        formData.probability === val
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Close Date</label>
                <input
                  type="date"
                  value={formData.close_date}
                  onChange={(e) => handleFieldChange('close_date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Budgetary */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.is_budgetary}
                    onChange={(e) => handleFieldChange('is_budgetary', e.target.checked)}
                    className="mr-2 w-4 h-4"
                  />
                  Budgetary Quote
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Save Classification
                </button>
                {currentIndex < allQuotes.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Next Quote
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
