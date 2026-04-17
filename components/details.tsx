'use client';

import GlobalNavigation from './global-navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const quotesData = [
  { id: 1, cpoId: 'CPO-001', revenda: 'TechCorp', endUser: 'ABC Corp', fabricante: 'Cisco', estágio: 'Pipelined', usd: 125000, probability: 25, closeDate: '2026-06-15', territory: 'South', region: 'Americas' },
  { id: 2, cpoId: 'CPO-002', revenda: 'DataSys', endUser: 'XYZ Inc', fabricante: 'HPE', estágio: 'Pricing', usd: 89000, probability: 50, closeDate: '2026-05-20', territory: 'East', region: 'Americas' },
  { id: 3, cpoId: 'CPO-003', revenda: 'CloudTech', endUser: 'Tech Solutions', fabricante: 'VMware', estágio: 'UpSelling', usd: 210000, probability: 50, closeDate: '2026-07-10', territory: 'West', region: 'Americas' },
  { id: 4, cpoId: 'CPO-004', revenda: 'NetVision', endUser: 'Enterprise Ltd', fabricante: 'NetApp', estágio: 'Committed', usd: 95000, probability: 75, closeDate: '2026-04-30', territory: 'North', region: 'Europe' },
  { id: 5, cpoId: 'CPO-005', revenda: 'TechCorp', endUser: 'Global Tech', fabricante: 'Dell', estágio: 'Committed', usd: 420000, probability: 75, closeDate: '2026-05-15', territory: 'South', region: 'Americas' },
  { id: 6, cpoId: 'CPO-006', revenda: 'DataSys', endUser: 'Info Systems', fabricante: 'Cisco', estágio: 'Pricing', usd: 156000, probability: 25, closeDate: '2026-06-30', territory: 'East', region: 'Americas' },
];

export default function Details() {
  const handleExportCSV = () => {
    const headers = ['CPO ID', 'Revenda', 'End User', 'Fabricante', 'Estágio', 'USD', 'Probabilidade', 'Close Date', 'Territory', 'Region'];
    const rows = quotesData.map(q => [q.cpoId, q.revenda, q.endUser, q.fabricante, q.estágio, q.usd, q.probability, q.closeDate, q.territory, q.region]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline-details.csv';
    a.click();
  };

  const handleExportForecast = () => {
    const forecastData = quotesData.map(q => ({
      'CPO ID': q.cpoId,
      'Revenue': q.usd,
      'Stage': q.estágio,
      'Close Date': q.closeDate,
      'Territory': q.territory,
    }));
    
    const csv = ['CPO ID,Revenue,Stage,Close Date,Territory', ...forecastData.map(row => `${row['CPO ID']},${row.Revenue},${row.Stage},${row['Close Date']},${row.Territory}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline-forecast.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline Details</h1>
            <p className="text-gray-600 mt-2">Visualização analítica linha a linha com 20+ campos</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded">
              Exportar CSV
            </Button>
            <Button onClick={handleExportForecast} className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded">
              Exportar Forecast
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPO ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fabricante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estágio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">USD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prob %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Close Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Territory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotesData.map(quote => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{quote.cpoId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote.revenda}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quote.endUser}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quote.fabricante}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {quote.estágio}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${quote.usd.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quote.probability}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quote.closeDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quote.territory}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quote.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
