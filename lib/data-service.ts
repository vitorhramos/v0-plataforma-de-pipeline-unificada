// Mock data service - simulates database without requiring external DB connection
export interface Quote {
  id: number;
  cpo_id: string;
  revenda: string;
  end_user: string;
  fabricante: string;
  usd_value: number;
  territory_id: number;
  sales_rep: string;
  stage: 'Pipelined' | 'Pricing 25%' | 'Up Selling 50%' | 'Committed' | 'Net Lost';
  probability: number;
  close_date: string | null;
  is_budgetary: boolean;
  is_lost: boolean;
  lost_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Territory {
  id: number;
  name: string;
  region_id: number;
  manager: string;
}

// Mock data
const mockTerritories: Territory[] = [
  { id: 1, name: 'North America', region_id: 1, manager: 'John Smith' },
  { id: 2, name: 'Latin America', region_id: 1, manager: 'Carlos Rodriguez' },
  { id: 3, name: 'Western Europe', region_id: 2, manager: 'Maria Mueller' },
  { id: 4, name: 'Eastern Europe', region_id: 2, manager: 'Ivan Petrov' },
  { id: 5, name: 'APAC East', region_id: 3, manager: 'Liu Chen' },
  { id: 6, name: 'APAC Southeast', region_id: 3, manager: 'Raj Patel' },
];

const mockQuotes: Quote[] = [
  {
    id: 1,
    cpo_id: 'CPO-001',
    revenda: 'TechCorp Brasil',
    end_user: 'Banco Safra',
    fabricante: 'Cisco',
    usd_value: 125000,
    territory_id: 2,
    sales_rep: 'Carlos Silva',
    stage: 'Committed',
    probability: 75,
    close_date: '2026-05-15',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-01',
    updated_at: '2026-03-15',
  },
  {
    id: 2,
    cpo_id: 'CPO-002',
    revenda: 'DataSys México',
    end_user: 'Grupo Modelo',
    fabricante: 'HPE',
    usd_value: 250000,
    territory_id: 2,
    sales_rep: 'Miguel Santos',
    stage: 'Pricing 25%',
    probability: 25,
    close_date: '2026-07-30',
    is_budgetary: true,
    is_lost: false,
    created_at: '2026-02-20',
    updated_at: '2026-03-10',
  },
  {
    id: 3,
    cpo_id: 'CPO-003',
    revenda: 'CloudTech LATAM',
    end_user: 'Petrobras',
    fabricante: 'VMware',
    usd_value: 450000,
    territory_id: 2,
    sales_rep: 'Ana Costa',
    stage: 'Up Selling 50%',
    probability: 50,
    close_date: '2026-06-15',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-05',
    updated_at: '2026-03-12',
  },
  {
    id: 4,
    cpo_id: 'CPO-004',
    revenda: 'NetVision SA',
    end_user: 'KPMG Brasil',
    fabricante: 'NetApp',
    usd_value: 85000,
    territory_id: 2,
    sales_rep: 'Pedro Oliveira',
    stage: 'Pipelined',
    probability: 0,
    close_date: null,
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-18',
    updated_at: '2026-03-18',
  },
  {
    id: 5,
    cpo_id: 'CPO-005',
    revenda: 'TechCorp NY',
    end_user: 'Morgan Stanley',
    fabricante: 'Dell',
    usd_value: 500000,
    territory_id: 1,
    sales_rep: 'John Wagner',
    stage: 'Committed',
    probability: 75,
    close_date: '2026-04-30',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-02-15',
    updated_at: '2026-03-14',
  },
  {
    id: 6,
    cpo_id: 'CPO-006',
    revenda: 'DataSys CA',
    end_user: 'Google Cloud',
    fabricante: 'Cisco',
    usd_value: 320000,
    territory_id: 1,
    sales_rep: 'Sarah Chen',
    stage: 'Up Selling 50%',
    probability: 50,
    close_date: '2026-06-20',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-02',
    updated_at: '2026-03-16',
  },
  {
    id: 7,
    cpo_id: 'CPO-007',
    revenda: 'CloudTech Boston',
    end_user: 'Red Hat',
    fabricante: 'HPE',
    usd_value: 180000,
    territory_id: 1,
    sales_rep: 'Michael Brown',
    stage: 'Pricing 25%',
    probability: 25,
    close_date: '2026-08-10',
    is_budgetary: true,
    is_lost: false,
    created_at: '2026-03-08',
    updated_at: '2026-03-11',
  },
  {
    id: 8,
    cpo_id: 'CPO-008',
    revenda: 'NetVision Chicago',
    end_user: 'United Airlines',
    fabricante: 'VMware',
    usd_value: 275000,
    territory_id: 1,
    sales_rep: 'Lisa Anderson',
    stage: 'Committed',
    probability: 75,
    close_date: '2026-05-01',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-02-28',
    updated_at: '2026-03-13',
  },
  {
    id: 9,
    cpo_id: 'CPO-009',
    revenda: 'TechCorp Europe',
    end_user: 'Siemens',
    fabricante: 'NetApp',
    usd_value: 350000,
    territory_id: 3,
    sales_rep: 'Hans Mueller',
    stage: 'Up Selling 50%',
    probability: 50,
    close_date: '2026-07-15',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-04',
    updated_at: '2026-03-15',
  },
  {
    id: 10,
    cpo_id: 'CPO-010',
    revenda: 'DataSys France',
    end_user: "L'Oreal",
    fabricante: 'Cisco',
    usd_value: 200000,
    territory_id: 3,
    sales_rep: 'Pierre Dubois',
    stage: 'Pipelined',
    probability: 0,
    close_date: null,
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-17',
    updated_at: '2026-03-17',
  },
  {
    id: 11,
    cpo_id: 'CPO-011',
    revenda: 'CloudTech UK',
    end_user: 'Unilever',
    fabricante: 'Dell',
    usd_value: 420000,
    territory_id: 3,
    sales_rep: 'James Wilson',
    stage: 'Pricing 25%',
    probability: 25,
    close_date: '2026-09-01',
    is_budgetary: true,
    is_lost: false,
    created_at: '2026-03-06',
    updated_at: '2026-03-12',
  },
  {
    id: 12,
    cpo_id: 'CPO-012',
    revenda: 'NetVision Germany',
    end_user: 'Bayer',
    fabricante: 'HPE',
    usd_value: 160000,
    territory_id: 3,
    sales_rep: 'Klaus Schmidt',
    stage: 'Committed',
    probability: 75,
    close_date: '2026-05-20',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-02-25',
    updated_at: '2026-03-14',
  },
  {
    id: 13,
    cpo_id: 'CPO-013',
    revenda: 'TechCorp Singapore',
    end_user: 'DBS Bank',
    fabricante: 'VMware',
    usd_value: 310000,
    territory_id: 5,
    sales_rep: 'David Lim',
    stage: 'Up Selling 50%',
    probability: 50,
    close_date: '2026-06-30',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-03',
    updated_at: '2026-03-16',
  },
  {
    id: 14,
    cpo_id: 'CPO-014',
    revenda: 'DataSys Tokyo',
    end_user: 'NEC',
    fabricante: 'NetApp',
    usd_value: 220000,
    territory_id: 5,
    sales_rep: 'Kenji Tanaka',
    stage: 'Pricing 25%',
    probability: 25,
    close_date: '2026-08-15',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-09',
    updated_at: '2026-03-15',
  },
  {
    id: 15,
    cpo_id: 'CPO-015',
    revenda: 'CloudTech Sydney',
    end_user: 'Telstra',
    fabricante: 'Cisco',
    usd_value: 270000,
    territory_id: 5,
    sales_rep: 'Robert Smith',
    stage: 'Committed',
    probability: 75,
    close_date: '2026-04-15',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-02-22',
    updated_at: '2026-03-13',
  },
  {
    id: 16,
    cpo_id: 'CPO-016',
    revenda: 'NetVision Bangkok',
    end_user: 'CP Group',
    fabricante: 'Dell',
    usd_value: 145000,
    territory_id: 6,
    sales_rep: 'Somchai Phuket',
    stage: 'Pipelined',
    probability: 0,
    close_date: null,
    is_budgetary: true,
    is_lost: false,
    created_at: '2026-03-19',
    updated_at: '2026-03-19',
  },
  {
    id: 17,
    cpo_id: 'CPO-017',
    revenda: 'TechCorp Mumbai',
    end_user: 'TCS',
    fabricante: 'HPE',
    usd_value: 380000,
    territory_id: 6,
    sales_rep: 'Rajesh Kumar',
    stage: 'Up Selling 50%',
    probability: 50,
    close_date: '2026-07-01',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-07',
    updated_at: '2026-03-14',
  },
  {
    id: 18,
    cpo_id: 'CPO-018',
    revenda: 'DataSys Jakarta',
    end_user: 'Telkom',
    fabricante: 'VMware',
    usd_value: 95000,
    territory_id: 6,
    sales_rep: 'Budi Santoso',
    stage: 'Pricing 25%',
    probability: 25,
    close_date: '2026-09-30',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-10',
    updated_at: '2026-03-16',
  },
  {
    id: 19,
    cpo_id: 'CPO-019',
    revenda: 'CloudTech Seoul',
    end_user: 'Samsung',
    fabricante: 'NetApp',
    usd_value: 500000,
    territory_id: 5,
    sales_rep: 'Kim Min-jun',
    stage: 'Committed',
    probability: 75,
    close_date: '2026-05-10',
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-02-18',
    updated_at: '2026-03-12',
  },
  {
    id: 20,
    cpo_id: 'CPO-020',
    revenda: 'NetVision Manila',
    end_user: 'Ayala Group',
    fabricante: 'Cisco',
    usd_value: 175000,
    territory_id: 6,
    sales_rep: 'Juan Dela Cruz',
    stage: 'Pipelined',
    probability: 0,
    close_date: null,
    is_budgetary: false,
    is_lost: false,
    created_at: '2026-03-20',
    updated_at: '2026-03-20',
  },
];

// API functions
export function getAllQuotes(): Quote[] {
  return mockQuotes;
}

export function getQuoteById(id: number): Quote | undefined {
  return mockQuotes.find(q => q.id === id);
}

export function filterQuotes(filters: Record<string, any>): Quote[] {
  return mockQuotes.filter(quote => {
    // Filter by USD range
    if (filters.minUsd && quote.usd_value < filters.minUsd) return false;
    if (filters.maxUsd && quote.usd_value > filters.maxUsd) return false;

    // Filter by stage
    if (filters.stage && quote.stage !== filters.stage) return false;

    // Filter by revenda
    if (filters.revenda && !quote.revenda.toLowerCase().includes(filters.revenda.toLowerCase())) return false;

    // Filter by fabricante
    if (filters.fabricante && quote.fabricante !== filters.fabricante) return false;

    // Filter by territory
    if (filters.territory && quote.territory_id !== filters.territory) return false;

    // Filter by search term (CPO, end_user, sales_rep)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesCPO = quote.cpo_id.toLowerCase().includes(searchLower);
      const matchesEndUser = quote.end_user.toLowerCase().includes(searchLower);
      const matchesSalesRep = quote.sales_rep.toLowerCase().includes(searchLower);
      if (!matchesCPO && !matchesEndUser && !matchesSalesRep) return false;
    }

    // Filter by budgetary
    if (filters.budgetary !== undefined && quote.is_budgetary !== filters.budgetary) return false;

    return true;
  });
}

