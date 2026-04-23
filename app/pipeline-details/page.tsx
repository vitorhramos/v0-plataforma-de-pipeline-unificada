'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Pencil, Check, History, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { Breadcrumbs, Tooltip } from '@/components/common/breadcrumbs-tooltips';
import { useOperationHistory } from '@/components/common/operation-history';
import { useToast } from '@/components/common/toast';
import { getQuotes } from '@/lib/mock-store';



type Quote = {
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

type VersionEntry = {
  timestamp: string;
  field: string;
  oldValue: string;
  newValue: string;
  user: string;
};



// ─── Constants ────────────────────────────────────────────────────────────────
const VENDORS_LIST = ['Cisco', 'HPE', 'Dell', 'Lenovo'];
const TERRITORIES_LIST = ['Sao Paulo', 'Rio de Janeiro', 'Minas Gerais'];
const BU_LIST = ['BU Storage', 'BU Network', 'BU Compute'];
const STAGES_LIST = ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'];
const REVENDA_LIST = ['Revenda A', 'Revenda B', 'Revenda C', 'Revenda D', 'Revenda E'];
const ALL_STATUSES = ['BACKORDER', 'BOSOSPLIT', 'CONVERTOK', 'PARTIALBO', 'SALESORDER', 'TERMSFIX', 'QUOTEPO', 'QUOTESHEET', 'READYAF', 'POCHANGE', 'POLINEQC', 'CANCELLED'];

const STATUS_GROUPS = {
  'Virou Pedido': ['BACKORDER', 'BOSOSPLIT', 'CONVERTOK', 'PARTIALBO', 'SALESORDER', 'TERMSFIX'],
  'Quote Ativa':  ['QUOTEPO', 'QUOTESHEET', 'READYAF', 'POCHANGE', 'POLINEQC'],
  'Quote Cancelada': ['CANCELLED'],
};

const STATUS_COLORS: Record<string, string> = {
  BACKORDER: 'bg-emerald-100 text-emerald-800',
  BOSOSPLIT: 'bg-emerald-100 text-emerald-800',
  CONVERTOK: 'bg-emerald-100 text-emerald-800',
  PARTIALBO: 'bg-emerald-100 text-emerald-800',
  SALESORDER: 'bg-emerald-100 text-emerald-800',
  TERMSFIX: 'bg-emerald-100 text-emerald-800',
  QUOTEPO: 'bg-blue-100 text-blue-800',
  QUOTESHEET: 'bg-blue-100 text-blue-800',
  READYAF: 'bg-blue-100 text-blue-800',
  POCHANGE: 'bg-blue-100 text-blue-800',
  POLINEQC: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STAGE_COLORS: Record<string, string> = {
  'Pipelined':      'bg-blue-100 text-blue-800',
  'Pricing 25%':    'bg-violet-100 text-violet-800',
  'Up Selling 50%': 'bg-amber-100 text-amber-800',
  'Committed 75%':  'bg-emerald-100 text-emerald-800',
  'Net Lost':       'bg-red-100 text-red-700',
};

const EMPTY_FILTERS = {
  // Identification
  cpo_id: '', part_no: '', quote_name: '',
  // Classification
  stage: '', vendor: '', territory: '', bu: '', revenda: '', end_user: '',
  // Status
  status: '',
  // Values
  min_usd: '', max_usd: '', min_prob: '', max_prob: '',
  // Date & flags
  budgetary: '', close_date_from: '', close_date_to: '',
  // Age
  max_age: '',
};

// Editable fields config for bulk edit and modal
const EDITABLE_FIELDS: { key: keyof Quote; label: string; type: 'text' | 'select' | 'number' | 'date'; options?: string[] }[] = [
  { key: 'stage',           label: 'Stage',          type: 'select', options: STAGES_LIST },
  { key: 'vendor',          label: 'Vendor',         type: 'select', options: VENDORS_LIST },
  { key: 'sales_territory', label: 'Territory',      type: 'select', options: TERRITORIES_LIST },
  { key: 'team',            label: 'Team',           type: 'text' },
  { key: 'master_customer', label: 'Revenda',        type: 'text' },
  { key: 'end_user',        label: 'End User',       type: 'text' },
  { key: 'bu',              label: 'BU',             type: 'select', options: BU_LIST },
  { key: 'status',          label: 'Status',         type: 'select', options: Object.values(STATUS_GROUPS).flat() },
  { key: 'budgetary',       label: 'Budgetary',      type: 'select', options: ['Yes', 'No'] },
  { key: 'probability',     label: 'Prob %',         type: 'number' },
  { key: 'usd_value',       label: 'USD Value',      type: 'number' },
  { key: 'close_date',      label: 'Close Date',     type: 'date' },
  { key: 'part_no',         label: 'Part No',        type: 'text' },
  { key: 'quote_name',      label: 'Quote Name',     type: 'text' },
  { key: 'description',     label: 'Descricao',      type: 'text' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function PipelineDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<Record<number, VersionEntry[]>>({});

  // Parse URL params into filters on mount
  const getFiltersFromUrl = useCallback(() => {
    const f = { ...EMPTY_FILTERS };
    (Object.keys(EMPTY_FILTERS) as (keyof typeof EMPTY_FILTERS)[]).forEach(key => {
      const val = searchParams.get(key);
      if (val) f[key] = val;
    });
    return f;
  }, [searchParams]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuotes(getQuotes());
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Sync filters to URL
  const syncFiltersToUrl = useCallback((newApplied: typeof EMPTY_FILTERS) => {
    const params = new URLSearchParams();
    (Object.entries(newApplied) as [keyof typeof EMPTY_FILTERS, string][]).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '/pipeline-details', { scroll: false });
  }, [router]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(() => getFiltersFromUrl());
  const [applied, setApplied] = useState(() => getFiltersFromUrl());

  // Sorting
  const [sortKey, setSortKey] = useState<keyof Quote | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof Quote) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Column definitions (source of truth)
  const ALL_COLUMNS: { label: string; key: keyof Quote }[] = [
    { label: 'CPO ID',     key: 'cpo_id' },
    { label: 'Part No',    key: 'part_no' },
    { label: 'Territory',  key: 'sales_territory' },
    { label: 'Vendor',     key: 'vendor' },
    { label: 'Revenda',    key: 'master_customer' },
    { label: 'End User',   key: 'end_user' },
    { label: 'Quote Name', key: 'quote_name' },
    { label: 'Stage',      key: 'stage' },
    { label: 'Prob',       key: 'probability' },
    { label: 'USD',        key: 'usd_value' },
    { label: 'Budget',     key: 'budgetary' },
    { label: 'Close Date', key: 'close_date' },
    { label: 'Age',        key: 'quote_age' },
    { label: 'Status',     key: 'status' },
    { label: 'BU',         key: 'bu' },
  ];

  const DEFAULT_COL_ORDER = ALL_COLUMNS.map(c => c.key);

  const [colOrder, setColOrder] = useState<(keyof Quote)[]>(() => {
    try {
      const saved = localStorage.getItem('pipeline-col-order');
      if (saved) {
        const parsed: (keyof Quote)[] = JSON.parse(saved);
        // Ensure all columns present (new columns added later)
        const merged = [...parsed.filter(k => DEFAULT_COL_ORDER.includes(k)), ...DEFAULT_COL_ORDER.filter(k => !parsed.includes(k))];
        return merged;
      }
    } catch {}
    return DEFAULT_COL_ORDER;
  });

  const [dragOverKey, setDragOverKey] = useState<keyof Quote | null>(null);
  const dragSrcKey = useRef<keyof Quote | null>(null);
  const dragStartTime = useRef<number>(0);

  const orderedColumns = colOrder.map(k => ALL_COLUMNS.find(c => c.key === k)!).filter(Boolean);

  const handleDragStart = (key: keyof Quote) => {
    dragSrcKey.current = key;
    dragStartTime.current = Date.now();
  };

  const handleDragOver = (e: React.DragEvent, key: keyof Quote) => {
    e.preventDefault();
    if (key !== dragSrcKey.current) setDragOverKey(key);
  };

  const handleDrop = (targetKey: keyof Quote) => {
    const src = dragSrcKey.current;
    if (!src || src === targetKey) { setDragOverKey(null); return; }
    const next = [...colOrder];
    const srcIdx = next.indexOf(src);
    const tgtIdx = next.indexOf(targetKey);
    next.splice(srcIdx, 1);
    next.splice(tgtIdx, 0, src);
    setColOrder(next);
    localStorage.setItem('pipeline-col-order', JSON.stringify(next));
    dragSrcKey.current = null;
    setDragOverKey(null);
  };

  const handleHeaderClick = (key: keyof Quote) => {
    // Only sort if not a drag (drag took > 200ms)
    if (Date.now() - dragStartTime.current < 200) return;
    handleSort(key);
  };

  // Edit modal
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Quote>>({});
  const [historyQuote, setHistoryQuote] = useState<Quote | null>(null);

  // Bulk edit
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkField, setBulkField] = useState<keyof Quote | ''>('');
  const [bulkValue, setBulkValue] = useState('');
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [undoStack, setUndoStack] = useState<{ quotes: Quote[]; desc: string }[]>([]);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const { add: addToHistory } = useOperationHistory();
  const toast = useToast();

  const setF = (key: string, val: string) => setFilters(p => ({ ...p, [key]: val }));
  const inp = 'w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';
  const lbl = 'block text-[11px] font-semibold text-gray-500 mb-1';

  const activeCount = Object.values(applied).filter(v => v !== '').length;

  // ── Filtering ──
  const filteredQuotes = quotes.filter(q => {
    const term = searchTerm.toLowerCase();
    if (term && !q.quote_name.toLowerCase().includes(term) && !q.cpo_id.toLowerCase().includes(term) && !q.part_no.toLowerCase().includes(term)) return false;
    // Identification
    if (applied.cpo_id && !q.cpo_id.toLowerCase().includes(applied.cpo_id.toLowerCase())) return false;
    if (applied.part_no && !q.part_no.toLowerCase().includes(applied.part_no.toLowerCase())) return false;
    if (applied.quote_name && !q.quote_name.toLowerCase().includes(applied.quote_name.toLowerCase())) return false;
    // Classification
    if (applied.stage && q.stage !== applied.stage) return false;
    if (applied.vendor && q.vendor !== applied.vendor) return false;
    if (applied.territory && q.sales_territory !== applied.territory) return false;
    if (applied.bu && q.bu !== applied.bu) return false;
    if (applied.revenda && q.master_customer !== applied.revenda) return false;
    if (applied.end_user && !q.end_user.toLowerCase().includes(applied.end_user.toLowerCase())) return false;
    // Status
    if (applied.status && q.status !== applied.status) return false;
    // Values
    if (applied.min_usd && q.usd_value < parseInt(applied.min_usd)) return false;
    if (applied.max_usd && q.usd_value > parseInt(applied.max_usd)) return false;
    if (applied.min_prob && q.probability < parseInt(applied.min_prob)) return false;
    if (applied.max_prob && q.probability > parseInt(applied.max_prob)) return false;
    // Flags
    if (applied.budgetary === 'yes' && q.budgetary !== 'Yes') return false;
    if (applied.budgetary === 'no' && q.budgetary !== 'No') return false;
    // Date
    if (applied.close_date_from && q.close_date < applied.close_date_from) return false;
    if (applied.close_date_to && q.close_date > applied.close_date_to) return false;
    // Age
    if (applied.max_age && q.quote_age > parseInt(applied.max_age)) return false;
    return true;
  });

  // Apply sorting
  const sortedQuotes = sortKey
    ? [...filteredQuotes].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredQuotes;

  const paginatedQuotes = sortedQuotes.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(sortedQuotes.length / pageSize);

  const totalUsd = filteredQuotes.reduce((s, q) => s + q.usd_value, 0);
  const budgetaryCount = filteredQuotes.filter(q => q.budgetary === 'Yes').length;
  const avgProb = filteredQuotes.length > 0
    ? Math.round(filteredQuotes.reduce((s, q) => s + q.probability, 0) / filteredQuotes.length)
    : 0;

  const handleExport = (format: 'CSV' | 'Excel') => {
    const headers = ['CPO ID', 'Part No', 'Territory', 'Vendor', 'Revenda', 'End User', 'Quote Name', 'Stage', 'Prob %', 'USD Value', 'Budget', 'Close Date', 'Age', 'Status', 'BU'];
    const rows = sortedQuotes.map(q => [
      q.cpo_id, q.part_no, q.sales_territory, q.vendor, q.master_customer, q.end_user,
      q.quote_name, q.stage, q.probability, q.usd_value, q.budgetary, q.close_date, q.quote_age, q.status, q.bu
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pipeline-details-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToHistory('Export', `Exportado ${sortedQuotes.length} registros em ${format}`, 'success');
    toast.success(`Exportados ${sortedQuotes.length} registros em ${format}`);
  };

  // ── Record a version entry ──
  const recordVersion = (id: number, field: string, oldValue: string, newValue: string) => {
    const entry: VersionEntry = {
      timestamp: new Date().toLocaleString('pt-BR'),
      field,
      oldValue,
      newValue,
      user: 'TD SYNNEX',
    };
    setVersions(prev => ({ ...prev, [id]: [entry, ...(prev[id] ?? [])] }));
  };

  // ── Save single edit ──
  const saveEdit = () => {
    if (!editingQuote) return;
    const updated = { ...editingQuote, ...editDraft };
    // Record versions for changed fields
    (Object.keys(editDraft) as (keyof Quote)[]).forEach(key => {
      const oldVal = String(editingQuote[key] ?? '');
      const newVal = String((editDraft as Record<string, unknown>)[key] ?? '');
      if (oldVal !== newVal) recordVersion(editingQuote.id, key, oldVal, newVal);
    });
    setQuotes(prev => prev.map(q => q.id === editingQuote.id ? updated : q));
    addToHistory('Edit', `Editado ${editingQuote.cpo_id}`, 'success');
    toast.success(`${editingQuote.cpo_id} atualizado`);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      setEditingQuote(null);
      setEditDraft({});
    }, 1200);
  };

  // ── Bulk edit with confirmation ──
  const applyBulkEdit = () => {
    if (!bulkField || bulkValue === '') return;
    const targetIds = selectedIds.size > 0 ? selectedIds : new Set(filteredQuotes.map(q => q.id));
    // Save current state for undo
    setUndoStack(prev => [...prev.slice(-9), { quotes: [...quotes], desc: `Edicao em lote: ${bulkField}` }]);
    setQuotes(prev => prev.map(q => {
      if (!targetIds.has(q.id)) return q;
      const oldVal = String(q[bulkField] ?? '');
      const newVal = bulkField === 'probability' || bulkField === 'usd_value' || bulkField === 'quote_age'
        ? String(Number(bulkValue))
        : bulkValue;
      if (oldVal === newVal) return q;
      recordVersion(q.id, bulkField, oldVal, newVal);
      return { ...q, [bulkField]: (bulkField === 'probability' || bulkField === 'usd_value' || bulkField === 'quote_age') ? Number(bulkValue) : bulkValue };
    }));
    const count = targetIds.size;
    addToHistory('BulkEdit', `Editado ${count} registros: ${bulkField} = ${bulkValue}`, 'success');
    toast.success(`${count} registros atualizados`);
    setBulkField('');
    setBulkValue('');
    setSelectedIds(new Set());
    setConfirmBulk(false);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setQuotes(last.quotes);
    setUndoStack(prev => prev.slice(0, -1));
    toast.success('Acao desfeita');
    addToHistory('Undo', last.desc, 'success');
  };

  // ── Selection helpers ──
  const toggleSelect = (id: number) => setSelectedIds(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const toggleSelectAll = () => {
    if (paginatedQuotes.every(q => selectedIds.has(q.id))) {
      setSelectedIds(prev => { const n = new Set(prev); paginatedQuotes.forEach(q => n.delete(q.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); paginatedQuotes.forEach(q => n.add(q.id)); return n; });
    }
  };
  const allPageSelected = paginatedQuotes.length > 0 && paginatedQuotes.every(q => selectedIds.has(q.id));

  const bulkFieldConfig = EDITABLE_FIELDS.find(f => f.key === bulkField);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 py-6 space-y-4">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-5">
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-center gap-3 py-16">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Carregando dados...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Use full width, no max-w constraint so table has room */}
      <div className="w-full px-4 sm:px-6 py-6 space-y-4">
        <Breadcrumbs items={[{ label: 'Pipeline' }, { label: 'Details' }]} />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Details</h1>
            <p className="text-sm text-gray-500 mt-0.5">Busca em tempo real, edicao individual e em lote.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip content="Exportar em CSV">
              <button onClick={() => handleExport('CSV')} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">CSV</button>
            </Tooltip>
            <Tooltip content="Exportar em Excel">
              <button onClick={() => handleExport('Excel')} className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-sm">Excel</button>
            </Tooltip>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Registros</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{filteredQuotes.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-emerald-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total USD</p>
            <p className="text-xl font-bold text-gray-900 mt-1">${(totalUsd / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-violet-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Prob Media</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{avgProb}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-amber-500 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Budgetary</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{budgetaryCount}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por Quote Name, CPO ID ou Part Number..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition ${filtersOpen || activeCount > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeCount > 0 && (
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${filtersOpen ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>{activeCount}</span>
            )}
          </button>
  {colOrder.join() !== DEFAULT_COL_ORDER.join() && (
    <button
      onClick={() => { setColOrder(DEFAULT_COL_ORDER); localStorage.removeItem('pipeline-col-order'); }}
      className="px-3 py-2 text-xs font-medium text-gray-500 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition whitespace-nowrap"
      title="Restaurar ordem original das colunas"
    >
      Resetar colunas
    </button>
  )}
  <select value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
    <option value={25}>25 / pag</option>
    <option value={50}>50 / pag</option>
    <option value={100}>100 / pag</option>
  </select>
        </div>

        {/* Advanced filter panel with animation */}
        <div
          className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300 ease-out ${
            filtersOpen ? 'opacity-100 max-h-[800px]' : 'opacity-0 max-h-0 border-0'
          }`}
        >
          {filtersOpen && (
            <>
              {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-700">Filtros Avancados</span>
              <button onClick={() => setFiltersOpen(false)} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">

              {/* Grupo 1 — Identificacao */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Identificacao</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={lbl}>CPO ID</label>
                    <input type="text" placeholder="CPO-1001..." value={filters.cpo_id} onChange={e => setF('cpo_id', e.target.value)} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Part No</label>
                    <input type="text" placeholder="NX-10000..." value={filters.part_no} onChange={e => setF('part_no', e.target.value)} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Quote Name</label>
                    <input type="text" placeholder="QT-024000..." value={filters.quote_name} onChange={e => setF('quote_name', e.target.value)} className={inp} />
                  </div>
                </div>
              </div>

              {/* Grupo 2 — Classificacao */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Classificacao</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className={lbl}>Territory</label>
                    <select value={filters.territory} onChange={e => setF('territory', e.target.value)} className={`${inp} bg-gray-50`}>
                      <option value="">Todos</option>
                      {TERRITORIES_LIST.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Vendor</label>
                    <select value={filters.vendor} onChange={e => setF('vendor', e.target.value)} className={`${inp} bg-gray-50`}>
                      <option value="">Todos</option>
                      {VENDORS_LIST.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Revenda</label>
                    <select value={filters.revenda} onChange={e => setF('revenda', e.target.value)} className={`${inp} bg-gray-50`}>
                      <option value="">Todas</option>
                      {REVENDA_LIST.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>End User</label>
                    <input type="text" placeholder="Cliente..." value={filters.end_user} onChange={e => setF('end_user', e.target.value)} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>BU</label>
                    <select value={filters.bu} onChange={e => setF('bu', e.target.value)} className={`${inp} bg-gray-50`}>
                      <option value="">Todos</option>
                      {BU_LIST.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Grupo 3 — Stage e Valores com ranges */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Stage e Valores</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={lbl}>Stage</label>
                    <select value={filters.stage} onChange={e => setF('stage', e.target.value)} className={`${inp} bg-gray-50`}>
                      <option value="">Todos</option>
                      {STAGES_LIST.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Prob range */}
                  <div>
                    <label className={lbl}>Probabilidade (%)</label>
                    <div className="flex items-center gap-1.5">
                      <input type="number" min="0" max="100" placeholder="0" value={filters.min_prob} onChange={e => setF('min_prob', e.target.value)} className={`${inp} text-center`} />
                      <span className="text-gray-400 text-xs font-medium shrink-0">—</span>
                      <input type="number" min="0" max="100" placeholder="100" value={filters.max_prob} onChange={e => setF('max_prob', e.target.value)} className={`${inp} text-center`} />
                    </div>
                  </div>
                  {/* USD range */}
                  <div>
                    <label className={lbl}>USD Value</label>
                    <div className="flex items-center gap-1.5">
                      <input type="number" placeholder="Min" value={filters.min_usd} onChange={e => setF('min_usd', e.target.value)} className={`${inp} text-center`} />
                      <span className="text-gray-400 text-xs font-medium shrink-0">—</span>
                      <input type="number" placeholder="Max" value={filters.max_usd} onChange={e => setF('max_usd', e.target.value)} className={`${inp} text-center`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grupo 4 — Data, Idade e Status */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Data, Idade e Status</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className={lbl}>Budget</label>
                    <select value={filters.budgetary} onChange={e => setF('budgetary', e.target.value)} className={`${inp} bg-gray-50`}>
                      <option value="">Todos</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  {/* Close Date range */}
                  <div className="md:col-span-1">
                    <label className={lbl}>Close Date</label>
                    <div className="flex items-center gap-1.5">
                      <input type="date" value={filters.close_date_from} onChange={e => setF('close_date_from', e.target.value)} className={inp} />
                      <span className="text-gray-400 text-xs font-medium shrink-0">—</span>
                      <input type="date" value={filters.close_date_to} onChange={e => setF('close_date_to', e.target.value)} className={inp} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Age Max (dias)</label>
                    <input type="number" placeholder="ex: 60" value={filters.max_age} onChange={e => setF('max_age', e.target.value)} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Status</label>
                    <select value={filters.status} onChange={e => setF('status', e.target.value)} className={`${inp} bg-gray-50`}>
                      <option value="">Todos</option>
                      {Object.entries(STATUS_GROUPS).map(([group, vals]) => (
                        <optgroup key={group} label={group}>
                          {vals.map(s => <option key={s} value={s}>{s}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => { setFilters({ ...EMPTY_FILTERS }); setApplied({ ...EMPTY_FILTERS }); syncFiltersToUrl(EMPTY_FILTERS); setCurrentPage(1); }}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 transition"
              >
                Limpar filtros
              </button>
              <button
                onClick={() => { setApplied({ ...filters }); syncFiltersToUrl(filters); setCurrentPage(1); setFiltersOpen(false); }}
                className="px-5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Aplicar filtros
              </button>
            </div>
          </>
          )}
        </div>

        {/* Active filter tags — visíveis fora do painel */}
        {activeCount > 0 && !filtersOpen && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">Ativos:</span>
            {Object.entries(applied).filter(([, v]) => v !== '').map(([k, v]) => (
              <span key={k} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-medium">
                {v}
                <button
                  onClick={() => { const n = { ...applied, [k]: '' }; setApplied(n); setFilters(n); setCurrentPage(1); }}
                  className="ml-0.5 text-blue-400 hover:text-blue-700"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <button
              onClick={() => { setFilters({ ...EMPTY_FILTERS }); setApplied({ ...EMPTY_FILTERS }); setCurrentPage(1); }}
              className="text-[11px] font-medium text-gray-400 hover:text-gray-600 underline transition"
            >
              Limpar todos
            </button>
          </div>
        )}

        {/* Bulk edit bar */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Edicao em Lote</span>
            {selectedIds.size > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold">{selectedIds.size} selecionados</span>
            )}
            {selectedIds.size === 0 && (
              <span className="text-[11px] text-gray-400">(aplica em todos os {filteredQuotes.length} filtrados se nenhum selecionado)</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <select value={bulkField} onChange={e => { setBulkField(e.target.value as keyof Quote | ''); setBulkValue(''); }} className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-w-[140px]">
              <option value="">Selecionar campo...</option>
              {EDITABLE_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
            {bulkField && bulkFieldConfig?.type === 'select' && (
              <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-w-[160px]">
                <option value="">Selecionar valor...</option>
                {bulkFieldConfig.key === 'status'
                  ? Object.entries(STATUS_GROUPS).map(([group, vals]) => (
                      <optgroup key={group} label={group}>
                        {vals.map(v => <option key={v} value={v}>{v}</option>)}
                      </optgroup>
                    ))
                  : bulkFieldConfig.options?.map(o => <option key={o} value={o}>{o}</option>)
                }
              </select>
            )}
            {bulkField && (bulkFieldConfig?.type === 'text' || bulkFieldConfig?.type === 'number' || bulkFieldConfig?.type === 'date') && (
              <input
                type={bulkFieldConfig.type}
                placeholder={`Novo valor para ${bulkFieldConfig.label}...`}
                value={bulkValue}
                onChange={e => setBulkValue(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-w-[200px]"
              />
            )}
            {bulkField && bulkValue && (
              <button onClick={() => setConfirmBulk(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition">
                <Check className="w-3.5 h-3.5" />
                Aplicar
              </button>
            )}
            {undoStack.length > 0 && (
              <button onClick={handleUndo} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg hover:bg-amber-200 transition">
                Desfazer
              </button>
            )}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-gray-500">
          Mostrando <span className="font-semibold text-gray-700">{filteredQuotes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredQuotes.length)}</span> de <span className="font-semibold text-gray-700">{filteredQuotes.length}</span> registros
          {selectedIds.size > 0 && <span className="ml-3 text-blue-600 font-semibold">{selectedIds.size} selecionados para edicao em lote</span>}
        </p>

        {/* Table — full width with horizontal scroll */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: '1600px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 w-10">
                    <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </th>
                  <th className="px-2 py-2.5 w-8"></th>
                  <th className="px-2 py-2.5 w-8"></th>
                  {orderedColumns.map(col => (
                    <th
                      key={col.key}
                      draggable
                      onDragStart={() => handleDragStart(col.key)}
                      onDragOver={e => handleDragOver(e, col.key)}
                      onDrop={() => handleDrop(col.key)}
                      onDragEnd={() => setDragOverKey(null)}
                      onClick={() => handleHeaderClick(col.key)}
                      title="Arraste para reordenar · Clique para ordenar"
                      className={`px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide whitespace-nowrap cursor-grab active:cursor-grabbing select-none transition-colors ${
                        dragOverKey === col.key
                          ? 'bg-blue-100 text-blue-700 border-l-2 border-blue-500'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && (
                          sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Nenhum resultado encontrado</p>
                          <p className="text-xs text-gray-400 mt-1">Tente outro termo de busca ou ajuste os filtros</p>
                        </div>
                        {activeCount > 0 && (
                          <button
                            onClick={() => { setFilters({ ...EMPTY_FILTERS }); setApplied({ ...EMPTY_FILTERS }); setSearchTerm(''); setCurrentPage(1); }}
                            className="mt-2 px-4 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                          >
                            Limpar todos os filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : paginatedQuotes.map((quote, idx) => (
                  <tr key={quote.id} className={`hover:bg-blue-50 transition-colors text-gray-900 ${selectedIds.has(quote.id) ? 'bg-blue-50' : idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}>
                    <td className="px-3 py-2.5">
                      <input type="checkbox" checked={selectedIds.has(quote.id)} onChange={() => toggleSelect(quote.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </td>
                    {/* Edit button */}
                    <td className="px-1 py-2.5">
                      <button onClick={() => { setEditingQuote(quote); setEditDraft({}); }} className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    {/* History button */}
                    <td className="px-1 py-2.5">
                      {(versions[quote.id]?.length ?? 0) > 0 && (
                        <button onClick={() => setHistoryQuote(quote)} className="p-1 rounded text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition" title="Historico de versoes">
                          <History className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                    {orderedColumns.map(col => {
                      const k = col.key;
                      if (k === 'cpo_id')         return <td key={k} className="px-3 py-2.5 font-mono text-blue-600 font-bold whitespace-nowrap">{quote.cpo_id}</td>;
                      if (k === 'part_no')         return <td key={k} className="px-3 py-2.5 font-mono text-gray-700 whitespace-nowrap">{quote.part_no}</td>;
                      if (k === 'sales_territory') return <td key={k} className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{quote.sales_territory}</td>;
                      if (k === 'vendor')          return <td key={k} className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{quote.vendor}</td>;
                      if (k === 'master_customer') return <td key={k} className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{quote.master_customer}</td>;
                      if (k === 'end_user')        return <td key={k} className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{quote.end_user}</td>;
                      if (k === 'quote_name')      return <td key={k} className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{quote.quote_name}</td>;
                      if (k === 'stage')           return <td key={k} className="px-3 py-2.5 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STAGE_COLORS[quote.stage] ?? 'bg-gray-100 text-gray-700'}`}>{quote.stage}</span></td>;
                      if (k === 'probability')     return <td key={k} className="px-3 py-2.5 text-right font-bold text-gray-800 whitespace-nowrap">{quote.probability}%</td>;
                      if (k === 'usd_value')       return <td key={k} className="px-3 py-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">${(quote.usd_value / 1000).toFixed(0)}K</td>;
                      if (k === 'budgetary')       return <td key={k} className="px-3 py-2.5 text-center whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${quote.budgetary === 'Yes' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>{quote.budgetary}</span></td>;
                      if (k === 'close_date')      return <td key={k} className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{quote.close_date}</td>;
                      if (k === 'quote_age')       return <td key={k} className="px-3 py-2.5 text-center whitespace-nowrap"><span className={`font-semibold ${quote.quote_age > 30 ? 'text-red-600' : 'text-gray-700'}`}>{quote.quote_age}d</span></td>;
                      if (k === 'status')          return <td key={k} className="px-3 py-2.5 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_COLORS[quote.status] ?? 'bg-gray-100 text-gray-600'}`}>{quote.status}</span></td>;
                      if (k === 'bu')              return <td key={k} className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-[11px]">{quote.bu}</td>;
                      return null;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredQuotes.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">Pagina {currentPage} de {totalPages}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Anterior</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                  if (page > totalPages) return null;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 text-xs font-medium rounded-lg transition ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>{page}</button>
                  );
                })}
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Proximo</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editingQuote && (() => {
        const getVal = (key: keyof Quote) =>
          (editDraft as Record<string, unknown>)[key] !== undefined
            ? String((editDraft as Record<string, unknown>)[key])
            : String(editingQuote[key] ?? '');

        const Field = ({ field }: { field: typeof EDITABLE_FIELDS[number] }) => {
          const val = getVal(field.key);
          const changed = (editDraft as Record<string, unknown>)[field.key] !== undefined &&
            String((editDraft as Record<string, unknown>)[field.key]) !== String(editingQuote[field.key] ?? '');
          return (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                {field.label}
                {changed && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Alterado" />}
              </label>
              {field.type === 'select' ? (
                <select
                  value={val}
                  onChange={e => setEditDraft(d => ({ ...d, [field.key]: e.target.value }))}
                  className={`${inp} ${changed ? 'ring-1 ring-amber-400 border-amber-300' : ''}`}
                >
                  {field.key === 'status'
                    ? Object.entries(STATUS_GROUPS).map(([group, vals]) => (
                        <optgroup key={group} label={group}>
                          {vals.map(s => <option key={s} value={s}>{s}</option>)}
                        </optgroup>
                      ))
                    : field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)
                  }
                </select>
              ) : (
                <input
                  type={field.type}
                  value={val}
                  onChange={e => setEditDraft(d => ({ ...d, [field.key]: e.target.value }))}
                  className={`${inp} ${changed ? 'ring-1 ring-amber-400 border-amber-300' : ''}`}
                />
              )}
            </div>
          );
        };

        const changedCount = Object.keys(editDraft).filter(k => {
          const draftVal = (editDraft as Record<string, unknown>)[k];
          return draftVal !== undefined && String(draftVal) !== String(editingQuote[k as keyof Quote] ?? '');
        }).length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col transition-all duration-300 ${savedFeedback ? 'ring-2 ring-emerald-500' : ''}`}>

              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Editar Quote</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-blue-600 font-semibold">{editingQuote.cpo_id}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{editingQuote.quote_name}</span>
                      <span className="text-gray-300">·</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${STATUS_COLORS[editingQuote.status] ?? 'bg-gray-100 text-gray-600'}`}>{editingQuote.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {changedCount > 0 && (
                    <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      {changedCount} {changedCount === 1 ? 'campo alterado' : 'campos alterados'}
                    </span>
                  )}
                  <button onClick={() => { setEditingQuote(null); setEditDraft({}); setSavedFeedback(false); }} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1">

                {/* Grupo 1 — Pipeline */}
                <div className="px-6 pt-5 pb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pipeline</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'stage')!} />
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'status')!} />
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'budgetary')!} />
                  </div>
                </div>

                <div className="mx-6 border-t border-gray-100 dark:border-gray-800" />

                {/* Grupo 2 — Valores */}
                <div className="px-6 pt-4 pb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Valores</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'usd_value')!} />
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'probability')!} />
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'close_date')!} />
                  </div>
                </div>

                <div className="mx-6 border-t border-gray-100 dark:border-gray-800" />

                {/* Grupo 3 — Classificacao */}
                <div className="px-6 pt-4 pb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Classificacao</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'sales_territory')!} />
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'vendor')!} />
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'bu')!} />
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'master_customer')!} />
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'end_user')!} />
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'team')!} />
                  </div>
                </div>

                <div className="mx-6 border-t border-gray-100 dark:border-gray-800" />

                {/* Grupo 4 — Identificacao */}
                <div className="px-6 pt-4 pb-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Identificacao</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'part_no')!} />
                    <Field field={EDITABLE_FIELDS.find(f => f.key === 'quote_name')!} />
                    <div className="col-span-2">
                      <Field field={EDITABLE_FIELDS.find(f => f.key === 'description')!} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                <button
                  onClick={() => { setEditingQuote(null); setEditDraft({}); setSavedFeedback(false); }}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  disabled={savedFeedback}
                  className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                    savedFeedback
                      ? 'bg-emerald-500 text-white scale-105'
                      : changedCount > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {savedFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Salvo!
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      {changedCount > 0 ? `Salvar ${changedCount} ${changedCount === 1 ? 'alteracao' : 'alteracoes'}` : 'Sem alteracoes'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Confirm Bulk Edit Modal ── */}
      {confirmBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-900">Confirmar edicao em lote</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">
                Voce esta prestes a alterar o campo <strong className="text-gray-900">{EDITABLE_FIELDS.find(f => f.key === bulkField)?.label}</strong> para <strong className="text-gray-900">{bulkValue}</strong> em{' '}
                <strong className="text-blue-600">{selectedIds.size > 0 ? selectedIds.size : filteredQuotes.length}</strong> registros.
              </p>
              <p className="text-sm text-gray-500 mt-2">Esta acao pode ser desfeita.</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setConfirmBulk(false)} className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={applyBulkEdit} className="px-5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                Confirmar alteracao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History Modal ── */}
      {historyQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Historico de Versoes</h2>
                <p className="text-xs text-gray-500 mt-0.5">{historyQuote.cpo_id} — {historyQuote.quote_name}</p>
              </div>
              <button onClick={() => setHistoryQuote(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              {(versions[historyQuote.id] ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhuma alteracao registrada.</p>
              ) : (
                <div className="space-y-3">
                  {(versions[historyQuote.id] ?? []).map((v, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-700">{v.field}</span>
                          <span className="text-[11px] text-gray-400 shrink-0">{v.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded font-mono">{v.oldValue || '—'}</span>
                          <span className="text-gray-400">→</span>
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-mono">{v.newValue}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{v.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
