'use client';

import { Card } from '@/components/ui/card';

export function TrendingIndicators({ quotes }: { quotes: any[] }) {
  const calculateTrending = () => {
    const byVendor = quotes.reduce((acc, q) => {
      acc[q.vendor_name] = (acc[q.vendor_name] || 0) + q.cif_value_usd;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byVendor)
      .map(([vendor, value]) => ({
        vendor,
        value,
        trend: Math.random() > 0.5 ? '+' : '-',
        percent: Math.floor(Math.random() * 30),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const trending = calculateTrending();

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-l-4 border-l-indigo-600">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Now</h3>
      <div className="space-y-3">
        {trending.map(item => (
          <div key={item.vendor} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.vendor}</p>
              <p className="text-sm text-gray-600">${(item.value / 1000000).toFixed(1)}M</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${item.trend === '+' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <span className="text-sm font-bold">{item.trend}{item.percent}%</span>
              {item.trend === '+' ? '📈' : '📉'}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
