'use client';

import { Quote } from '@/types';

interface QuoteComparisonProps {
  quote1: Quote;
  quote2: Quote;
}

export function QuoteComparison({ quote1, quote2 }: QuoteComparisonProps) {
  const fields = [
    { key: 'cpo_id', label: 'CPO ID' },
    { key: 'master_customer_name', label: 'Master Customer' },
    { key: 'stage', label: 'Stage' },
    { key: 'usd_value', label: 'USD Value' },
    { key: 'probability', label: 'Probability' },
    { key: 'close_date', label: 'Close Date' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Field</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quote 1</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quote 2</th>
          </tr>
        </thead>
        <tbody>
          {fields.map(field => {
            const value1 = (quote1 as any)[field.key];
            const value2 = (quote2 as any)[field.key];
            const isDifferent = value1 !== value2;

            return (
              <tr key={field.key} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-sm font-medium text-gray-900">{field.label}</td>
                <td className={`px-4 py-2 text-sm ${isDifferent ? 'bg-yellow-50' : ''}`}>
                  {String(value1)}
                </td>
                <td className={`px-4 py-2 text-sm ${isDifferent ? 'bg-yellow-50' : ''}`}>
                  {String(value2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
