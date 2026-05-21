// In-memory mock store shared between pages (resets on page refresh — demo only)

// ── Comment history ───────────────────────────────────────────────────────────
export type CommentEntry = {
  id: string;
  html: string;      // rich-text HTML content
  author: string;
  timestamp: string; // ISO string
};

// ── Loss reasons ─────────────────────────────────────────────────────────────
export const LOSS_REASONS = [
  'Preco',
  'Concorrente',
  'Orcamento cancelado',
  'Projeto adiado',
  'Requisito tecnico nao atendido',
  'Relacionamento com cliente',
  'Prazo de entrega',
  'Outros',
] as const;

export type LossReason = (typeof LOSS_REASONS)[number] | string;

export type Quote = {
  id: number;
  cpo_id: string;
  part_no: string;
  sales_territory: string;
  team: string;
  vendor: string;
  master_customer: string;
  bill_to?: string;
  end_user: string;
  description: string;
  quote_name: string;
  quote_number: string;
  stage: string;
  probability: number;
  usd_value: number;          // CIF value (displayed as "CIF" in UI)
  net_value?: number;
  fob_value?: number;
  gm_pct?: number;
  cpo_qty?: number;
  budgetary: string;
  close_date: string;
  created_date?: string;
  cpo_no?: string;
  cpo_pay_meth?: string;
  pay_meth_name?: string;
  prod_type?: string;
  renew?: string;             // 'Yes' | 'No'
  pipe_comments?: string;
  quote_comments?: string;
  hts_code?: string;
  hts_description?: string;
  is_engineering_ticket?: string; // 'Yes' | 'No'
  bu: string;
  quote_age: number;
  status: string;
  vpc_code?: string;
  comments?: string;          // current draft in rich text editor (cleared after append to history)
  commentHistory?: CommentEntry[];
  lost_reason?: string;       // required when stage = Net Lost
  lost_comment?: string;      // required when stage = Net Lost
  scenarioGroupId?: string;
};

// ── Scenario / Cenario types ──────────────────────────────────────────────────

export type ScenarioLikelihood = 'mais_provavel' | 'alternativo' | 'menos_provavel';

export const LIKELIHOOD_LABELS: Record<ScenarioLikelihood, string> = {
  mais_provavel:  'Mais Provavel',
  alternativo:    'Alternativo',
  menos_provavel: 'Menos Provavel',
};

export const LIKELIHOOD_COLORS: Record<ScenarioLikelihood, string> = {
  mais_provavel:  'bg-emerald-100 text-emerald-800 border-emerald-200',
  alternativo:    'bg-blue-100 text-blue-800 border-blue-200',
  menos_provavel: 'bg-amber-100 text-amber-800 border-amber-200',
};

export type ScenarioMeta = {
  quoteId: number;
  label: string;
  likelihood: ScenarioLikelihood;
  reason: string;
  isPrimary: boolean;
};

export type ScenarioGroup = {
  id: string;
  name: string;
  scenarios: ScenarioMeta[];
  createdAt: string;
};

// ── ScenarioGroup store ───────────────────────────────────────────────────────

let _groups: ScenarioGroup[] | null = null;

export function getScenarioGroups(): ScenarioGroup[] {
  if (!_groups) _groups = [];
  return _groups;
}

