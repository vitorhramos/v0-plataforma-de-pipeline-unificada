// In-memory mock store shared between pages (resets on page refresh — demo only)

export type Quote = {
  id: number;
  cpo_id: string;
  part_no: string;
  sales_territory: string;
  team: string;
  vendor: string;
  master_customer: string;
  end_user: string;
  description: string;
  quote_name: string;
  quote_number: string;
  stage: string;
  probability: number;
  usd_value: number;
  budgetary: string;
  close_date: string;
  bu: string;
  quote_age: number;
  status: string;
};

const PART_PREFIXES = ['NX', 'HP', 'DL', 'CP', 'LN', 'ST', 'VX', 'AX'];
const USD_VALUES = [702000, 241000, 451000, 2348000, 1614000, 2301000, 890000, 340000, 1200000, 560000];
const AGES = [12, 34, 7, 56, 23, 45, 8, 67, 15, 30];
const CLOSE_DATES = ['2025-07-15', '2025-08-01', '2025-06-30', '2025-09-10', '2025-07-22', '2025-08-14', '2025-10-01', '2025-06-20', '2025-09-28', '2025-07-05'];

function buildInitial(): Quote[] {
  return Array.from({ length: 85 }, (_, i) => ({
    id: i + 1,
    cpo_id: `CPO-${String(i + 1001).padStart(4, '0').slice(-4)}`,
    part_no: `${PART_PREFIXES[i % PART_PREFIXES.length]}-${String(10000 + i * 137).slice(-5)}`,
    sales_territory: ['Sao Paulo', 'Rio de Janeiro', 'Minas Gerais'][i % 3],
    team: ['Team Alpha', 'Team Beta', 'Team Gamma'][i % 3],
    vendor: ['Cisco', 'HPE', 'Dell', 'Lenovo'][i % 4],
    master_customer: `Revenda ${String.fromCharCode(65 + (i % 5))}`,
    end_user: `Cliente ${i + 1} Ltda`,
    description: `Solucao ${PART_PREFIXES[i % PART_PREFIXES.length]} Enterprise`,
    quote_name: `QT-${String(2024000 + i).slice(-6)}`,
    quote_number: `QN-${String(i + 1001).padStart(4, '0').slice(-4)}`,
    stage: ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'][i % 5],
    probability: [20, 40, 60, 80, 0][i % 5],
    usd_value: USD_VALUES[i % USD_VALUES.length],
    budgetary: i % 3 === 0 ? 'Yes' : 'No',
    close_date: CLOSE_DATES[i % CLOSE_DATES.length],
    bu: ['BU Storage', 'BU Network', 'BU Compute'][i % 3],
    quote_age: 0,
    status: ['SALESORDER', 'QUOTEPO', 'CANCELLED'][i % 3],
  }));
}

// Module-level singleton — persists across navigations in the same session
let _quotes: Quote[] | null = null;

export function getQuotes(): Quote[] {
  if (!_quotes) _quotes = buildInitial();
  return _quotes;
}

export function addQuote(q: Omit<Quote, 'id' | 'quote_age'>): Quote {
  const quotes = getQuotes();
  const newQuote: Quote = {
    ...q,
    id: quotes.length + 1,
    quote_age: 0,
  };
  quotes.unshift(newQuote);
  return newQuote;
}
