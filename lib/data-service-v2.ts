import { Quote, BatchFilter, DashboardKPI, ChartData } from '@/types';
import { generateMockQuotes } from './mock-data';

class DataService {
  private quotes: Quote[] = [];

  constructor() {
    this.quotes = generateMockQuotes();
  }

  getAllQuotes(): Quote[] {
    return this.quotes;
  }

  filterQuotes(filters: BatchFilter): Quote[] {
    return this.quotes.filter(quote => {
      if (filters.quote_number && !quote.quote_number.includes(filters.quote_number)) return false;
      if (filters.quote_stage && quote.quote_stage !== filters.quote_stage) return false;
      if (filters.vendor_name && quote.vendor_name !== filters.vendor_name) return false;
      if (filters.master_customer && !quote.master_customer_name.includes(filters.master_customer)) return false;
      if (filters.probability_min && quote.probability_percentage < filters.probability_min) return false;
      if (filters.probability_max && quote.probability_percentage > filters.probability_max) return false;
      if (filters.sales_territory && quote.sales_territory !== filters.sales_territory) return false;
      if (filters.team && quote.team !== filters.team) return false;
      if (filters.is_budgetary !== undefined && quote.is_budgetary !== filters.is_budgetary) return false;
      if (filters.date_from && quote.cpo_entry_datetime < filters.date_from) return false;
      if (filters.date_to && quote.cpo_entry_datetime > filters.date_to) return false;
      if (filters.close_date_from && quote.projected_close_date < filters.close_date_from) return false;
      if (filters.close_date_to && quote.projected_close_date > filters.close_date_to) return false;
      return true;
    });
  }

  // Dashboard KPIs
  getKPIs(quotes: Quote[]): DashboardKPI[] {
    const pipelined = quotes.reduce((sum, q) => sum + (q.quote_stage === 'Pipelined' ? q.cif_value_usd : 0), 0);
    const pricing = quotes.reduce((sum, q) => sum + (q.quote_stage === 'Pricing 25%' ? q.cif_value_usd : 0), 0);
    const upSelling = quotes.reduce((sum, q) => sum + (q.quote_stage === 'Up Selling 50%' ? q.cif_value_usd : 0), 0);
    const committed = quotes.reduce((sum, q) => sum + (q.quote_stage === 'Committed 75%' ? q.cif_value_usd : 0), 0);
    const netLost = quotes.reduce((sum, q) => sum + (q.quote_stage === 'Net Lost' ? q.cif_value_usd : 0), 0);
    const total = pipelined + pricing + upSelling + committed + netLost;
    const budgetary = quotes.filter(q => q.is_budgetary).reduce((sum, q) => sum + q.cif_value_usd, 0);
    const notClassified = quotes.filter(q => !q.quote_stage).reduce((sum, q) => sum + q.cif_value_usd, 0);

    return [
      { label: 'Pipelined', value: pipelined, format: 'currency', color: 'bg-blue-500' },
      { label: 'Pricing 25%', value: pricing, format: 'currency', color: 'bg-purple-500' },
      { label: 'Up Selling 50%', value: upSelling, format: 'currency', color: 'bg-orange-500' },
      { label: 'Committed 75%', value: committed, format: 'currency', color: 'bg-green-500' },
      { label: 'Net Lost', value: netLost, format: 'currency', color: 'bg-red-500' },
      { label: 'Total Pipeline', value: total, format: 'currency', color: 'bg-gray-800' },
      { label: 'Budgetary', value: budgetary, format: 'currency', color: 'bg-yellow-500' },
      { label: 'Quote Count', value: quotes.length, format: 'count', color: 'bg-indigo-500' },
      { label: 'Not Classified', value: notClassified, format: 'currency', color: 'bg-gray-400' },
      { label: 'Avg Probability', value: quotes.length > 0 ? Math.round(quotes.reduce((sum, q) => sum + q.probability_percentage, 0) / quotes.length) : 0, format: 'percentage', color: 'bg-cyan-500' },
      { label: 'Lost Deals', value: quotes.filter(q => q.is_lost).length, format: 'count', color: 'bg-red-600' },
      { label: 'Win Rate', value: quotes.length > 0 ? Math.round((quotes.filter(q => q.quote_stage === 'Committed 75%').length / quotes.length) * 100) : 0, format: 'percentage', color: 'bg-emerald-500' },
    ];
  }

  // Chart data generation
  getStageDistribution(quotes: Quote[]): ChartData[] {
    const stages = ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'];
    return stages.map(stage => {
      const filtered = quotes.filter(q => q.quote_stage === stage);
      return {
        name: stage,
        value: filtered.reduce((sum, q) => sum + q.cif_value_usd, 0),
        count: filtered.length,
      };
    });
  }

  getTopVendors(quotes: Quote[], limit = 10): ChartData[] {
    const vendorMap = new Map<string, { value: number; count: number }>();
    quotes.forEach(q => {
      if (!vendorMap.has(q.vendor_name)) {
        vendorMap.set(q.vendor_name, { value: 0, count: 0 });
      }
      const entry = vendorMap.get(q.vendor_name)!;
      entry.value += q.cif_value_usd;
      entry.count += 1;
    });
    return Array.from(vendorMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  getTopRevendas(quotes: Quote[], limit = 10): ChartData[] {
    const revendaMap = new Map<string, { value: number; count: number }>();
    quotes.forEach(q => {
      if (!revendaMap.has(q.master_customer_name)) {
        revendaMap.set(q.master_customer_name, { value: 0, count: 0 });
      }
      const entry = revendaMap.get(q.master_customer_name)!;
      entry.value += q.cif_value_usd;
      entry.count += 1;
    });
    return Array.from(revendaMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  getTerritoryDistribution(quotes: Quote[]): ChartData[] {
    const territoryMap = new Map<string, { value: number; count: number }>();
    quotes.forEach(q => {
      if (!territoryMap.has(q.sales_territory)) {
        territoryMap.set(q.sales_territory, { value: 0, count: 0 });
      }
      const entry = territoryMap.get(q.sales_territory)!;
      entry.value += q.cif_value_usd;
      entry.count += 1;
    });
    return Array.from(territoryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);
  }

  getUniqueValues(field: keyof Quote): string[] {
    const values = new Set<string>();
    this.quotes.forEach(q => {
      const value = q[field];
      if (value && typeof value === 'string') values.add(value);
    });
    return Array.from(values).sort();
  }

  updateQuote(id: number, updates: Partial<Quote>): Quote | null {
    const quote = this.quotes.find(q => q.id === id);
    if (quote) {
      Object.assign(quote, updates, { updated_at: new Date().toISOString() });
      return quote;
    }
    return null;
  }

  exportToCSV(quotes: Quote[]): string {
    const headers = ['CPO ID', 'Quote #', 'Part No', 'Sales Territory', 'Team', 'Vendor', 'Master Customer', 'End User', 'Stage', 'USD Value', 'Probability', 'Close Date', 'Budgetary', 'Lost', 'Notes'];
    const rows = quotes.map(q => [
      q.cpo_id,
      q.quote_number,
      q.part_no,
      q.sales_territory,
      q.team,
      q.vendor_name,
      q.master_customer_name,
      q.end_user_company,
      q.quote_stage,
      q.cif_value_usd,
      q.probability_percentage,
      q.projected_close_date,
      q.is_budgetary ? 'Yes' : 'No',
      q.is_lost ? 'Yes' : 'No',
      q.notes,
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    return csvContent;
  }
}

export const dataService = new DataService();
