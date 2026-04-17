'use client';

import { Quote } from '@/types';

export function useExport() {
  const exportToCSV = (quotes: Quote[], filename: string = 'quotes.csv') => {
    const headers = [
      'CPO_ID',
      'Quote#',
      'Master Customer',
      'End User',
      'Fabricante',
      'Vendedor',
      'Territory',
      'Stage',
      'Quote Name',
      'USD Value',
      'Probability',
      'Close Date',
      'Budgetary',
      'Lost',
    ];

    const rows = quotes.map(q => [
      q.cpo_id,
      q.quote_number,
      q.master_customer,
      q.end_user,
      q.fabricante,
      q.sales_rep,
      q.territory,
      q.stage,
      q.quote_name,
      q.usd_value,
      q.probability,
      new Date(q.projected_close_date).toLocaleDateString(),
      q.is_budgetary ? 'Yes' : 'No',
      q.is_lost ? 'Yes' : 'No',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (quotes: Quote[], filename: string = 'quotes.xlsx') => {
    // Note: This is a simplified version. For production, use a library like xlsx
    exportToCSV(quotes, filename.replace('.xlsx', '.csv'));
  };

  return {
    exportToCSV,
    exportToExcel,
  };
}
