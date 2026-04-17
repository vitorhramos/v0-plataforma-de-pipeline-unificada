'use client';

import { Quote } from '@/types';

interface MobileCardViewProps {
  quotes: Quote[];
}

export function MobileCardView({ quotes }: MobileCardViewProps) {
  return (
    <div className="space-y-3 md:hidden">
      {quotes.map(quote => (
        <div
          key={quote.id}
          className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="font-medium text-blue-600">{quote.cpo_id}</div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {quote.stage}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <div className="text-gray-500 text-xs">Customer</div>
              <div className="font-medium">{quote.master_customer_name}</div>
            </div>
            <div className="flex justify-between">
              <div>
                <div className="text-gray-500 text-xs">USD</div>
                <div className="font-bold text-lg">${quote.usd_value.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Prob</div>
                <div className="font-bold">{quote.probability}%</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
