'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function QuickAccessBar() {
  const { addNotification } = useAppContext();
  const [recentQueries, setRecentQueries] = useState([
    { id: 1, name: 'Q1 High Value Deals', filters: { stage: 'Committed 75%', min_usd: 100000 } },
    { id: 2, name: 'Expiring This Week', filters: { date_to: 'next-7-days' } },
    { id: 3, name: 'Top Vendors', filters: { sort_by: 'vendor_volume' } },
  ]);

  const handleLoadQuery = (query: any) => {
    addNotification(`Loaded: ${query.name}`, 'info');
  };

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <p className="text-sm font-semibold text-gray-700 mb-3">Últimas Consultas (Quick Access)</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {recentQueries.map(query => (
          <button
            key={query.id}
            onClick={() => handleLoadQuery(query)}
            className="px-4 py-2 bg-white border border-blue-300 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-500 transition-all whitespace-nowrap flex-shrink-0"
          >
            {query.name}
          </button>
        ))}
      </div>
    </div>
  );
}