export function addScenarioGroup(group: Omit<ScenarioGroup, 'id' | 'createdAt'>): ScenarioGroup {
  const groups = getScenarioGroups();
  const newGroup: ScenarioGroup = {
    ...group,
    id: `sg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  groups.push(newGroup);
  return newGroup;
}

export function updateScenarioGroup(
  id: string,
  update: Partial<Omit<ScenarioGroup, 'id' | 'createdAt'>>
): void {
  const groups = getScenarioGroups();
  const idx = groups.findIndex(g => g.id === id);
  if (idx !== -1) groups[idx] = { ...groups[idx], ...update };
}

export function removeScenarioGroup(id: string): void {
  const groups = getScenarioGroups();
  const idx = groups.findIndex(g => g.id === id);
  if (idx !== -1) groups.splice(idx, 1);
}

/**
 * Returns quotes that should count in pipeline KPIs:
 * - Ungrouped quotes (no scenarioGroupId)
 * - Primary scenario of each group
 */
export function getPrimaryQuotes(quotes: Quote[]): Quote[] {
  const groups = getScenarioGroups();
  return quotes.filter(q => {
    if (!q.scenarioGroupId) return true;
    const group = groups.find(g => g.id === q.scenarioGroupId);
    if (!group) return true;
    const meta = group.scenarios.find(s => s.quoteId === q.id);
    return meta?.isPrimary === true;
  });
}

const PART_PREFIXES = ['NX', 'HP', 'DL', 'CP', 'LN', 'ST', 'VX', 'AX'];
const USD_VALUES = [702000, 241000, 451000, 2348000, 1614000, 2301000, 890000, 340000, 1200000, 560000];
const CLOSE_DATES = ['2025-07-15', '2025-08-01', '2025-06-30', '2025-09-10', '2025-07-22', '2025-08-14', '2025-10-01', '2025-06-20', '2025-09-28', '2025-07-05'];
const CREATED_DATES = ['2025-01-10', '2025-02-14', '2025-03-05', '2025-01-28', '2025-02-01', '2025-03-20', '2025-04-11', '2025-01-05', '2025-03-30', '2025-04-22'];
const PROD_TYPES = ['Hardware', 'Software', 'Services', 'Subscription'];
const PAY_METHS = ['BOLETO', 'WIRE', 'CARD', 'PIX'];
const PAY_METH_NAMES = ['Boleto Bancario', 'Transferencia Bancaria', 'Cartao de Credito', 'PIX'];
const HTS_CODES = ['8471.30.90', '8517.62.91', '8543.70.99', '8528.59.29', '8536.50.90'];
const HTS_DESCS = ['Computadores Portateis', 'Aparelhos de Telecomunicacao', 'Equipamentos Eletronicos', 'Monitores', 'Dispositivos de Controle'];
const VPC_CODES = ['VPC-SP01', 'VPC-RJ02', 'VPC-MG03', 'VPC-BA04', 'VPC-PR05'];
const BILL_TO_LIST = ['Matriz SP', 'Filial RJ', 'Filial MG', 'Filial BA', 'Filial PR'];
const CPO_PAY_METHS = ['NET30', 'NET60', 'ADVANCE', 'COD'];

function buildInitial(): Quote[] {
  return Array.from({ length: 85 }, (_, i) => {
    const cifVal = USD_VALUES[i % USD_VALUES.length];
    const netVal = Math.round(cifVal * 0.88);
    const fobVal = Math.round(cifVal * 0.82);
    const gm = parseFloat((8 + (i % 15)).toFixed(1));
    return {
      id: i + 1,
      cpo_id: `CPO-${String(i + 1001).padStart(4, '0').slice(-4)}`,
      vpc_code: VPC_CODES[i % VPC_CODES.length],
      part_no: `${PART_PREFIXES[i % PART_PREFIXES.length]}-${String(10000 + i * 137).slice(-5)}`,
      description: `Solucao ${PART_PREFIXES[i % PART_PREFIXES.length]} Enterprise`,
      sales_territory: ['Sao Paulo', 'Rio de Janeiro', 'Minas Gerais'][i % 3],
      team: ['Team Alpha', 'Team Beta', 'Team Gamma'][i % 3],
      vendor: ['Cisco', 'HPE', 'Dell', 'Lenovo'][i % 4],
      master_customer: `Revenda ${String.fromCharCode(65 + (i % 5))}`,
      bill_to: BILL_TO_LIST[i % BILL_TO_LIST.length],
      end_user: `Cliente ${i + 1} Ltda`,
      usd_value: cifVal,         // CIF
      net_value: netVal,
      fob_value: fobVal,
      gm_pct: gm,
      cpo_qty: 1 + (i % 10),
      stage: ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'][i % 5],
      probability: [20, 40, 60, 80, 0][i % 5],
      lost_reason: i % 5 === 4 ? LOSS_REASONS[i % LOSS_REASONS.length] : undefined,
      lost_comment: i % 5 === 4 ? 'Perda registrada automaticamente no seed de dados.' : undefined,
      created_date: CREATED_DATES[i % CREATED_DATES.length],
      close_date: CLOSE_DATES[i % CLOSE_DATES.length],
      cpo_no: `CPO-NO-${String(5000 + i).slice(-4)}`,
      cpo_pay_meth: CPO_PAY_METHS[i % CPO_PAY_METHS.length],
      pay_meth_name: PAY_METH_NAMES[i % PAY_METH_NAMES.length],
      quote_name: `QT-${String(2024000 + i).slice(-6)}`,
      prod_type: PROD_TYPES[i % PROD_TYPES.length],
      renew: i % 4 === 0 ? 'Yes' : 'No',
      pipe_comments: i % 7 === 0 ? 'Oportunidade estrategica. Acompanhar com cliente.' : '',
      quote_comments: i % 9 === 0 ? 'Aprovacao necessaria do financeiro.' : '',
      budgetary: i % 3 === 0 ? 'Yes' : 'No',
      hts_code: HTS_CODES[i % HTS_CODES.length],
      hts_description: HTS_DESCS[i % HTS_DESCS.length],
      is_engineering_ticket: i % 6 === 0 ? 'Yes' : 'No',
      quote_number: `QN-${String(i + 1001).padStart(4, '0').slice(-4)}`,
      bu: ['BU Storage', 'BU Network', 'BU Compute'][i % 3],
      quote_age: 0,
      status: ['SALESORDER', 'QUOTEPO', 'CANCELLED'][i % 3],
    };
  });
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

export function updateQuote(id: number, update: Partial<Quote>): void {
  const quotes = getQuotes();
  const idx = quotes.findIndex(q => q.id === id);
  if (idx !== -1) quotes[idx] = { ...quotes[idx], ...update };
}