export function getStatistics(quotes: Quote[] = mockQuotes) {
  const total = quotes.length;
  const pipelined = quotes.filter(q => q.stage === 'Pipelined').reduce((sum, q) => sum + q.usd_value, 0);
  const notClassified = quotes.filter(q => q.stage === 'Pipelined').length;
  const pricing25 = quotes.filter(q => q.stage === 'Pricing 25%').reduce((sum, q) => sum + q.usd_value, 0);
  const upSelling50 = quotes.filter(q => q.stage === 'Up Selling 50%').reduce((sum, q) => sum + q.usd_value, 0);
  const committed75 = quotes.filter(q => q.stage === 'Committed').reduce((sum, q) => sum + q.usd_value, 0);
  const netLost = quotes.filter(q => q.is_lost).reduce((sum, q) => sum + q.usd_value, 0);

  return {
    totalQuotes: total,
    pipelinedUSD: pipelined,
    notClassifiedCount: notClassified,
    pricing25USD: pricing25,
    upSelling50USD: upSelling50,
    committed75USD: committed75,
    netLostUSD: netLost,
  };
}

export function getTerritories(): Territory[] {
  return mockTerritories;
}

export function getUniqueFabricantes(): string[] {
  return [...new Set(mockQuotes.map(q => q.fabricante))].sort();
}

export function getUniqueRevendas(): string[] {
  return [...new Set(mockQuotes.map(q => q.revenda))].sort();
}
