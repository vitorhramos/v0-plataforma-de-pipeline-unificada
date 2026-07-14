'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { SlidersHorizontal, X, Pencil, Check, History, Loader2, ChevronUp, ChevronDown, HelpCircle, List, LayoutGrid, Columns3, Layers, ChevronRight, Star, BookmarkCheck, RotateCcw, Bookmark, Lock, RotateCw } from 'lucide-react';
import { Breadcrumbs, Tooltip } from '@/components/common/breadcrumbs-tooltips';
import { useOperationHistory } from '@/components/common/operation-history';
import { useToast } from '@/components/common/toast';
import { TourOverlay } from '@/components/common/tour-overlay';
import { getQuotes, getScenarioGroups, addScenarioGroup, updateScenarioGroup, removeScenarioGroup, updateQuote as storeUpdateQuote } from '@/lib/mock-store';
import type { ScenarioGroup, ScenarioMeta, ScenarioLikelihood } from '@/lib/mock-store';
import { LIKELIHOOD_LABELS, LIKELIHOOD_COLORS, LOSS_REASONS } from '@/lib/mock-store';
import { useTour } from '@/hooks/useTour';
import { RichTextEditor } from '@/components/common/rich-text-editor';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel';
import { AIFilterBar } from '@/components/ai/AIFilterBar';
import { AISuggestButton } from '@/components/ai/AISuggestButton';
import { AISummaryModal } from '@/components/ai/AISummaryModal';

type CommentEntry = {
  id: string;
  html: string;
  author: string;
  timestamp: string;
};

type Quote = {
  id: number;
  cpo_id: string;
  vpc_code?: string;
  part_no: string;
  description: string;
  sales_territory: string;
  team: string;
  vendor: string;
  master_customer: string;
  bill_to?: string;
  end_user: string;
  usd_value: number;          // CIF
  net_value?: number;
  fob_value?: number;
  gm_pct?: number;
  cpo_qty?: number;
  stage: string;
  probability: number;
  lost_reason?: string;
  created_date?: string;
  close_date: string;
  cpo_no?: string;
  cpo_pay_meth?: string;
  pay_meth_name?: string;
  quote_name: string;
  prod_type?: string;
  renew?: string;
  pipe_comments?: string;
  pipeCommentHistory?: CommentEntry[];
  quote_comments?: string;
  quoteCommentHistory?: CommentEntry[];
  hts_code?: string;
  hts_description?: string;
  is_engineering_ticket?: string;
  credito_aprovado?: string;
  // internal only (not shown as columns)
  quote_number: string;
  bu: string;
  quote_age: number;
  status: string;
  comments?: string;
  commentHistory?: CommentEntry[];
  lost_comment?: string;
  scenarioGroupId?: string;
  vendor_opportunity_id?: string;
};

type VersionEntry = {
  timestamp: string;
  field: string;
  oldValue: string;
  newValue: string;
  user: string;
};



// Constants
const VENDORS_LIST = ['Cisco', 'HPE', 'Dell', 'Lenovo'];
const TERRITORIES_LIST = ['Sao Paulo', 'Rio de Janeiro', 'Minas Gerais'];
const BU_LIST = ['BU Storage', 'BU Network', 'BU Compute'];
// STAGES_LIST: opções editáveis — "Pipelined" não é um stage editável,
// é um agrupador de filtro que representa 25% + 50% + 75%.
const STAGES_LIST = ['Not Classified', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'];
// Para filtros, KPI cards e exibição (inclui Pipelined como grupo virtual)
const STAGES_ALL  = ['Not Classified', 'Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'];
const REVENDA_LIST = ['Revenda A', 'Revenda B', 'Revenda C', 'Revenda D', 'Revenda E'];
const PROD_TYPES_LIST = ['Hardware', 'Software', 'Services', 'Renew'];
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
  'Not Classified': 'bg-gray-100 text-gray-500',
  'Pipelined':      'bg-blue-100 text-blue-800',
  'Pricing 25%':    'bg-violet-100 text-violet-800',
  'Up Selling 50%': 'bg-amber-100 text-amber-800',
  'Committed 75%':  'bg-emerald-100 text-emerald-800',
  'Net Lost':       'bg-red-100 text-red-700',
};

const STAGE_BORDER: Record<string, string> = {
  'Not Classified': 'border-l-gray-400',
  'Pipelined':      'border-l-blue-400',
  'Pricing 25%':    'border-l-violet-400',
  'Up Selling 50%': 'border-l-amber-400',
  'Committed 75%':  'border-l-emerald-400',
  'Net Lost':       'border-l-red-400',
};

const EMPTY_FILTERS = {
  // Identification
  cpo_id: '', part_no: '', quote_name: '',
  // Classification
  stage: '',          // comma-separated list of selected stages (multi-select)
  prod_type: '',      // comma-separated list of selected prod types
  vendor: '', territory: '', bu: '', revenda: '', end_user: '',
  // Status
  status: '',
  // Flags ('' | 'yes' | 'no')
  renew: '', eng_ticket: '',
  // Values
  min_usd: '', max_usd: '', min_prob: '', max_prob: '', min_gm: '', max_gm: '',
  // Dates
  close_date_from: '', close_date_to: '',
  created_date_from: '', created_date_to: '',
  // Age range
  min_age: '', max_age: '',
};

// Editable fields config — only the authorized fields can be edited
const EDITABLE_FIELDS: { key: keyof Quote; label: string; type: 'text' | 'select' | 'number' | 'date' | 'textarea'; options?: string[] }[] = [
  { key: 'stage',                  label: 'Stage',              type: 'select',   options: STAGES_LIST },
  { key: 'close_date',             label: 'Close Date',         type: 'date' },
  { key: 'credito_aprovado',       label: 'Credito Aprovado',   type: 'select',   options: ['Sim', 'Não'] },
  { key: 'renew',                  label: 'Renew',              type: 'select',   options: ['Yes', 'No'] },
  { key: 'is_engineering_ticket',  label: 'Eng. Ticket',        type: 'select',   options: ['Yes', 'No'] },
];

// Component
export default function PipelineDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PipelineDetailsContent />
    </Suspense>
  );
}

function PipelineDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<Record<number, VersionEntry[]>>({});

  // Listen to sidebar feature actions
  useEffect(() => {
    const handleFeatureAction = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action } = customEvent.detail;
      
      if (action === 'tour') {
        tour.startTour();
      } else if (action === 'filters') {
        setFiltersOpen(prev => !prev);
      } else if (action === 'export') {
        exportToCsv();
      } else if (action === 'view-list') {
        setViewMode('list');
      } else if (action === 'view-cards') {
        setViewMode('cards');
      } else if (action === 'view-kanban') {
        setViewMode('kanban');
      }
    };

    window.addEventListener('sidebar-feature-action', handleFeatureAction);
    return () => window.removeEventListener('sidebar-feature-action', handleFeatureAction);
  }, []);

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

  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'kanban'>('list');
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // -- Scenario group states --------------------------------------��----------
  const [scenarioGroups, setScenarioGroups] = useState<ScenarioGroup[]>(() => getScenarioGroups());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  type ScenarioDraft = { groupName: string; scenarios: ScenarioMeta[] };
  const [scenarioDraft, setScenarioDraft] = useState<ScenarioDraft>({ groupName: '', scenarios: [] });

  const refreshGroups = () => setScenarioGroups([...getScenarioGroups()]);

  const openCreateScenarioModal = () => {
    const selected = quotes.filter(q => selectedIds.has(q.id));
    setScenarioDraft({
      groupName: '',
      scenarios: selected.map((q, i) => ({
        quoteId: q.id,
        label: `Cenário ${String.fromCharCode(65 + i)} — ${q.quote_name}`,
        likelihood: (i === 0 ? 'mais_provavel' : 'alternativo') as ScenarioLikelihood,
        reason: '',
        isPrimary: i === 0,
      })),
    });
    setEditingGroupId(null);
    setScenarioSavedFeedback(false);
    setConfirmScenarioSave(false);
    setScenarioModalOpen(true);
  };

  const openEditScenarioModal = (groupId: string) => {
    const group = scenarioGroups.find(g => g.id === groupId);
    if (!group) return;
    setScenarioDraft({ groupName: group.name, scenarios: group.scenarios });
    setEditingGroupId(groupId);
    setScenarioSavedFeedback(false);
    setConfirmScenarioSave(false);
    setScenarioModalOpen(true);
  };

  const handleSaveScenarioGroup = () => {
    const { groupName, scenarios } = scenarioDraft;
    if (!groupName.trim() || scenarios.length < 2) return;
    const hasPrimary = scenarios.some(s => s.isPrimary);
    const finalScenarios = hasPrimary ? scenarios : scenarios.map((s, i) => ({ ...s, isPrimary: i === 0 }));
    const newIds = new Set(finalScenarios.map(s => s.quoteId));

    if (editingGroupId) {
      // Determine which quotes were removed from the group
      const oldGroup = scenarioGroups.find(g => g.id === editingGroupId);
      const removedIds = (oldGroup?.scenarios ?? [])
        .map(s => s.quoteId)
        .filter(id => !newIds.has(id));

      updateScenarioGroup(editingGroupId, { name: groupName.trim(), scenarios: finalScenarios });

      // Clear scenarioGroupId for removed quotes
      if (removedIds.length > 0) {
        setQuotes(prev => prev.map(q => removedIds.includes(q.id) ? { ...q, scenarioGroupId: undefined } : q));
        removedIds.forEach(id => storeUpdateQuote(id, { scenarioGroupId: undefined }));
      }
      // Set scenarioGroupId for newly added quotes
      const addedIds = finalScenarios
        .map(s => s.quoteId)
        .filter(id => !(oldGroup?.scenarios ?? []).some(s => s.quoteId === id));
      if (addedIds.length > 0) {
        setQuotes(prev => prev.map(q => addedIds.includes(q.id) ? { ...q, scenarioGroupId: editingGroupId } : q));
        addedIds.forEach(id => storeUpdateQuote(id, { scenarioGroupId: editingGroupId }));
      }
    } else {
      const newGroup = addScenarioGroup({ name: groupName.trim(), scenarios: finalScenarios });
      setQuotes(prev => prev.map(q =>
        newIds.has(q.id) ? { ...q, scenarioGroupId: newGroup.id } : q
      ));
      finalScenarios.forEach(s => storeUpdateQuote(s.quoteId, { scenarioGroupId: newGroup.id }));
    }
    refreshGroups();
    setConfirmScenarioSave(false);
    setScenarioSavedFeedback(true);
    setSelectedIds(new Set());
    // Keep modal open — user sees the feedback and closes manually
  };

  const handleDeleteScenarioGroup = (groupId: string) => {
    const group = scenarioGroups.find(g => g.id === groupId);
    if (!group) return;
    const ids = group.scenarios.map(s => s.quoteId);
    setQuotes(prev => prev.map(q => ids.includes(q.id) ? { ...q, scenarioGroupId: undefined } : q));
    ids.forEach(id => storeUpdateQuote(id, { scenarioGroupId: undefined }));
    removeScenarioGroup(groupId);
    refreshGroups();
  };
  // --------------------------------------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterSections, setFilterSections] = useState({ identificacao: true, classificacao: true, valores: true, flags: true });
  const [partNoPopover, setPartNoPopover] = useState<{ id: string; parts: string[] } | null>(null);
  const toggleFilterSection = (key: keyof typeof filterSections) =>
    setFilterSections(prev => ({ ...prev, [key]: !prev[key] }));
  const [filters, setFilters] = useState(() => getFiltersFromUrl());
  const [applied, setApplied] = useState(() => getFiltersFromUrl());

  // AI filter handler — maps AI JSON filters to the existing applied filter structure
  const handleAIFilter = (aiFilters: Record<string, unknown>, interpreted: string) => {
    const next: Record<string, string> = { cpo_id: '', part_no: '', quote_name: '', stage: '', prod_type: '', vendor: '', territory: '', bu: '', revenda: '', end_user: '', status: '', renew: '', eng_ticket: '', min_usd: '', max_usd: '', min_net: '', max_net: '', close_from: '', close_to: '' };
    if (aiFilters.stage) next.stage = String(aiFilters.stage);
    if (aiFilters.vendor) next.vendor = String(aiFilters.vendor);
    if (aiFilters.territory) next.territory = String(aiFilters.territory);
    if (aiFilters.team) next.bu = String(aiFilters.team);
    if (aiFilters.cif_min) next.min_usd = String(aiFilters.cif_min);
    if (aiFilters.cif_max) next.max_usd = String(aiFilters.cif_max);
    if (aiFilters.renew) next.renew = String(aiFilters.renew).toLowerCase();
    if (aiFilters.eng_ticket) next.eng_ticket = String(aiFilters.eng_ticket).toLowerCase();
    if (aiFilters.close_date_from) next.close_from = String(aiFilters.close_date_from);
    if (aiFilters.close_date_to) next.close_to = String(aiFilters.close_date_to);
    if (aiFilters.search) next.cpo_id = String(aiFilters.search);
    setFilters(next as typeof applied);
    setApplied(next as typeof applied);
    setAiInterpretation(interpreted);
    setCurrentPage(1);
  };

  const clearAIFilter = () => {
    setAiInterpretation('');
  };

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

  // Column definitions (source of truth) — 33 columns per spec
  const ALL_COLUMNS: { label: string; key: keyof Quote }[] = [
    { label: 'Sales Terr',      key: 'sales_territory' },
    { label: 'Team',            key: 'team' },
    { label: 'Vendor',          key: 'vendor' },
    { label: 'Opportunity',     key: 'quote_name' },
    { label: 'CPO ID',          key: 'cpo_id' },
    { label: 'CPO No',          key: 'cpo_no' },
    { label: 'CPO Status',      key: 'status' },
    { label: 'Stage',           key: 'stage' },
    { label: 'Renew',           key: 'renew' },
    { label: 'Master Customer', key: 'master_customer' },
    { label: 'End User',        key: 'end_user' },
    { label: 'Bill To',         key: 'bill_to' },
    { label: 'NET',             key: 'net_value' },
    { label: 'GM %',            key: 'gm_pct' },
    { label: 'Pay Meth Name',   key: 'pay_meth_name' },
    { label: 'CIF',             key: 'usd_value' },
    { label: 'FOB',             key: 'fob_value' },
    { label: 'Created Date',    key: 'created_date' },
    { label: 'Close Date',      key: 'close_date' },
    { label: 'Lost',            key: 'lost_reason' },
    { label: 'Pipe Comments',   key: 'pipe_comments' },
    { label: 'Quote Comments',  key: 'quote_comments' },
    { label: 'VPC Code',        key: 'vpc_code' },
    { label: 'Part No',         key: 'part_no' },
    { label: 'Part Desc',       key: 'description' },
    { label: 'Prod Type',       key: 'prod_type' },
    { label: 'CPO QTY',         key: 'cpo_qty' },
    { label: 'HTS Code',        key: 'hts_code' },
    { label: 'HTS Description', key: 'hts_description' },
    { label: 'Eng. Ticket',     key: 'is_engineering_ticket' },
    { label: 'Credito Aprovado', key: 'credito_aprovado' },
  ];

  const DEFAULT_COL_ORDER = ALL_COLUMNS.map(c => c.key);

  const mergeWithDefault = (parsed: (keyof Quote)[]) =>
    [...parsed.filter(k => DEFAULT_COL_ORDER.includes(k)), ...DEFAULT_COL_ORDER.filter(k => !parsed.includes(k))];

  const [colOrder, setColOrder] = useState<(keyof Quote)[]>(() => {
    try {
      // Preferred order takes priority on load
      const preferred = localStorage.getItem('pipeline-col-order-preferred');
      if (preferred) return mergeWithDefault(JSON.parse(preferred));
      const saved = localStorage.getItem('pipeline-col-order');
      if (saved) return mergeWithDefault(JSON.parse(saved));
    } catch {}
    return DEFAULT_COL_ORDER;
  });

  const [hasPreferredOrder, setHasPreferredOrder] = useState<boolean>(() => {
    try { return !!localStorage.getItem('pipeline-col-order-preferred'); } catch { return false; }
  });

  // Whether the current order differs from the absolute default
  const isDefaultOrder = colOrder.join() === DEFAULT_COL_ORDER.join();

  // Whether the current order differs from the saved preferred order
  const isPreferredOrder = hasPreferredOrder && (() => {
    try {
      const p = localStorage.getItem('pipeline-col-order-preferred');
      return p ? JSON.parse(p).join() === colOrder.join() : false;
    } catch { return false; }
  })();

  const [colMenuOpen, setColMenuOpen] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

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

  // AI states
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState('');

  // Edit modal
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Quote>>({});
  const [historyQuote, setHistoryQuote] = useState<Quote | null>(null);
  const [activeCommentTab, setActiveCommentTab] = useState<'pipe' | 'quote'>('pipe');

  // Net Lost popup
  const [netLostOpen, setNetLostOpen] = useState(false);
  const [netLostReason, setNetLostReason] = useState('');
  const [netLostComment, setNetLostComment] = useState('');
  const netLostValid = netLostReason !== '' && netLostComment.trim() !== '';

  const confirmNetLost = () => {
    if (!netLostValid) return;
    setEditDraft(d => ({ ...d, stage: 'Net Lost', probability: 0, lost_reason: netLostReason, lost_comment: netLostComment }));
    setNetLostOpen(false);
    setNetLostReason('');
    setNetLostComment('');
  };

  const cancelNetLost = () => {
    setNetLostOpen(false);
    setNetLostReason('');
    setNetLostComment('');
  };

  // Bulk edit
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkField, setBulkField] = useState<keyof Quote | ''>('');
  const [bulkValue, setBulkValue] = useState('');
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [undoStack, setUndoStack] = useState<{ quotes: Quote[]; desc: string }[]>([]);
  const [savedFeedback, setSavedFeedback] = useState(false);
  // Inline save-confirmation state for edit modal and scenario modal
  const [confirmEditSave, setConfirmEditSave] = useState(false);
  const [confirmScenarioSave, setConfirmScenarioSave] = useState(false);
  const [scenarioSavedFeedback, setScenarioSavedFeedback] = useState(false);

  // -- Esc closes the topmost open modal ------------------------------------
  // Close column order menu when clicking outside
  useEffect(() => {
    if (!colMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setColMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [colMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Priority: confirmation dialogs first, then modals from top to bottom
      if (netLostOpen) { cancelNetLost(); return; }
      if (confirmEditSave) { setConfirmEditSave(false); return; }
      if (confirmScenarioSave) { setConfirmScenarioSave(false); return; }
      if (confirmBulk) { setConfirmBulk(false); return; }
      if (scenarioModalOpen) { setScenarioModalOpen(false); return; }
      if (historyQuote) { setHistoryQuote(null); return; }
      if (editingQuote) { setEditingQuote(null); setEditDraft({}); setSavedFeedback(false); setConfirmEditSave(false); return; }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [netLostOpen, confirmEditSave, confirmScenarioSave, confirmBulk, scenarioModalOpen, historyQuote, editingQuote, cancelNetLost]);

  // Tour steps definition
  const TOUR_STEPS = [
    {
      id: 'kpi-cards',
      selector: '[data-tour="kpi-cards"]',
      title: 'Cards de Filtro Rápido',
      description: 'Clique em "Previsao Expirada" ou "Alta Probabilidade" para filtrar a tabela instantaneamente. O card Pipeline Total mostra a soma de todas as quotes.',
      position: 'bottom' as const,
      icon: 'Zap',
      callToAction: 'Clique em qualquer card para aplicar o filtro e ver os resultados na tabela abaixo',
      proTip: 'Use múltiplos cards em sequência para criar filtros combinados (ex: Pipeline Total + Previsao Expirada)',
      nextStep: 'Próximo: use a busca rápida para encontrar quotes específicas',
    },
    {
      id: 'search',
      selector: '[data-tour="search"]',
      title: 'Busca Rápida',
      description: 'Digite CPO ID, Part No ou Quote Name para filtrar instantaneamente. A busca é case-insensitive.',
      position: 'bottom' as const,
      icon: 'Sliders',
      callToAction: 'Digite "CPO-1001" ou qualquer Part No que você veja na tabela',
      proTip: 'Combine busca + filtros avançados para análises super segmentadas',
      nextStep: 'Próximo: explore os filtros avançados colapsiveis',
    },
    {
      id: 'filters',
      selector: '[data-tour="filters-btn"]',
      title: 'Filtros Avançados Colapsiveis',
      description: 'Painel com 15 filtros organizados em 4 seções: Identificacao, Classificacao, Valores+Datas e Flags. Clique no título de cada seção para abrir/fechar.',
      position: 'bottom' as const,
      icon: 'Sliders',
      callToAction: 'Clique no botão "Filtros" e escolha uma seção para expandir',
      proTip: 'Filtros colapsiveis mantêm a UI limpa: você vê só o que precisa',
      nextStep: 'Próximo: veja os filtros já aplicados em tempo real',
    },
    {
      id: 'tags',
      selector: '[data-tour="filter-tags"]',
      title: 'Filtros Ativos (Tags)',
      description: 'Todos os filtros aplicados aparecem aqui como tags coloridas. Remova um clicando no X, ou clique "Limpar todos" para resetar tudo.',
      position: 'bottom' as const,
      icon: 'X',
      callToAction: 'Aplique alguns filtros acima, depois volte aqui para vê-los como tags',
      proTip: 'Tags são compartilháveis: copie a URL para enviar filtros específicos para colegas',
      nextStep: 'Próximo: ordene e reorganize as colunas da tabela',
    },
    {
      id: 'sort',
      selector: '[data-tour="table-header"]',
      title: 'Ordenação de Colunas',
      description: 'Clique em qualquer header de coluna (CPO ID, Stage, CIF, etc) para ordenar. O ícone de seta mostra se é asc ou desc.',
      position: 'bottom' as const,
      icon: 'BarChart3',
      callToAction: 'Clique no header "CIF" para ordenar por valor (maior para menor)',
      proTip: 'Combine ordenação + filtros: ex: Committed 75% ordenado por CIF DESC = suas maiores oportunidades',
      nextStep: 'Próximo: selecione linhas para editar em lote',
    },
    {
      id: 'checkbox',
      selector: '[data-tour="row-checkbox"]',
      title: 'Seleção de Linhas para Edição em Lote',
      description: 'Marque uma ou mais caixinhas no início de cada linha para selecionar quotes. A edição em lote aplica nos selecionados.',
      position: 'right' as const,
      icon: 'Check',
      callToAction: 'Marque 3-5 linhas agora e veja o painel de edição em lote aparecer',
      proTip: 'Sem seleção = edição em lote aplica a TODOS os filtrados (cuidado!). Sempre selecione quando tiver dúvida',
      nextStep: 'Próximo: clique no lápis para editar um quote individual',
    },
    {
      id: 'edit',
      selector: '[data-tour="edit-pencil"]',
      title: 'Edição Individual via Modal',
      description: 'Clique no ícone de lápis em qualquer linha para abrir um modal completo com todos os 30+ campos editáveis.',
      position: 'left' as const,
      icon: 'Pencil',
      callToAction: 'Clique em qualquer ícone de lápis para abrir e explorar a edição completa',
      proTip: 'Campos alterados ficam com borda laranja + ponto indicador. Salve ou descarte antes de fechar',
      nextStep: 'Próximo: veja o histórico de mudan��as de um quote',
    },
    {
      id: 'history',
      selector: '[data-tour="history-icon"]',
      title: 'Histórico de Versões (Audit Log)',
      description: 'Clique no ícone de relógio para ver todas as alterações feitas naquele quote: data, hora, campo que mudou e valor anterior vs novo.',
      position: 'left' as const,
      icon: 'History',
      callToAction: 'Edite um quote, depois clique no ícone de histórico para ver o audit trail completo',
      proTip: 'Use o histórico para rastrear quem mudou quê e quando: critical para compliance',
      nextStep: 'Próximo: edite múltiplos quotes de uma vez com edição em lote',
    },
    {
      id: 'bulk',
      selector: '[data-tour="bulk-field"]',
      title: 'Edição em Lote (Batch Update)',
      description: 'Selecione linhas, escolha um campo e um novo valor, depois aplique. A mesma alteração é aplicada em todos os selecionados.',
      position: 'top' as const,
      icon: 'Layers',
      callToAction: 'Selecione 3 linhas, escolha "Stage" = "Committed 75%", e clique "Aplicar"',
      proTip: 'Edição em lote economiza tempo: mudance stage de 10 quotes em 3 cliques',
      nextStep: 'Próximo: desfaça uma ação com undo',
    },
    {
      id: 'undo',
      selector: '[data-tour="undo-btn"]',
      title: 'Desfazer (Undo) Ações',
      description: 'Após uma edição individual ou em lote, clique aqui para reverter a ação anterior e restaurar o estado.',
      position: 'bottom' as const,
      icon: 'RotateCcw',
      callToAction: 'Faça uma edição, depois clique "Desfazer" para ver a mágica',
      proTip: 'Undo é seu amigo: não tenha medo de experimentar com bulk edits',
      nextStep: 'Próximo: exporte os dados para análise externa',
    },
    {
      id: 'export',
      selector: '[data-tour="export-btn"]',
      title: 'Exportar para CSV',
      description: 'Exporte os dados filtrados, ordenados e selecionados em um arquivo CSV. Abre automaticamente em Excel/Sheets.',
      position: 'bottom' as const,
      icon: 'Download',
      callToAction: 'Clique em "Exportar CSV" e salve em seu computador para abrir em Excel',
      proTip: 'CSV exportado respeita seus filtros: ex: se filtrou "Committed 75%", export tem apenas esses',
      nextStep: 'Parabéns! Você dominou o Pipeline Details. Agora use isso em seu trabalho diário!',
    },
  ];

  const tour = useTour(TOUR_STEPS, 'details-tour');

  const { add: addToHistory } = useOperationHistory();
  const toast = useToast();

  const setF = (key: string, val: string) => setFilters(p => ({ ...p, [key]: val }));
  const inp = 'w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';
  const lbl = 'block text-[11px] font-semibold text-gray-500 mb-1';

  const activeCount = Object.values(applied).filter(v => v !== '').length
    // multi-select fields count as 1 even when multiple values are selected — already counted by v !== ''
    // no adjustment needed, but stage/prod_type are already strings so they count correctly
  ;

  // -- Filtering --
  const filteredQuotes = quotes.filter(q => {
    const term = searchTerm.toLowerCase();
    if (term) {
      const groupName = q.scenarioGroupId
        ? (scenarioGroups.find(g => g.id === q.scenarioGroupId)?.name ?? '').toLowerCase()
        : '';
      if (
        !q.quote_name.toLowerCase().includes(term) &&
        !q.cpo_id.toLowerCase().includes(term) &&
        !q.part_no.toLowerCase().includes(term) &&
        !groupName.includes(term)
      ) return false;
    }
    // Identification
    if (applied.cpo_id && !q.cpo_id.toLowerCase().includes(applied.cpo_id.toLowerCase())) return false;
    if (applied.part_no && !q.part_no.toLowerCase().includes(applied.part_no.toLowerCase())) return false;
    if (applied.quote_name && !q.quote_name.toLowerCase().includes(applied.quote_name.toLowerCase())) return false;
    // Classification — Stage and Prod Type are multi-select (comma-separated)
    // "Pipelined" é um agrupador virtual que representa Pricing 25% + Up Selling 50% + Committed 75%
    if (applied.stage) {
      const sel = applied.stage.split(',').map(s => s.trim()).filter(Boolean);
      if (sel.length > 0) {
        const expanded = sel.flatMap(s =>
          s === 'Pipelined'
            ? ['Pricing 25%', 'Up Selling 50%', 'Committed 75%']
            : [s]
        );
        if (!expanded.includes(q.stage)) return false;
      }
    }
    if (applied.prod_type) {
      const sel = applied.prod_type.split(',').map(s => s.trim()).filter(Boolean);
      if (sel.length > 0 && !sel.includes(q.prod_type ?? '')) return false;
    }
    if (applied.vendor && q.vendor !== applied.vendor) return false;
    if (applied.territory && q.sales_territory !== applied.territory) return false;
    if (applied.bu && q.bu !== applied.bu) return false;
    if (applied.revenda && q.master_customer !== applied.revenda) return false;
    if (applied.end_user && !q.end_user.toLowerCase().includes(applied.end_user.toLowerCase())) return false;
    // Status
    if (applied.status && q.status !== applied.status) return false;
    // Flags (yes/no toggles)
    if (applied.renew === 'yes' && q.renew !== 'Yes') return false;
    if (applied.renew === 'no' && q.renew !== 'No') return false;
    if (applied.eng_ticket === 'yes' && q.is_engineering_ticket !== 'Yes') return false;
    if (applied.eng_ticket === 'no' && q.is_engineering_ticket !== 'No') return false;
    // Values — CIF range
    if (applied.min_usd && q.usd_value < parseInt(applied.min_usd)) return false;
    if (applied.max_usd && q.usd_value > parseInt(applied.max_usd)) return false;
    // Prob range
    if (applied.min_prob && q.probability < parseInt(applied.min_prob)) return false;
    if (applied.max_prob && q.probability > parseInt(applied.max_prob)) return false;
    // GM % range
    if (applied.min_gm && (q.gm_pct ?? 0) < parseFloat(applied.min_gm)) return false;
    if (applied.max_gm && (q.gm_pct ?? 0) > parseFloat(applied.max_gm)) return false;
    // Close date range
    if (applied.close_date_from && q.close_date < applied.close_date_from) return false;
    if (applied.close_date_to && q.close_date > applied.close_date_to) return false;
    // Created date range
    if (applied.created_date_from && (q.created_date ?? '') < applied.created_date_from) return false;
    if (applied.created_date_to && (q.created_date ?? '') > applied.created_date_to) return false;
    // Age range
    if (applied.min_age && q.quote_age < parseInt(applied.min_age)) return false;
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

  // Non-primary scenario quotes are hidden from the main list by default —
  // they appear only as inline expand rows under their group's primary quote.
  // EXCEPTION: when a search term or any filter is active, subordinate quotes
  // that match the criteria surface as standalone rows so they are never lost.
  const nonPrimaryIds = new Set(
    scenarioGroups.flatMap(g =>
      g.scenarios.filter(s => !s.isPrimary).map(s => s.quoteId)
    )
  );
  const hasActiveSearch = Boolean(searchTerm.trim()) || Object.values(applied).some(v => Boolean(v));
  const visibleQuotes = sortedQuotes.filter(q =>
    // Always show primaries and ungrouped quotes
    !nonPrimaryIds.has(q.id) ||
    // Show subordinates only when they explicitly matched an active search/filter
    (hasActiveSearch && nonPrimaryIds.has(q.id))
  );

  const paginatedQuotes = visibleQuotes.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(visibleQuotes.length / pageSize);

  const totalUsd = filteredQuotes.reduce((s, q) => s + q.usd_value, 0);
  const avgProb = filteredQuotes.length > 0
    ? Math.round(filteredQuotes.reduce((s, q) => s + q.probability, 0) / filteredQuotes.length)
    : 0;

  // KPI filter card derived values (calculados sobre TODOS os quotes, nao so filtrados)
  const allQuotes = getQuotes();
  const expiredCount = allQuotes.filter(q => {
    const today = new Date();
    const close = new Date(q.close_date);
    const diffDays = Math.floor((today.getTime() - close.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 15;
  }).length;
  const maxProbCount = allQuotes.filter(q => q.probability >= 75).length;
  const totalPipelineUsd = allQuotes.reduce((s, q) => s + q.usd_value, 0);

  // Estado do card-filtro ativo
  const [activeCard, setActiveCard] = useState<'expired' | 'highprob' | null>(null);

  const handleCardFilter = (card: 'expired' | 'highprob') => {
    if (activeCard === card) {
      // Toggle off — limpa filtro de card
      setActiveCard(null);
      setApplied(EMPTY_FILTERS);
      setFilters(EMPTY_FILTERS);
      syncFiltersToUrl(EMPTY_FILTERS);
      setCurrentPage(1);
    } else {
      setActiveCard(card);
      const newFilters = { ...EMPTY_FILTERS };
      if (card === 'expired') {
        // max_age > 15 — usa close_date_to retroativo (simula expirado > 15 dias)
        const d = new Date();
        d.setDate(d.getDate() - 15);
        const dateStr = d.toISOString().slice(0, 10);
        (newFilters as typeof EMPTY_FILTERS).close_date_to = dateStr;
      } else if (card === 'highprob') {
        (newFilters as typeof EMPTY_FILTERS).min_prob = '75';
      }
      setApplied(newFilters);
      setFilters(newFilters);
      syncFiltersToUrl(newFilters);
      setCurrentPage(1);
    }
  };

  const handleExport = (format: 'CSV' | 'Excel') => {
    const headers = ['CPO ID','CPO Status','VPC Code','Part No','Part Desc','Sales Terr','Team','Vendor','Master Customer','Bill To','End User','CIF','NET','FOB','GM %','CPO QTY','Stage','Lost','Created Date','Close Date','CPO No','CPO Pay Meth','Pay Meth Name','Opportunity','Prod Type','Renew','Pipe Comments','Quote Comments','HTS Code','HTS Description','Eng. Ticket'];
    const rows = sortedQuotes.map(q => [
      q.cpo_id, q.status, q.vpc_code ?? '', q.part_no, q.description, q.sales_territory, q.team, q.vendor,
      q.master_customer, q.bill_to ?? '', q.end_user, q.usd_value, q.net_value ?? '', q.fob_value ?? '',
      q.gm_pct ?? '', q.cpo_qty ?? '', q.stage, q.lost_reason ?? '', q.created_date ?? '',
      q.close_date, q.cpo_no ?? '', q.cpo_pay_meth ?? '', q.pay_meth_name ?? '', q.quote_name,
      q.prod_type ?? '', q.renew ?? '', q.pipe_comments ?? '', q.quote_comments ?? '',
      q.hts_code ?? '', q.hts_description ?? '', q.is_engineering_ticket ?? ''
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

  // -- Record a version entry --
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

  // -- Save single edit --
  const saveEdit = () => {
    if (!editingQuote) return;
    const updated: Quote = { ...editingQuote, ...editDraft };

    // Helper: append rich-text draft to history and clear draft
    const appendHistory = (
      draftKey: 'pipe_comments' | 'quote_comments' | 'comments',
      historyKey: 'pipeCommentHistory' | 'quoteCommentHistory' | 'commentHistory',
    ) => {
      const html = (editDraft[draftKey] ?? '') as string;
      const raw = html.replace(/<[^>]+>/g, '').trim();
      if (editDraft[draftKey] !== undefined && raw !== '') {
        const entry: CommentEntry = {
          id: `c-${Date.now()}-${draftKey}`,
          html,
          author: 'TD SYNNEX',
          timestamp: new Date().toISOString(),
        };
        (updated as Record<string, unknown>)[historyKey] = [
          ...((editingQuote[historyKey] as CommentEntry[] | undefined) ?? []),
          entry,
        ];
        (updated as Record<string, unknown>)[draftKey] = '';
      }
    };

    appendHistory('pipe_comments', 'pipeCommentHistory');
    appendHistory('quote_comments', 'quoteCommentHistory');
    appendHistory('comments', 'commentHistory');

    (Object.keys(editDraft) as (keyof Quote)[]).forEach(key => {
      if (key === 'pipe_comments' || key === 'quote_comments' || key === 'comments') return;
      const oldVal = String(editingQuote[key] ?? '');
      const newVal = String((editDraft as Record<string, unknown>)[key] ?? '');
      if (oldVal !== newVal) recordVersion(editingQuote.id, key, oldVal, newVal);
    });
    setQuotes(prev => prev.map(q => q.id === editingQuote.id ? updated : q));
    // Keep editingQuote in sync so history appears immediately after save
    setEditingQuote(updated);
    setEditDraft({});
    addToHistory('Edit', `Editado ${editingQuote.cpo_id}`, 'success');
    toast.success(`${editingQuote.cpo_id} atualizado`);
    setConfirmEditSave(false);
    setSavedFeedback(true);
    // Keep modal open so user sees the feedback — they close with Esc or Fechar
  };

  const closeEditModal = () => {
    setEditingQuote(null);
    setEditDraft({});
    setSavedFeedback(false);
    setConfirmEditSave(false);
  };

  // -- Bulk edit with confirmation --
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

  // -- Selection helpers --
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
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pipeline Details</h1>
            <p className="text-sm text-gray-500 mt-0.5">Busca em tempo real, edicao individual e em lote.</p>
          </div>

        </div>

        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Pipeline' }, { label: 'Details' }]} />

        {/* KPI Filter Cards — item 3: min-h para altura uniforme */}
        <div className="grid grid-cols-3 gap-3" data-tour="kpi-cards">
          {/* Card 1 — Previsao expirada > 15 dias */}
          <button
            onClick={() => handleCardFilter('expired')}
            className={`text-left rounded-lg border bg-white px-4 py-3 transition-all duration-150 border-l-4 min-h-[72px] flex flex-col justify-center ${
              activeCard === 'expired'
                ? 'border-l-red-500 border-gray-200 shadow-md ring-1 ring-red-200'
                : 'border-l-red-400 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Previsao Expirada</p>
              {activeCard === 'expired' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Filtro ativo" />}
            </div>
            <p className="text-xl font-bold text-gray-900 leading-none">{expiredCount}</p>
            <p className="text-[10px] text-gray-400 mt-1 leading-none">acima de 15 dias</p>
          </button>

          {/* Card 2 — Alta probabilidade (>= 75%) */}
          <button
            onClick={() => handleCardFilter('highprob')}
            className={`text-left rounded-lg border bg-white px-4 py-3 transition-all duration-150 border-l-4 min-h-[72px] flex flex-col justify-center ${
              activeCard === 'highprob'
                ? 'border-l-emerald-500 border-gray-200 shadow-md ring-1 ring-emerald-200'
                : 'border-l-emerald-400 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Alta Probabilidade</p>
              {activeCard === 'highprob' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Filtro ativo" />}
            </div>
            <p className="text-xl font-bold text-gray-900 leading-none">{maxProbCount}</p>
            <p className="text-[10px] text-gray-400 mt-1 leading-none">prob. acima de 75%</p>
          </button>

          {/* Card 3 — Pipeline Total (informativo) */}
          <div className="text-left rounded-lg border border-l-4 border-blue-400 border-gray-200 bg-white px-4 py-3 shadow-sm min-h-[72px] flex flex-col justify-center">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">Pipeline Total</p>
            <p className="text-xl font-bold text-gray-900 leading-none">
              ${totalPipelineUsd >= 1_000_000
                ? `${(totalPipelineUsd / 1_000_000).toFixed(1)}M`
                : `${(totalPipelineUsd / 1_000).toFixed(0)}K`}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 leading-none">soma de todas as quotes</p>
          </div>
        </div>

        {/* AI Filter Bar + AI Buttons na mesma linha */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {/* Botoes IA — shrink-0 para nao comprimir */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setAiInsightsOpen(o => !o)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition whitespace-nowrap ${aiInsightsOpen ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50'}`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2L9.09 8.26L2 9.27L7 14.14L5.82 21.02L12 17.77L18.18 21.02L17 14.14L22 9.27L14.91 8.26L12 2z"/></svg>
                Insights
              </button>
              <button
                onClick={() => setAiSummaryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Resumo Executivo
              </button>
              <button
                onClick={() => setAiChatOpen(o => !o)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition whitespace-nowrap ${aiChatOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'}`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chat IA
              </button>
            </div>
            {/* Filtro IA — flex-1 para ocupar o espaco disponivel */}
            <div className="flex-1 min-w-0">
              <AIFilterBar
                onApplyFilters={handleAIFilter}
                onClear={clearAIFilter}
                activeInterpretation={aiInterpretation}
                compact
              />
            </div>
          </div>
        </div>

        {/* AI Insights Panel — logo abaixo dos botoes */}
        {aiInsightsOpen && (
          <AIInsightsPanel onClose={() => setAiInsightsOpen(false)} />
        )}

        {/* Toolbar — busca (limitada) + filtros + tags + page size, tudo em uma linha */}
        <div className="flex items-center gap-2" data-tour="search">
          {/* Busca com largura maxima para nao ocupar a linha toda */}
          <div className="relative w-80 shrink-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por CPO ID, Part No, Quote..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Botao Filtros */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            data-tour="filters-btn"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${filtersOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeCount > 0 && (
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${filtersOpen ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>{activeCount}</span>
            )}
          </button>

          {/* Tags de filtros ativos — inline, aparecem so quando ha filtro */}
          {activeCount > 0 && !filtersOpen && (
            <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0" data-tour="filter-tags">
              {(() => {
                const FILTER_LABELS: Record<string, string> = {
                  cpo_id: 'CPO', part_no: 'Part No', quote_name: 'Quote',
                  stage: 'Stage', prod_type: 'Prod Type',
                  vendor: 'Vendor', territory: 'Territory', bu: 'BU', revenda: 'Revenda', end_user: 'End User',
                  status: 'Status',
                  renew: 'Renew', eng_ticket: 'Eng. Ticket',
                  min_usd: 'CIF min', max_usd: 'CIF max',
                  min_prob: 'Prob min', max_prob: 'Prob max',
                  min_gm: 'GM min', max_gm: 'GM max',
                  close_date_from: 'Close de', close_date_to: 'Close ate',
                  created_date_from: 'Created de', created_date_to: 'Created ate',
                  min_age: 'Age min', max_age: 'Age max',
                };
                const multiKeys = new Set(['stage', 'prod_type']);
                const pills: { key: string; label: string; value: string }[] = [];

                Object.entries(applied).filter(([, v]) => v !== '').forEach(([k, v]) => {
                  if (multiKeys.has(k)) {
                    // Each selected value becomes its own pill
                    v.split(',').map(s => s.trim()).filter(Boolean).forEach(item => {
                      pills.push({ key: k, label: `${FILTER_LABELS[k] ?? k}: ${item}`, value: item });
                    });
                  } else {
                    const humanVal = (k === 'renew' || k === 'eng_ticket')
                      ? `${FILTER_LABELS[k]}: ${v === 'yes' ? 'Yes' : 'No'}`
                      : `${FILTER_LABELS[k] ?? k}: ${v}`;
                    pills.push({ key: k, label: humanVal, value: v });
                  }
                });

                return pills.map(({ key, label, value }) => (
                  <span key={`${key}-${value}`} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-medium whitespace-nowrap">
                    {label}
                    <button
                      onClick={() => {
                        const multiKeys2 = new Set(['stage', 'prod_type']);
                        if (multiKeys2.has(key)) {
                          // Remove just this value from the comma list
                          const cur = (applied[key as keyof typeof applied] as string).split(',').map(s => s.trim()).filter(s => s !== value).join(',');
                          const n = { ...applied, [key]: cur };
                          setApplied(n); setFilters(n); setCurrentPage(1);
                        } else {
                          const n = { ...applied, [key]: '' };
                          setApplied(n); setFilters(n); setCurrentPage(1);
                        }
                      }}
                      className="text-blue-400 hover:text-blue-700"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ));
              })()}
              <button
                onClick={() => { setFilters({ ...EMPTY_FILTERS }); setApplied({ ...EMPTY_FILTERS }); setActiveCard(null); setCurrentPage(1); }}
                className="text-[11px] font-medium text-gray-400 hover:text-gray-600 underline transition whitespace-nowrap"
              >
                Limpar todos
              </button>
            </div>
          )}

          {/* Botao Agrupar Cenarios — aparece com 2+ selecionadas */}
          {selectedIds.size >= 2 && (
            <button
              onClick={openCreateScenarioModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-violet-100 text-violet-700 hover:bg-violet-200 transition whitespace-nowrap shrink-0 border border-violet-200"
            >
              <Layers className="w-3.5 h-3.5" />
              Agrupar Cenarios ({selectedIds.size})
            </button>
          )}

          {/* separador */}
          <div className="w-px h-6 bg-gray-300 shrink-0 mx-1" />

          {/* Item 1 — grupo de edicao em lote com fundo sutil para demarcar area */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Editar em lote</span>
            {selectedIds.size > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold whitespace-nowrap">{selectedIds.size} sel.</span>
            )}
          {/* Item 2 — placeholder mais descritivo */}
          <select
            value={bulkField}
            onChange={e => { setBulkField(e.target.value as keyof Quote | ''); setBulkValue(''); }}
            data-tour="bulk-field"
            className="px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">Editar campo...</option>
            {EDITABLE_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
          {bulkField && bulkFieldConfig?.type === 'select' && (
            <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shrink-0">
              <option value="">Valor...</option>
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
              placeholder="Novo valor..."
              value={bulkValue}
              onChange={e => setBulkValue(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-32"
            />
          )}
          {bulkField && bulkValue && (
            <button onClick={() => setConfirmBulk(true)} className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition">
              <Check className="w-3 h-3" />
              Aplicar
            </button>
          )}
          {undoStack.length > 0 && (
            <button onClick={handleUndo} data-tour="undo-btn" className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-md hover:bg-amber-200 transition">
              Desfazer
            </button>
          )}
          </div>{/* fim grupo lote */}

          {/* Espacador + page size */}
          <div className="flex-1" />
          <select value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
            <option value={25}>25 / pag</option>
            <option value={50}>50 / pag</option>
            <option value={100}>100 / pag</option>
          </select>
        </div>

        {/* Advanced filter panel with animation */}
        <div
          className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300 ease-out ${
            filtersOpen ? 'opacity-100 max-h-[1400px]' : 'opacity-0 max-h-0 border-0'
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

            {(() => {
              // Shared chip multi-select renderer
              const ChipGroup = ({ options, filterKey, colorMap }: {
                options: string[];
                filterKey: 'stage' | 'prod_type';
                colorMap?: Record<string, string>;
              }) => (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {options.map(opt => {
                    const selected = filters[filterKey].split(',').map(s => s.trim()).filter(Boolean).includes(opt);
                    const activeColor = colorMap?.[opt] ?? 'bg-blue-600 text-white border-blue-600';
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const cur = filters[filterKey].split(',').map(s => s.trim()).filter(Boolean);
                          const next = selected ? cur.filter(x => x !== opt) : [...cur, opt];
                          setF(filterKey, next.join(','));
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                          selected ? activeColor : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                        }`}
                      >{opt}</button>
                    );
                  })}
                </div>
              );

              // Binary toggle: All / Yes / No
              const FlagToggle = ({ label, filterKey }: { label: string; filterKey: 'renew' | 'eng_ticket' }) => {
                const cur = filters[filterKey];
                return (
                  <div>
                    <label className={lbl}>{label}</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden mt-1">
                      {([['', 'Todos'], ['yes', 'Yes'], ['no', 'No']] as [string, string][]).map(([val, txt]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setF(filterKey, cur === val ? '' : val as '' | 'yes' | 'no')}
                          className={`flex-1 py-1.5 text-[11px] font-semibold transition-all ${
                            cur === val
                              ? val === 'yes' ? 'bg-emerald-500 text-white' : val === 'no' ? 'bg-red-400 text-white' : 'bg-gray-700 text-white'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >{txt}</button>
                      ))}
                    </div>
                  </div>
                );
              };

              const STAGE_COLORS: Record<string, string> = {
                'Not Classified':'bg-gray-500 text-white border-gray-500',
                'Pipelined':     'bg-blue-600 text-white border-blue-600',
                'Pricing 25%':   'bg-violet-600 text-white border-violet-600',
                'Up Selling 50%':'bg-amber-500 text-white border-amber-500',
                'Committed 75%': 'bg-emerald-600 text-white border-emerald-600',
                'Net Lost':      'bg-red-500 text-white border-red-500',
              };

              const RangeInput = ({ labelText, minKey, maxKey, minPlaceholder = 'Min', maxPlaceholder = 'Max', type = 'number' }: {
                labelText: string; minKey: keyof typeof filters; maxKey: keyof typeof filters;
                minPlaceholder?: string; maxPlaceholder?: string; type?: string;
              }) => (
                <div>
                  <label className={lbl}>{labelText}</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input type={type} placeholder={minPlaceholder} value={filters[minKey] as string}
                      onChange={e => setF(minKey, e.target.value)}
                      className={`${inp} flex-1 text-center`} />
                    <span className="text-gray-300 font-light text-sm shrink-0">—</span>
                    <input type={type} placeholder={maxPlaceholder} value={filters[maxKey] as string}
                      onChange={e => setF(maxKey, e.target.value)}
                      className={`${inp} flex-1 text-center`} />
                  </div>
                </div>
              );

              return (
                <div className="divide-y divide-gray-100">

                  {/* Row 1 — Identificacao */}
                  <div className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => toggleFilterSection('identificacao')}
                      className="flex items-center justify-between w-full group mb-1"
                    >
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition">Identificacao</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${filterSections.identificacao ? '' : '-rotate-90'}`} />
                    </button>
                    {filterSections.identificacao && (
                      <div className="grid grid-cols-3 gap-3 mt-3">
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
                    )}
                  </div>

                  {/* Row 2 — Classificacao */}
                  <div className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => toggleFilterSection('classificacao')}
                      className="flex items-center justify-between w-full group mb-1"
                    >
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition">Classificacao</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${filterSections.classificacao ? '' : '-rotate-90'}`} />
                    </button>
                    {filterSections.classificacao && (<>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className={lbl}>Territory</label>
                        <select value={filters.territory} onChange={e => setF('territory', e.target.value)} className={`${inp} bg-white`}>
                          <option value="">Todos</option>
                          {TERRITORIES_LIST.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Vendor</label>
                        <select value={filters.vendor} onChange={e => setF('vendor', e.target.value)} className={`${inp} bg-white`}>
                          <option value="">Todos</option>
                          {VENDORS_LIST.map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>BU</label>
                        <select value={filters.bu} onChange={e => setF('bu', e.target.value)} className={`${inp} bg-white`}>
                          <option value="">Todos</option>
                          {BU_LIST.map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Revenda</label>
                        <select value={filters.revenda} onChange={e => setF('revenda', e.target.value)} className={`${inp} bg-white`}>
                          <option value="">Todas</option>
                          {REVENDA_LIST.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>End User</label>
                        <input type="text" placeholder="Cliente..." value={filters.end_user} onChange={e => setF('end_user', e.target.value)} className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Status</label>
                        <select value={filters.status} onChange={e => setF('status', e.target.value)} className={`${inp} bg-white`}>
                          <option value="">Todos</option>
                          {Object.entries(STATUS_GROUPS).map(([grp, vals]) => (
                            <optgroup key={grp} label={grp}>
                              {vals.map(s => <option key={s} value={s}>{s}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      <div>
                        <label className={lbl}>Stage</label>
                        <ChipGroup options={STAGES_ALL} filterKey="stage" colorMap={STAGE_COLORS} />
                      </div>
                      <div>
                        <label className={lbl}>Prod Type</label>
                        <ChipGroup options={PROD_TYPES_LIST} filterKey="prod_type" />
                      </div>
                    </div>
                    </>)}
                  </div>

                  {/* Row 3 — Valores + Datas + Idade */}
                  <div className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => toggleFilterSection('valores')}
                      className="flex items-center justify-between w-full group mb-1"
                    >
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition">Valores, Datas e Idade</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${filterSections.valores ? '' : '-rotate-90'}`} />
                    </button>
                    {filterSections.valores && (
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <RangeInput labelText="CIF (USD)" minKey="min_usd" maxKey="max_usd" />
                        <RangeInput labelText="GM %" minKey="min_gm" maxKey="max_gm" minPlaceholder="0" maxPlaceholder="100" />
                        <RangeInput labelText="Age (dias)" minKey="min_age" maxKey="max_age" />
                        <RangeInput labelText="Close Date" minKey="close_date_from" maxKey="close_date_to" type="date" />
                        <RangeInput labelText="Created Date" minKey="created_date_from" maxKey="created_date_to" type="date" />
                      </div>
                    )}
                  </div>

                  {/* Row 4 — Flags */}
                  <div className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => toggleFilterSection('flags')}
                      className="flex items-center justify-between w-full group mb-1"
                    >
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition">Flags</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${filterSections.flags ? '' : '-rotate-90'}`} />
                    </button>
                    {filterSections.flags && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <FlagToggle label="Renew" filterKey="renew" />
                        <FlagToggle label="Eng. Ticket" filterKey="eng_ticket" />
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}

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



        {/* Count + Column Order Button */}
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-500">
            Mostrando <span className="font-semibold text-gray-700">{visibleQuotes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, visibleQuotes.length)}</span> de <span className="font-semibold text-gray-700">{visibleQuotes.length}</span> registros
            {nonPrimaryIds.size > 0 && !hasActiveSearch && (
              <span className="ml-2 text-[11px] text-violet-600">({nonPrimaryIds.size} subordinadas ocultas)</span>
            )}
            {nonPrimaryIds.size > 0 && hasActiveSearch && (
              <span className="ml-2 text-[11px] text-violet-600">(subordinadas incluidas na busca)</span>
            )}
            {selectedIds.size > 0 && <span className="ml-3 text-blue-600 font-semibold">{selectedIds.size} selecionados para edicao em lote</span>}
          </p>

          {/* Column Order Button — only show when order differs from default */}
          {(!isDefaultOrder || hasPreferredOrder) && (
            <div className="relative" ref={colMenuRef}>
              <button
                onClick={() => setColMenuOpen(o => !o)}
                data-tour="reset-cols"
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition whitespace-nowrap shrink-0 ${
                  isPreferredOrder
                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {isPreferredOrder
                  ? <BookmarkCheck className="w-3.5 h-3.5" />
                  : <Columns3 className="w-3.5 h-3.5" />
                }
                <span>{isPreferredOrder ? 'Visao preferencial' : 'Colunas alteradas'}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {colMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  {/* Save as preferred */}
                  <button
                    onClick={() => {
                      localStorage.setItem('pipeline-col-order-preferred', JSON.stringify(colOrder));
                      localStorage.setItem('pipeline-col-order', JSON.stringify(colOrder));
                      setHasPreferredOrder(true);
                      setColMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold">Salvar como preferencial</p>
                      <p className="text-gray-400 text-[10px] leading-tight">Define esta ordem como padrao</p>
                    </div>
                  </button>

                  {/* Restore preferred — only if there is one saved and current differs */}
                  {hasPreferredOrder && !isPreferredOrder && (
                    <button
                      onClick={() => {
                        try {
                          const p = localStorage.getItem('pipeline-col-order-preferred');
                          if (p) {
                            const order = mergeWithDefault(JSON.parse(p));
                            setColOrder(order);
                            localStorage.setItem('pipeline-col-order', JSON.stringify(order));
                          }
                        } catch {}
                        setColMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <div className="text-left">
                        <p className="font-semibold">Restaurar preferencial</p>
                        <p className="text-gray-400 text-[10px] leading-tight">Volta para sua visao salva</p>
                      </div>
                    </button>
                  )}

                  <div className="my-1 border-t border-gray-100" />

                  {/* Reset to factory default */}
                  <button
                    onClick={() => {
                      setColOrder(DEFAULT_COL_ORDER);
                      localStorage.removeItem('pipeline-col-order');
                      localStorage.removeItem('pipeline-col-order-preferred');
                      setHasPreferredOrder(false);
                      setColMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold">Resetar para original</p>
                      <p className="text-gray-400 text-[10px] leading-tight">Volta para a ordem inicial</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* -- View: Cards ------------------------------------------------------ */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredQuotes.length === 0 ? (
              <div className="col-span-full py-20 text-center text-sm text-gray-400">Nenhum resultado encontrado.</div>
            ) : filteredQuotes.map(quote => (
              <div
                key={quote.id}
                className={`bg-white rounded-xl border border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                  STAGE_BORDER[quote.stage] ?? 'border-l-gray-300'
                } border-gray-200`}
                onClick={() => { setEditingQuote(quote); setEditDraft({}); setActiveCommentTab('pipe'); }}
              >
                <div className="p-3.5">
                  {/* Header do card */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <p className="text-[11px] font-mono font-bold text-blue-600 leading-none">{quote.cpo_id}</p>
                      <p className="text-[12px] font-semibold text-gray-800 mt-0.5 leading-tight line-clamp-1">{quote.quote_name}</p>
                    </div>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[quote.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {quote.status}
                    </span>
                  </div>

                  {/* Stage badge */}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2.5 ${STAGE_COLORS[quote.stage] ?? 'bg-gray-100 text-gray-700'}`}>
                    {quote.stage}
                  </span>

                  {/* Dados principais */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                    <div>
                      <p className="text-gray-400 leading-none">CIF</p>
                      <p className="font-bold text-emerald-700 leading-none mt-0.5">
                        {quote.usd_value >= 1_000_000 ? `$${(quote.usd_value/1_000_000).toFixed(1)}M` : `$${(quote.usd_value/1_000).toFixed(0)}K`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 leading-none">Prob.</p>
                      <p className="font-bold text-gray-800 leading-none mt-0.5">{quote.probability}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 leading-none">Prod Type</p>
                      <p className="font-medium text-gray-700 leading-none mt-0.5 truncate">{quote.prod_type ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 leading-none">Vendor</p>
                      <p className="font-medium text-gray-700 leading-none mt-0.5 truncate">{quote.vendor}</p>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {quote.renew === 'Yes' && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800">Renew</span>
                    )}
                    {quote.is_engineering_ticket === 'Yes' && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-100 text-blue-800">Eng. Ticket</span>
                    )}

                  </div>

                  {/* Footer */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] text-gray-400 truncate">{quote.master_customer}</p>
                    <p className="text-[10px] text-gray-400 shrink-0 ml-2">{quote.close_date ? quote.close_date.split('-').reverse().join('/') : '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* -- View: Kanban --------����--------------------------��------------------ */}
        {viewMode === 'kanban' && (() => {
          // Kanban usa STAGES_LIST (sem Pipelined) — Pipelined é apenas filtro/agrupador virtual
          const kanbanGroups = STAGES_LIST.map(stage => ({
            stage,
            quotes: quotes.filter(q => filteredQuotes.some(fq => fq.id === q.id) && q.stage === stage),
            total:  quotes.filter(q => filteredQuotes.some(fq => fq.id === q.id) && q.stage === stage).reduce((s, q) => s + q.usd_value, 0),
          }));

          const handleDragStart = (e: React.DragEvent, quoteId: number) => {
            // id é number — serializa como string no dataTransfer
            e.dataTransfer.setData('text/plain', String(quoteId));
            e.dataTransfer.effectAllowed = 'move';
          };

          const handleDragOver = (e: React.DragEvent, stage: string) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDragOverStage(stage);
          };

          const handleDragLeave = () => {
            setDragOverStage(null);
          };

          const handleDrop = (e: React.DragEvent, targetStage: string) => {
            e.preventDefault();
            setDragOverStage(null);
            const raw = e.dataTransfer.getData('text/plain');
            if (!raw) return;
            const quoteId = Number(raw);
            setQuotes(prev => prev.map(q =>
              q.id === quoteId ? { ...q, stage: targetStage } : q
            ));
          };

          const STAGE_HEADER_BORDER: Record<string, string> = {
            'Pipelined':      'border-t-blue-500',
            'Pricing 25%':    'border-t-violet-500',
            'Up Selling 50%': 'border-t-amber-500',
            'Committed 75%':  'border-t-emerald-500',
            'Net Lost':       'border-t-red-500',
          };

          return (
            <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
              {kanbanGroups.map(({ stage, quotes: colQuotes, total }) => {
                const isOver = dragOverStage === stage;
                return (
                  <div
                    key={stage}
                    className={`flex flex-col shrink-0 w-64 rounded-xl border transition-colors ${
                      isOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                    }`}
                    onDragOver={e => handleDragOver(e, stage)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, stage)}
                  >
                    {/* Header da coluna */}
                    <div className={`px-3 pt-3 pb-2.5 border-b border-gray-200 bg-white rounded-t-xl border-t-4 ${STAGE_HEADER_BORDER[stage] ?? 'border-t-gray-300'}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{stage}</p>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full leading-none">{colQuotes.length}</span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700">
                        ${total >= 1_000_000 ? `${(total / 1_000_000).toFixed(1)}M` : `${(total / 1_000).toFixed(0)}K`}
                      </p>
                    </div>

                    {/* Cards da coluna */}
                    <div className="flex flex-col gap-2 p-2 overflow-y-auto flex-1 min-h-[120px]">
                      {colQuotes.length === 0 && (
                        <div className={`py-10 text-center text-[11px] rounded-lg m-1 border-2 border-dashed transition-colors ${
                          isOver ? 'border-blue-400 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-400'
                        }`}>
                          {isOver ? 'Solte aqui' : 'Vazio'}
                        </div>
                      )}
                      {colQuotes.map(quote => (
                        <div
                          key={quote.id}
                          draggable
                          onDragStart={e => handleDragStart(e, quote.id)}
                          onClick={() => { setEditingQuote(quote); setEditDraft({}); setActiveCommentTab('pipe'); }}
                          className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing active:opacity-50 select-none"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p className="text-[11px] font-mono font-bold text-blue-600 leading-none">{quote.cpo_id}</p>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${STATUS_COLORS[quote.status] ?? 'bg-gray-100 text-gray-600'}`}>{quote.status}</span>
                          </div>
                          <p className="text-[11px] font-semibold text-gray-800 leading-tight mb-1.5 line-clamp-2">{quote.quote_name}</p>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-emerald-700">
                              {quote.usd_value >= 1_000_000 ? `$${(quote.usd_value/1_000_000).toFixed(1)}M` : `$${(quote.usd_value/1_000).toFixed(0)}K`}
                            </span>
                            <span className="font-semibold text-gray-600">{quote.probability}%</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1.5">
                            {quote.renew === 'Yes' && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800">Renew</span>}
                            {quote.is_engineering_ticket === 'Yes' && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-100 text-blue-800">Eng</span>}
                            {quote.prod_type && <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 text-gray-600">{quote.prod_type}</span>}
                          </div>
                          <div className="pt-1.5 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between gap-1">
                            <span className="truncate">{quote.vendor} · {quote.cpo_no ?? quote.master_customer}</span>
                            <span className="shrink-0">{quote.close_date ? quote.close_date.split('-').slice(1).reverse().join('/') : '—'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* ��� View: List (tabela original) ------------��-------------------------- */}
        {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: '3200px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 w-10">
                    <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </th>
                  <th className="px-2 py-2.5 w-8"></th>
                  <th className="px-2 py-2.5 w-8"></th>
                  {orderedColumns.map((col, idx) => (
                    <th
                      key={col.key}
                      draggable
                      onDragStart={() => handleDragStart(col.key)}
                      onDragOver={e => handleDragOver(e, col.key)}
                      onDrop={() => handleDrop(col.key)}
                      onDragEnd={() => setDragOverKey(null)}
                      onClick={() => handleHeaderClick(col.key)}
                      title="Arraste para reordenar · Clique para ordenar"
                      data-tour={idx === 0 ? 'table-header' : undefined}
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
                    <td colSpan={36} className="py-20 text-center">
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
                ) : paginatedQuotes.flatMap((quote, idx) => {
                  // Scenario metadata for this row
                  const group = quote.scenarioGroupId
                    ? scenarioGroups.find(g => g.id === quote.scenarioGroupId)
                    : null;
                  const scenarioMeta = group ? group.scenarios.find(s => s.quoteId === quote.id) : null;
                  const isPrimaryOfGroup = scenarioMeta?.isPrimary === true;
                  const isGroupExpanded = group ? expandedGroups.has(group.id) : false;
                  const alternateScenarios = group && isPrimaryOfGroup
                    ? group.scenarios
                        .filter(s => s.quoteId !== quote.id)
                        .map(s => ({ meta: s, altQuote: quotes.find(q => q.id === s.quoteId) }))
                        .filter(x => x.altQuote != null)
                    : [];

                  // A subordinate quote surfaced by an active search/filter
                  const isStandaloneSubordinate = nonPrimaryIds.has(quote.id);

                  const mainRow = (
                    <tr key={`row-${quote.id}`} className={`transition-colors text-gray-900 ${
                      isStandaloneSubordinate
                        ? 'bg-violet-50/60 hover:bg-violet-100/60 border-l-2 border-l-violet-400'
                        : selectedIds.has(quote.id)
                          ? 'bg-blue-50 hover:bg-blue-50'
                          : idx % 2 === 1
                            ? 'bg-gray-50/50 hover:bg-blue-50'
                            : 'bg-white hover:bg-blue-50'
                    }`}>
                      <td className="px-3 py-2.5">
                        <input type="checkbox" checked={selectedIds.has(quote.id)} onChange={() => toggleSelect(quote.id)} {...(idx === 0 ? { 'data-tour': 'row-checkbox' } : {})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      </td>
                      <td className="px-1 py-2.5">
                        <button onClick={() => { setEditingQuote(quote); setEditDraft({}); setActiveCommentTab('pipe'); }} data-tour="edit-pencil" className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="px-1 py-2.5">
                        {(versions[quote.id]?.length ?? 0) > 0 && (
                          <button onClick={() => setHistoryQuote(quote)} data-tour="history-icon" className="p-1 rounded text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition" title="Historico de versoes">
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                      {orderedColumns.map(col => {
                        const k = col.key;
                        const fmtMoney = (v?: number) => v == null ? '—' : v >= 1_000_000 ? `$${(v/1_000_000).toFixed(1)}M` : `$${(v/1_000).toFixed(0)}K`;
                        const fmtDate  = (d?: string) => d ? d.split('-').reverse().join('/') : '—';
                        const yesNoBadge = (val?: string) => val === 'Yes'
                          ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Yes</span>
                          : <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">No</span>;

                        if (k === 'cpo_id') return (
                          <td key={k} className="px-3 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {group && isPrimaryOfGroup && (
                                <button
                                  onClick={() => setExpandedGroups(prev => {
                                    const next = new Set(prev);
                                    next.has(group.id) ? next.delete(group.id) : next.add(group.id);
                                    return next;
                                  })}
                                  className="shrink-0 p-0.5 rounded text-violet-500 hover:text-violet-700 hover:bg-violet-50 transition"
                                  title={isGroupExpanded ? 'Recolher cenarios' : 'Expandir cenarios'}
                                >
                                  <ChevronRight className={`w-3 h-3 transition-transform ${isGroupExpanded ? 'rotate-90' : ''}`} />
                                </button>
                              )}
                              <span className="font-mono text-blue-600 font-bold text-[11px]">{quote.cpo_id}</span>
                              {group && (
                                <button
                                  onClick={() => openEditScenarioModal(group.id)}
                                  className="flex items-center gap-1 px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[9px] font-bold border border-violet-200 hover:bg-violet-200 transition max-w-[120px]"
                                  title={`Grupo: ${group.name}`}
                                >
                                  <Layers className="w-2.5 h-2.5 shrink-0" />
                                  {isPrimaryOfGroup && <Star className="w-2 h-2 fill-current shrink-0" />}
                                  <span className="truncate">{group.name}</span>
                                </button>
                              )}
                              {scenarioMeta && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${LIKELIHOOD_COLORS[scenarioMeta.likelihood]}`}>
                                  {LIKELIHOOD_LABELS[scenarioMeta.likelihood].split(' ')[0]}
                                </span>
                              )}
                              {isStandaloneSubordinate && group && (
                                <span className="text-[9px] text-violet-500 italic truncate max-w-[110px]" title={`Grupo: ${group.name}`}>
                                  {group.name}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                        if (k === 'status')               return <td key={k} className="px-3 py-2.5 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[quote.status] ?? 'bg-gray-100 text-gray-600'}`}>{quote.status}</span></td>;
                        if (k === 'vpc_code')             return <td key={k} className="px-3 py-2.5 font-mono text-gray-600 whitespace-nowrap text-[11px]">{quote.vpc_code ?? '—'}</td>;
                        if (k === 'part_no') {
                          const parts = (quote.part_no ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
                          const first = parts[0] ?? '—';
                          const extra = parts.length - 1;
                          const popId = `pn-${quote.id}`;
                          const isOpen = partNoPopover?.id === popId;
                          return (
                            <td key={k} className="px-3 py-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 relative">
                                <span className="font-mono text-gray-700 text-[11px]">{first}</span>
                                {extra > 0 && (
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); setPartNoPopover(isOpen ? null : { id: popId, parts }); }}
                                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border transition-all ${isOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-100 text-blue-700 border-transparent hover:bg-blue-200'}`}
                                  >+{extra}</button>
                                )}
                                {isOpen && (
                                  <div className="absolute left-0 top-6 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-[200px]" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Todos os Part No ({parts.length})</p>
                                      <button
                                        type="button"
                                        onClick={() => { navigator.clipboard?.writeText(parts.join(', ')); }}
                                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition whitespace-nowrap"
                                        title="Copiar todos"
                                      >copiar todos</button>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      {parts.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <span className="font-mono text-xs text-gray-800 font-medium">{p}</span>
                                          <button
                                            type="button"
                                            onClick={() => { navigator.clipboard?.writeText(p); }}
                                            className="ml-auto text-[10px] text-gray-400 hover:text-blue-600 transition"
                                            title="Copiar"
                                          >copiar</button>
                                        </div>
                                      ))}
                                    </div>
                                    <button type="button" onClick={() => setPartNoPopover(null)} className="mt-2.5 w-full text-center text-[10px] text-gray-400 hover:text-gray-600 transition border-t border-gray-100 pt-2">Fechar</button>
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        }
                        if (k === 'description')          return <td key={k} className="px-3 py-2.5 text-gray-700 max-w-[140px]"><span className="block truncate" title={quote.description}>{quote.description}</span></td>;
                        if (k === 'sales_territory')      return <td key={k} className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{quote.sales_territory}</td>;
                        if (k === 'team')                 return <td key={k} className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{quote.team}</td>;
                        if (k === 'vendor')               return <td key={k} className="px-3 py-2.5 text-gray-700 whitespace-nowrap font-medium">{quote.vendor}</td>;
                        if (k === 'master_customer')      return <td key={k} className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{quote.master_customer}</td>;
                        if (k === 'bill_to')              return <td key={k} className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{quote.bill_to ?? '—'}</td>;
                        if (k === 'end_user')             return <td key={k} className="px-3 py-2.5 text-gray-700 max-w-[130px]"><span className="block truncate" title={quote.end_user}>{quote.end_user}</span></td>;
                        if (k === 'usd_value')            return <td key={k} className="px-3 py-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">{fmtMoney(quote.usd_value)}</td>;
                        if (k === 'net_value')            return <td key={k} className="px-3 py-2.5 text-right font-semibold text-blue-700 whitespace-nowrap">{fmtMoney(quote.net_value)}</td>;
                        if (k === 'fob_value')            return <td key={k} className="px-3 py-2.5 text-right font-semibold text-violet-700 whitespace-nowrap">{fmtMoney(quote.fob_value)}</td>;
                        if (k === 'gm_pct') {
                          const gm = quote.gm_pct ?? 0;
                          return <td key={k} className="px-3 py-2.5 text-right whitespace-nowrap">
                            <span className={`font-bold ${gm >= 15 ? 'text-emerald-700' : gm >= 8 ? 'text-amber-600' : 'text-red-600'}`}>{gm.toFixed(1)}%</span>
                          </td>;
                        }
                        if (k === 'cpo_qty')              return <td key={k} className="px-3 py-2.5 text-center text-gray-700 whitespace-nowrap">{quote.cpo_qty ?? '—'}</td>;
                        if (k === 'stage') {
                          const stagePct: Record<string, number> = {
                            'Not Classified': 0, 'Pipelined': 0, 'Pricing 25%': 25, 'Up Selling 50%': 50, 'Committed 75%': 75, 'Net Lost': 0,
                          };
                          const pct = stagePct[quote.stage] ?? 0;
                          const barColor: Record<string, string> = {
                            'Pricing 25%': 'bg-violet-500', 'Up Selling 50%': 'bg-amber-500', 'Committed 75%': 'bg-emerald-500',
                          };
                          const showBar = pct > 0;
                          return (
                            <td key={k} className="px-3 py-2.5 whitespace-nowrap min-w-[110px]">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STAGE_COLORS[quote.stage] ?? 'bg-gray-100 text-gray-700'}`}>{quote.stage}</span>
                              {showBar && (
                                <div className="mt-1 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${barColor[quote.stage] ?? 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                                </div>
                              )}
                            </td>
                          );
                        }
                        if (k === 'lost_reason')          return <td key={k} className="px-3 py-2.5 whitespace-nowrap">{quote.lost_reason ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">{quote.lost_reason}</span> : <span className="text-gray-300">—</span>}</td>;
                        if (k === 'created_date')         return <td key={k} className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-[11px]">{fmtDate(quote.created_date)}</td>;
                        if (k === 'close_date')           return <td key={k} className="px-3 py-2.5 text-gray-700 whitespace-nowrap text-[11px]">{fmtDate(quote.close_date)}</td>;
                        if (k === 'cpo_no')               return <td key={k} className="px-3 py-2.5 font-mono text-gray-600 whitespace-nowrap text-[11px]">{quote.cpo_no ?? '—'}</td>;
                        if (k === 'cpo_pay_meth')         return <td key={k} className="px-3 py-2.5 whitespace-nowrap"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">{quote.cpo_pay_meth ?? '—'}</span></td>;
                        if (k === 'pay_meth_name')        return <td key={k} className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{quote.pay_meth_name ?? '—'}</td>;
                        if (k === 'quote_name')           return <td key={k} className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{quote.quote_name}</td>;
                        if (k === 'prod_type')            return <td key={k} className="px-3 py-2.5 whitespace-nowrap"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">{quote.prod_type ?? '—'}</span></td>;
                        if (k === 'renew')                return <td key={k} className="px-3 py-2.5 text-center whitespace-nowrap">{yesNoBadge(quote.renew)}</td>;
                        if (k === 'pipe_comments')        return <td key={k} className="px-3 py-2.5 text-gray-600 max-w-[110px]"><span className="block truncate text-[11px]" title={quote.pipe_comments}>{quote.pipe_comments || <span className="text-gray-300">—</span>}</span></td>;
                        if (k === 'quote_comments')       return <td key={k} className="px-3 py-2.5 text-gray-600 max-w-[110px]"><span className="block truncate text-[11px]" title={quote.quote_comments}>{quote.quote_comments || <span className="text-gray-300">—</span>}</span></td>;

                        if (k === 'hts_code')             return <td key={k} className="px-3 py-2.5 font-mono text-gray-600 whitespace-nowrap text-[11px]">{quote.hts_code ?? '—'}</td>;
                        if (k === 'hts_description')      return <td key={k} className="px-3 py-2.5 text-gray-600 max-w-[130px]"><span className="block truncate text-[11px]" title={quote.hts_description}>{quote.hts_description ?? '—'}</span></td>;
                        if (k === 'is_engineering_ticket') return <td key={k} className="px-3 py-2.5 text-center whitespace-nowrap">{yesNoBadge(quote.is_engineering_ticket)}</td>;
                        return <td key={k} className="px-3 py-2.5 text-gray-500 whitespace-nowrap text-[11px]">{String((quote as Record<string, unknown>)[k as string] ?? '—')}</td>;
                      })}
                    </tr>
                  );

                  // Alternate scenario rows (expanded inline)
                  const altRows = (group && isPrimaryOfGroup && isGroupExpanded)
                    ? alternateScenarios.map(({ meta, altQuote }, altIdx) => altQuote ? (
                        <tr key={`alt-${altQuote.id}`} className="text-[11px] bg-violet-50/40">
                          {/* Indent cell with vertical connector line */}
                          <td className="py-2 w-0 relative">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-violet-300" />
                            {altIdx === alternateScenarios.length - 1 && (
                              <div className="absolute left-5 top-0 h-1/2 w-px bg-violet-300" />
                            )}
                          </td>
                          <td className="px-1 py-2">
                            <button onClick={() => { setEditingQuote(altQuote); setEditDraft({}); }} className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition">
                              <Pencil className="w-3 h-3" />
                            </button>
                          </td>
                          <td className="px-1 py-2" />
                          {orderedColumns.map(col => {
                            const k = col.key;
                            const fmtM = (v?: number) => v == null ? '—' : v >= 1_000_000 ? `$${(v/1_000_000).toFixed(1)}M` : `$${(v/1_000).toFixed(0)}K`;
                            const fmtD = (d?: string) => d ? d.split('-').reverse().join('/') : '—';
                            if (k === 'cpo_id') return (
                              <td key={k} className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 pl-5">
                                  <span className="text-violet-300 font-mono text-[10px] shrink-0">└</span>
                                  <span className="font-mono text-blue-400 font-semibold text-[11px]">{altQuote.cpo_id}</span>
                                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${LIKELIHOOD_COLORS[meta.likelihood]}`}>
                                    {LIKELIHOOD_LABELS[meta.likelihood]}
                                  </span>
                                  {meta.label && (
                                    <span className="text-gray-400 italic truncate max-w-[120px] text-[10px]">{meta.label}</span>
                                  )}
                                </div>
                              </td>
                            );
                            if (k === 'status')               return <td key={k} className="px-3 py-2 whitespace-nowrap opacity-70"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[altQuote.status] ?? 'bg-gray-100 text-gray-600'}`}>{altQuote.status}</span></td>;
                            if (k === 'vpc_code')             return <td key={k} className="px-3 py-2 font-mono text-gray-400 whitespace-nowrap text-[11px]">{altQuote.vpc_code ?? '—'}</td>;
                            if (k === 'part_no') {
                              const altParts = (altQuote.part_no ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
                              const altFirst = altParts[0] ?? '—';
                              const altExtra = altParts.length - 1;
                              return (
                                <td key={k} className="px-3 py-2 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-gray-400 text-[11px]">{altFirst}</span>
                                    {altExtra > 0 && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-500" title={altParts.slice(1).join(', ')}>+{altExtra}</span>}
                                  </div>
                                </td>
                              );
                            }
                            if (k === 'description')          return <td key={k} className="px-3 py-2 text-gray-400 max-w-[140px]"><span className="block truncate text-[11px]">{altQuote.description}</span></td>;
                            if (k === 'sales_territory')      return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap">{altQuote.sales_territory}</td>;
                            if (k === 'team')                 return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap">{altQuote.team}</td>;
                            if (k === 'vendor')               return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap">{altQuote.vendor}</td>;
                            if (k === 'master_customer')      return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap">{altQuote.master_customer}</td>;
                            if (k === 'bill_to')              return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap">{altQuote.bill_to ?? '—'}</td>;
                            if (k === 'end_user')             return <td key={k} className="px-3 py-2 text-gray-400 max-w-[130px]"><span className="block truncate text-[11px]">{altQuote.end_user}</span></td>;
                            if (k === 'usd_value')            return <td key={k} className="px-3 py-2 text-right text-emerald-500 font-semibold whitespace-nowrap">{fmtM(altQuote.usd_value)}</td>;
                            if (k === 'net_value')            return <td key={k} className="px-3 py-2 text-right text-blue-400 whitespace-nowrap">{fmtM(altQuote.net_value)}</td>;
                            if (k === 'fob_value')            return <td key={k} className="px-3 py-2 text-right text-violet-400 whitespace-nowrap">{fmtM(altQuote.fob_value)}</td>;
                            if (k === 'gm_pct')               return <td key={k} className="px-3 py-2 text-right text-gray-400 whitespace-nowrap">{altQuote.gm_pct != null ? `${altQuote.gm_pct.toFixed(1)}%` : '—'}</td>;
                            if (k === 'cpo_qty')              return <td key={k} className="px-3 py-2 text-center text-gray-400 whitespace-nowrap">{altQuote.cpo_qty ?? '—'}</td>;
                            if (k === 'stage') {
                              const altStagePct: Record<string, number> = { 'Not Classified': 0, 'Pipelined': 0, 'Pricing 25%': 25, 'Up Selling 50%': 50, 'Committed 75%': 75, 'Net Lost': 0 };
                              const altBarColor: Record<string, string> = { 'Pricing 25%': 'bg-violet-500', 'Up Selling 50%': 'bg-amber-500', 'Committed 75%': 'bg-emerald-500' };
                              const altPct = altStagePct[altQuote.stage] ?? 0;
                              return (
                                <td key={k} className="px-3 py-2 whitespace-nowrap min-w-[110px]">
                                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] opacity-70 ${STAGE_COLORS[altQuote.stage] ?? 'bg-gray-100 text-gray-600'}`}>{altQuote.stage}</span>
                                  {altPct > 0 && (
                                    <div className="mt-1 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${altBarColor[altQuote.stage] ?? 'bg-gray-400'}`} style={{ width: `${altPct}%` }} />
                                    </div>
                                  )}
                                </td>
                              );
                            }
                            if (k === 'lost_reason')          return <td key={k} className="px-3 py-2 whitespace-nowrap text-gray-400 text-[11px]">{altQuote.lost_reason ?? '—'}</td>;
                            if (k === 'created_date')         return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap text-[11px]">{fmtD(altQuote.created_date)}</td>;
                            if (k === 'close_date')           return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap text-[11px]">{fmtD(altQuote.close_date)}</td>;
                            if (k === 'cpo_no')               return <td key={k} className="px-3 py-2 font-mono text-gray-400 whitespace-nowrap text-[11px]">{altQuote.cpo_no ?? '—'}</td>;
                            if (k === 'cpo_pay_meth')         return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap text-[11px]">{altQuote.cpo_pay_meth ?? '—'}</td>;
                            if (k === 'pay_meth_name')        return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap text-[11px]">{altQuote.pay_meth_name ?? '—'}</td>;
                            if (k === 'quote_name')           return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap">{altQuote.quote_name}</td>;
                            if (k === 'prod_type')            return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap text-[11px]">{altQuote.prod_type ?? '—'}</td>;
                            if (k === 'renew')                return <td key={k} className="px-3 py-2 text-center text-gray-400 whitespace-nowrap text-[11px]">{altQuote.renew ?? '—'}</td>;
                            if (k === 'pipe_comments')        return <td key={k} className="px-3 py-2 text-gray-400 max-w-[110px]"><span className="block truncate text-[11px]">{altQuote.pipe_comments || '—'}</span></td>;
                            if (k === 'quote_comments')       return <td key={k} className="px-3 py-2 text-gray-400 max-w-[110px]"><span className="block truncate text-[11px]">{altQuote.quote_comments || '—'}</span></td>;

                            if (k === 'hts_code')             return <td key={k} className="px-3 py-2 font-mono text-gray-400 whitespace-nowrap text-[11px]">{altQuote.hts_code ?? '—'}</td>;
                            if (k === 'hts_description')      return <td key={k} className="px-3 py-2 text-gray-400 max-w-[130px]"><span className="block truncate text-[11px]">{altQuote.hts_description ?? '—'}</span></td>;
                            if (k === 'is_engineering_ticket') return <td key={k} className="px-3 py-2 text-center text-gray-400 whitespace-nowrap text-[11px]">{altQuote.is_engineering_ticket ?? '—'}</td>;
                            return <td key={k} className="px-3 py-2 text-gray-400 whitespace-nowrap text-[11px]">{String((altQuote as Record<string, unknown>)[k as string] ?? '—')}</td>;
                          })}
                        </tr>
                      ) : null
                    )
                    : [];

                  return [mainRow, ...altRows];
                })}
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
        )}{/* fim viewMode === list */}
      </div>

      {/* -- Edit Modal -- */}
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
                  onChange={e => {
                    const newVal = e.target.value;
                    if (field.key === 'stage' && newVal === 'Net Lost' && editingQuote.stage !== 'Net Lost') {
                      setNetLostOpen(true);
                    } else {
                      setEditDraft(d => ({ ...d, [field.key]: newVal }));
                    }
                  }}
                  className={`${inp} ${changed ? 'ring-1 ring-amber-400 border-amber-300' : ''} bg-white`}
                >
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={val}
                  rows={3}
                  onChange={e => setEditDraft(d => ({ ...d, [field.key]: e.target.value }))}
                  className={`${inp} resize-none ${changed ? 'ring-1 ring-amber-400 border-amber-300' : ''}`}
                  placeholder={`${field.label}...`}
                />
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

        const richTextKeys = new Set(['pipe_comments', 'quote_comments', 'comments']);
        const changedCount = Object.keys(editDraft).filter(k => {
          const draftVal = (editDraft as Record<string, unknown>)[k];
          if (draftVal === undefined) return false;
          // For rich-text fields count as changed only if there is actual visible content
          if (richTextKeys.has(k)) {
            return String(draftVal).replace(/<[^>]+>/g, '').trim() !== '';
          }
          return String(draftVal) !== String(editingQuote[k as keyof Quote] ?? '');
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

                {/* -- Read-only info strip -- */}
                {(() => {
                  const cif = editingQuote.usd_value;
                  const fmtVal = (v?: number) => v == null ? '—' : v >= 1_000_000 ? `$${(v/1_000_000).toFixed(2)}M` : `$${(v/1_000).toFixed(0)}K`;
                  const gm = editingQuote.gm_pct ?? 0;
                  const gmColor = gm >= 15 ? 'text-emerald-700' : gm >= 8 ? 'text-amber-600' : 'text-red-600';

                  // Close date urgency
                  const closeStr = editingQuote.close_date;
                  const daysLeft = closeStr ? Math.ceil((new Date(closeStr).getTime() - Date.now()) / 86_400_000) : null;
                  const closeFmt = closeStr ? closeStr.split('-').reverse().join('/') : '—';
                  const closeUrgent = daysLeft !== null && daysLeft <= 30;
                  const closeOverdue = daysLeft !== null && daysLeft < 0;

                  return (
                    <div className="px-6 pt-4 pb-3 bg-gray-50 border-b border-gray-100 space-y-3">

                      {/* Net Lost banner — shown prominently when applicable */}
                      {editingQuote.stage === 'Net Lost' && editingQuote.lost_reason && (
                        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                            <X className="w-3 h-3 text-red-600" />
                          </span>
                          <div>
                            <p className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Net Lost — Motivo</p>
                            <p className="text-[12px] font-semibold text-red-800 mt-0.5">{editingQuote.lost_reason}</p>
                            {editingQuote.lost_comment && <p className="text-[11px] text-red-600 mt-0.5">{editingQuote.lost_comment}</p>}
                          </div>
                        </div>
                      )}

                      {/* Row 1 �� Identificacao */}
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Identificacao</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-[11px]">
                          <div>
                            <span className="text-gray-400 block leading-none mb-0.5">Vendor</span>
                            <span className="font-semibold text-gray-800">{editingQuote.vendor}</span>
                          </div>
                          {/* Registro de Oportunidade no Vendor — editavel, texto livre */}
                          {(() => {
                            const voVal = String((editDraft as Record<string, unknown>)['vendor_opportunity_id'] ?? editingQuote.vendor_opportunity_id ?? '');
                            const voChanged = (editDraft as Record<string, unknown>)['vendor_opportunity_id'] !== undefined &&
                              String((editDraft as Record<string, unknown>)['vendor_opportunity_id']) !== String(editingQuote.vendor_opportunity_id ?? '');
                            return (
                              <div className="col-span-1 sm:col-span-2">
                                <span className="text-gray-400 block leading-none mb-0.5 flex items-center gap-1">
                                  Reg. Oportunidade Vendor
                                  {voChanged && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Alterado" />}
                                </span>
                                <input
                                  type="text"
                                  placeholder="—"
                                  value={voVal}
                                  onChange={e => setEditDraft(d => ({ ...d, vendor_opportunity_id: e.target.value }))}
                                  pattern="[A-Za-z0-9\-_#]*"
                                  className={`px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 w-full ${
                                    voChanged ? 'ring-1 ring-amber-400 border-amber-300' : 'border-gray-200'
                                  } text-gray-700`}
                                />
                              </div>
                            );
                          })()}
                          <div>
                            <span className="text-gray-400 block leading-none mb-0.5">Master Customer</span>
                            <span className="font-semibold text-gray-800">{editingQuote.master_customer}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block leading-none mb-0.5">End User</span>
                            <span className="font-semibold text-gray-800 truncate block">{editingQuote.end_user}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block leading-none mb-0.5">Bill To</span>
                            <span className="text-gray-700">{editingQuote.bill_to ?? '—'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block leading-none mb-0.5">Territorio</span>
                            <span className="text-gray-700">{editingQuote.sales_territory}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block leading-none mb-0.5">Created</span>
                            <span className="text-gray-700">{editingQuote.created_date ? editingQuote.created_date.split('-').reverse().join('/') : '—'}</span>
                          </div>
                          {/* Close Date — editavel */}
                          <div className="col-span-2">
                            {(() => {
                              const cdVal = (editDraft as Record<string, unknown>)['close_date'] !== undefined
                                ? String((editDraft as Record<string, unknown>)['close_date'])
                                : editingQuote.close_date ?? '';
                              const cdChanged = (editDraft as Record<string, unknown>)['close_date'] !== undefined &&
                                String((editDraft as Record<string, unknown>)['close_date']) !== String(editingQuote.close_date ?? '');
                              return (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-gray-400 block leading-none mb-0.5 flex items-center gap-1">
                                    Close Date
                                    {cdChanged && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Alterado" />}
                                    {closeOverdue && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700 ml-1">Vencida</span>}
                                    {!closeOverdue && closeUrgent && daysLeft !== null && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 ml-1">{daysLeft}d</span>}
                                  </span>
                                  <input
                                    type="date"
                                    value={cdVal}
                                    onChange={e => setEditDraft(d => ({ ...d, close_date: e.target.value }))}
                                    className={`px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 ${cdChanged ? 'ring-1 ring-amber-400 border-amber-300' : 'border-gray-200'} ${closeOverdue ? 'text-red-600' : closeUrgent ? 'text-amber-600' : 'text-gray-700'}`}
                                  />
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200" />

                      {/* Row 2 — Valores */}
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Valores</p>
                        <div className="grid grid-cols-4 gap-x-4 gap-y-1.5 text-[11px]">
                          <div>
                            <span className="text-gray-400 block leading-none mb-0.5">CIF</span>
                            <span className="font-bold text-emerald-700 text-[13px]">{fmtVal(cif)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block leading-none mb-0.5">NET</span>
                            <span className="font-bold text-blue-700 text-[13px]">{fmtVal(editingQuote.net_value)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block leading-none mb-0.5">FOB</span>
                            <span className="font-bold text-violet-700 text-[13px]">{fmtVal(editingQuote.fob_value)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block leading-none mb-0.5">GM %</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold text-[13px] ${gmColor}`}>{gm.toFixed(1)}%</span>
                              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${gm >= 15 ? 'bg-emerald-500' : gm >= 8 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${Math.min(gm * 3, 100)}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* -- Pipeline (editaveis) -- */}
                <div className="px-6 pt-4 pb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pipeline</p>

                  {/* Stage + Credito Aprovado — two columns */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {/* Stage */}
                    <div>
                      {(() => {
                        const stageField = EDITABLE_FIELDS.find(f => f.key === 'stage')!;
                        const val = String((editDraft as Record<string, unknown>)['stage'] ?? editingQuote['stage'] ?? '');
                        const changed = (editDraft as Record<string, unknown>)['stage'] !== undefined &&
                          String((editDraft as Record<string, unknown>)['stage']) !== String(editingQuote['stage'] ?? '');
                        const STAGE_PROB: Record<string, number> = {
                          'Not Classified': 0, 'Pipelined': 20, 'Pricing 25%': 25, 'Up Selling 50%': 50, 'Committed 75%': 75, 'Net Lost': 0,
                        };
                        return (
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                              Stage
                              {changed && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Alterado" />}
                              <AISuggestButton
                                quote={editingQuote as unknown as Record<string, unknown>}
                                onApply={(stage, closeDate) => {
                                  const STAGE_PROB: Record<string, number> = { 'Not Classified': 0, 'Pipelined': 20, 'Pricing 25%': 25, 'Up Selling 50%': 50, 'Committed 75%': 75, 'Net Lost': 0 };
                                  setEditDraft(d => ({ ...d, stage, close_date: closeDate, ...(STAGE_PROB[stage] !== undefined ? { probability: STAGE_PROB[stage] } : {}) }));
                                }}
                              />
                            </label>
                            <select
                              value={val}
                              onChange={e => {
                                const newStage = e.target.value;
                                if (newStage === 'Net Lost' && editingQuote.stage !== 'Net Lost') {
                                  setNetLostOpen(true);
                                } else {
                                  const suggestedProb = STAGE_PROB[newStage];
                                  setEditDraft(d => ({
                                    ...d,
                                    stage: newStage,
                                    ...(suggestedProb !== undefined ? { probability: suggestedProb } : {}),
                                  }));
                                }
                              }}
                              className={`${inp} bg-white ${changed ? 'ring-1 ring-amber-400 border-amber-300' : ''}`}
                            >
                              {stageField.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Credito Aprovado */}
                    <div>
                      {(() => {
                        const creditoField = EDITABLE_FIELDS.find(f => f.key === 'credito_aprovado')!;
                        const val = String((editDraft as Record<string, unknown>)['credito_aprovado'] ?? editingQuote.credito_aprovado ?? '');
                        const changed = (editDraft as Record<string, unknown>)['credito_aprovado'] !== undefined &&
                          String((editDraft as Record<string, unknown>)['credito_aprovado']) !== String(editingQuote.credito_aprovado ?? '');
                        return (
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                              Credito Aprovado
                              {changed && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Alterado" />}
                            </label>
                            <select
                              value={val}
                              onChange={e => setEditDraft(d => ({ ...d, credito_aprovado: e.target.value }))}
                              className={`${inp} bg-white ${changed ? 'ring-1 ring-amber-400 border-amber-300' : ''}`}
                            >
                              <option value="">—</option>
                              {creditoField.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Renew (read-only) + Eng. Ticket (number input) */}
                  <div className="flex items-start gap-4">
                    {/* Renew — read-only badge */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Renew</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold w-fit ${
                        (editingQuote.renew ?? 'No') === 'Yes'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {(editingQuote.renew ?? 'No') === 'Yes' ? 'Sim' : 'Nao'}
                      </span>
                    </div>

                    {/* Eng. Ticket — number input */}
                    {(() => {
                      const val = String((editDraft as Record<string, unknown>)['is_engineering_ticket'] ?? editingQuote.is_engineering_ticket ?? '');
                      const changed = (editDraft as Record<string, unknown>)['is_engineering_ticket'] !== undefined &&
                        String((editDraft as Record<string, unknown>)['is_engineering_ticket']) !== String(editingQuote.is_engineering_ticket ?? '');
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                            Eng. Ticket
                            {changed && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Alterado" />}
                          </span>
                          <input
                            type="number"
                            min={0}
                            placeholder="—"
                            value={val}
                            onChange={e => setEditDraft(d => ({ ...d, is_engineering_ticket: e.target.value }))}
                            className={`${inp} w-28 ${changed ? 'ring-1 ring-amber-400 border-amber-300' : ''}`}
                          />
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="mx-6 border-t border-gray-100 dark:border-gray-800" />

                {/* -- Comentarios — abas Pipe | Quote -- */}
                {(() => {
                  const activeTab = activeCommentTab;
                  const setActiveTab = setActiveCommentTab;
                  const pipeDraft = (editDraft.pipe_comments ?? '') as string;
                  const quoteDraft = (editDraft.quote_comments ?? '') as string;
                  const pipeHasContent = pipeDraft.replace(/<[^>]+>/g, '').trim() !== '';
                  const quoteHasContent = quoteDraft.replace(/<[^>]+>/g, '').trim() !== '';
                  const pipeHistory = editingQuote.pipeCommentHistory ?? [];
                  const quoteHistory = editingQuote.quoteCommentHistory ?? [];
                  const activeHistory = activeTab === 'pipe' ? pipeHistory : quoteHistory;
                  const activeDraft = activeTab === 'pipe' ? pipeDraft : quoteDraft;
                  const activeHasContent = activeTab === 'pipe' ? pipeHasContent : quoteHasContent;

                  return (
                    <div className="px-6 pt-4 pb-5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Comentarios</p>

                      {/* Tab bar */}
                      <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-3 w-fit">
                        {(['pipe', 'quote'] as const).map(tab => {
                          const label = tab === 'pipe' ? 'Pipe Comments' : 'Quote Comments';
                          const isReadOnly = tab === 'quote';
                          const hasUnsaved = tab === 'pipe' ? pipeHasContent : quoteHasContent;
                          const histCount = (tab === 'pipe' ? pipeHistory : quoteHistory).length;
                          return (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setActiveTab(tab)}
                              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all ${
                                activeTab === tab
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                {isReadOnly && <Lock className="w-3 h-3 shrink-0 opacity-70" />}
                                {label}
                              </span>
                              {hasUnsaved && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />}
                              {histCount > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                  {histCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Editor — Pipe Comments editavel, Quote Comments somente leitura */}
                      {activeTab === 'pipe' ? (
                        <RichTextEditor
                          key="pipe"
                          value={pipeDraft}
                          onChange={html => setEditDraft(d => ({ ...d, pipe_comments: html }))}
                          placeholder="Proximos passos, contato, contexto estrategico..."
                          changed={pipeHasContent}
                        />
                      ) : (
                        <div className="rounded-lg border border-gray-200 bg-gray-50/80 ring-1 ring-gray-200 px-3 py-2.5 min-h-[80px]">
                          <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-gray-200">
                            <Lock className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Somente leitura</span>
                          </div>
                          {editingQuote.quote_comments
                            ? <div
                                className="text-xs text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_a]:text-blue-600 [&_a]:underline"
                                dangerouslySetInnerHTML={{ __html: editingQuote.quote_comments }}
                              />
                            : <span className="text-xs text-gray-400 italic">Sem comentarios do sistema.</span>
                          }
                          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-gray-300" />
                            Preenchido automaticamente pelo sistema — nao editavel.
                          </p>
                        </div>
                      )}

                      {/* History for active tab */}
                      {activeHistory.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                            Historico ({activeHistory.length})
                          </p>
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {[...activeHistory].reverse().map(entry => (
                              <div key={entry.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-[11px] font-semibold text-gray-700">{entry.author}</span>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(entry.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div
                                  className="text-xs text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:pl-4 [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_img]:rounded"
                                  dangerouslySetInnerHTML={{ __html: entry.html }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl overflow-hidden">
                {/* Saved feedback banner */}
                {savedFeedback && (
                  <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 border-b border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-700">
                      Alteracoes salvas com sucesso — {changedCount === 0 ? 'nenhum campo pendente' : 'feche o modal ou continue editando'}
                    </span>
                  </div>
                )}
                {/* Confirm row — appears when user clicks Salvar */}
                {confirmEditSave && !savedFeedback && (
                  <div className="flex items-center justify-between gap-3 px-6 py-3 bg-amber-50 border-b border-amber-200">
                    <span className="text-xs text-amber-800 font-medium">
                      Confirmar alteracao de <strong>{changedCount} {changedCount === 1 ? 'campo' : 'campos'}</strong> em <strong>{editingQuote.cpo_id}</strong>?
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setConfirmEditSave(false)}
                        className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={saveEdit}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
                {/* Default action row */}
                <div className="flex items-center justify-between px-6 py-4">
                  <button
                    onClick={closeEditModal}
                    className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    {savedFeedback ? 'Fechar' : 'Cancelar'}
                  </button>
                  {!savedFeedback && (
                    <button
                      onClick={() => { if (changedCount > 0) setConfirmEditSave(true); }}
                      disabled={changedCount === 0 || confirmEditSave}
                      className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                        changedCount > 0 && !confirmEditSave
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {changedCount > 0 ? `Salvar ${changedCount} ${changedCount === 1 ? 'alteracao' : 'alteracoes'}` : 'Sem alteracoes'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* -- Net Lost Popup — appears when stage changes to Net Lost -- */}
      {netLostOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
            {/* Header */}
            <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Registrar Perda</h2>
                <p className="text-xs text-gray-500 mt-0.5">Preencha os campos obrigatorios para marcar este quote como Net Lost.</p>
              </div>
            </div>
            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Motivo da Perda <span className="text-red-500">*</span>
                </label>
                <select
                  value={netLostReason}
                  onChange={e => setNetLostReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white"
                >
                  <option value="">Selecione um motivo...</option>
                  {LOSS_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Comentario sobre a Perda <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={netLostComment}
                  onChange={e => setNetLostComment(e.target.value)}
                  rows={4}
                  placeholder="Descreva o contexto da perda, concorrente, proposta apresentada..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
                />
                {netLostComment.trim() === '' && netLostReason !== '' && (
                  <p className="text-[11px] text-red-500">Comentario obrigatorio.</p>
                )}
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={cancelNetLost}
                className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmNetLost}
                disabled={!netLostValid}
                className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition ${
                  netLostValid
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Confirmar Perda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -- Confirm Bulk Edit Modal -- */}
      {confirmBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setConfirmBulk(false); }}>
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

      {/* -- Tour Overlay -- */}
      <TourOverlay
        isActive={tour.isTourActive}
        currentStep={tour.currentStep}
        steps={TOUR_STEPS}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onClose={tour.closeTour}
        onSkip={tour.skipTour}
        onNeverShow={tour.neverShowThisTourAgain}
        totalSteps={tour.totalSteps}
      />

      {/* -- History Modal -- */}
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

      {/* -- Scenario Group Modal -- */}
      {scenarioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setScenarioModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-600" />
                <h2 className="text-base font-bold text-gray-900">
                  {editingGroupId ? 'Editar Grupo de Cenários' : 'Criar Grupo de Cenários'}
                </h2>
              </div>
              <button onClick={() => setScenarioModalOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* Group name */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Nome da Oportunidade / Grupo</label>
                <input
                  type="text"
                  value={scenarioDraft.groupName}
                  onChange={e => setScenarioDraft(d => ({ ...d, groupName: e.target.value }))}
                  placeholder="Ex: Expansão Datacenter Cliente X"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">Identifica a oportunidade que originou esses cenários alternativos.</p>
              </div>

              <div className="border-t border-gray-100" />

              {/* Per-scenario editors */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Cenarios ({scenarioDraft.scenarios.length})</label>
                  <p className="text-[11px] text-gray-400">Marque um como Principal para o pipeline</p>
                </div>
                <div className="space-y-4">
                  {scenarioDraft.scenarios.map((s, i) => {
                    const q = quotes.find(qq => qq.id === s.quoteId);
                    const canRemove = scenarioDraft.scenarios.length > 2;
                    return (
                      <div key={s.quoteId} className={`rounded-xl border p-4 space-y-3 transition ${s.isPrimary ? 'border-violet-300 bg-violet-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
                        {/* Quote info + actions row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-mono font-bold text-blue-600">{q?.cpo_id}</span>
                              <span className="text-[11px] text-gray-500 truncate max-w-[200px]">{q?.quote_name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STAGE_COLORS[q?.stage ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>{q?.stage}</span>
                              <span className="text-[10px] text-emerald-700 font-semibold">${((q?.usd_value ?? 0) / 1000).toFixed(0)}K</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Remove from group button — only if 3+ members and not primary */}
                            {canRemove && !s.isPrimary && (
                              <button
                                onClick={() => setScenarioDraft(d => ({
                                  ...d,
                                  scenarios: d.scenarios.filter((_, j) => j !== i),
                                }))}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                                title="Remover do grupo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canRemove && s.isPrimary && (
                              <span className="w-[30px]" /> /* placeholder to keep layout aligned */
                            )}
                            <button
                              onClick={() => setScenarioDraft(d => ({
                                ...d,
                                scenarios: d.scenarios.map((sc, j) => ({ ...sc, isPrimary: j === i })),
                              }))}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition whitespace-nowrap ${
                                s.isPrimary
                                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                                  : 'bg-white text-gray-500 border-gray-300 hover:border-violet-400 hover:text-violet-600'
                              }`}
                            >
                              <Star className={`w-3 h-3 ${s.isPrimary ? 'fill-current' : ''}`} />
                              {s.isPrimary ? 'Principal' : 'Definir como principal'}
                            </button>
                          </div>
                        </div>
                        {/* Label */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Label do Cenario</label>
                          <input
                            type="text"
                            value={s.label}
                            onChange={e => setScenarioDraft(d => ({
                              ...d,
                              scenarios: d.scenarios.map((sc, j) => j === i ? { ...sc, label: e.target.value } : sc),
                            }))}
                            placeholder={`Cenario ${String.fromCharCode(65 + i)} — descricao curta`}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
                          />
                        </div>
                        {/* Likelihood + Reason */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Probabilidade de Escolha</label>
                            <select
                              value={s.likelihood}
                              onChange={e => setScenarioDraft(d => ({
                                ...d,
                                scenarios: d.scenarios.map((sc, j) => j === i ? { ...sc, likelihood: e.target.value as ScenarioLikelihood } : sc),
                              }))}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                            >
                              <option value="mais_provavel">Mais Provavel</option>
                              <option value="alternativo">Alternativo</option>
                              <option value="menos_provavel">Menos Provavel</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Justificativa</label>
                            <input
                              type="text"
                              value={s.reason}
                              onChange={e => setScenarioDraft(d => ({
                                ...d,
                                scenarios: d.scenarios.map((sc, j) => j === i ? { ...sc, reason: e.target.value } : sc),
                              }))}
                              placeholder="Ex: cliente prefere custo menor"
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* -- Add quote to group -- */}
                {(() => {
                  const currentIds = new Set(scenarioDraft.scenarios.map(s => s.quoteId));
                  const freeQuotes = quotes.filter(q => !q.scenarioGroupId && !currentIds.has(q.id));
                  if (freeQuotes.length === 0) return null;
                  return (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Adicionar Quote ao Grupo</label>
                      <div className="flex gap-2">
                        <select
                          id="add-quote-select"
                          defaultValue=""
                          className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                        >
                          <option value="" disabled>Selecionar quote livre...</option>
                          {freeQuotes.map(q => (
                            <option key={q.id} value={q.id}>
                              {q.cpo_id} — {q.quote_name} ({q.stage}, ${(q.usd_value / 1000).toFixed(0)}K)
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const sel = (document.getElementById('add-quote-select') as HTMLSelectElement);
                            const id = parseInt(sel.value);
                            if (!id) return;
                            const q = quotes.find(qq => qq.id === id);
                            if (!q) return;
                            const nextIdx = scenarioDraft.scenarios.length;
                            setScenarioDraft(d => ({
                              ...d,
                              scenarios: [...d.scenarios, {
                                quoteId: id,
                                label: `Cenario ${String.fromCharCode(65 + nextIdx)} — ${q.quote_name}`,
                                likelihood: 'alternativo' as ScenarioLikelihood,
                                reason: '',
                                isPrimary: false,
                              }],
                            }));
                            sel.value = '';
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-100 border border-violet-200 rounded-lg hover:bg-violet-200 transition whitespace-nowrap"
                        >
                          Adicionar
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Apenas quotes sem agrupamento podem ser adicionadas.</p>
                    </div>
                  );
                })()}
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Apenas o cenario marcado como <strong>Principal</strong> sera contado nos KPIs e totais do pipeline. Os demais ficam visiveis como alternativas da mesma oportunidade.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 bg-gray-50/80 rounded-b-2xl overflow-hidden">
              {/* Saved feedback banner */}
              {scenarioSavedFeedback && (
                <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 border-b border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-700">
                    {editingGroupId ? 'Grupo atualizado com sucesso' : 'Grupo criado com sucesso'} — feche o modal ou continue editando
                  </span>
                </div>
              )}
              {/* Confirm row */}
              {confirmScenarioSave && !scenarioSavedFeedback && (
                <div className="flex items-center justify-between gap-3 px-6 py-3 bg-amber-50 border-b border-amber-200">
                  <span className="text-xs text-amber-800 font-medium">
                    {editingGroupId
                      ? <>Confirmar alteracoes no grupo <strong>{scenarioDraft.groupName}</strong>?</>
                      : <>Criar grupo <strong>{scenarioDraft.groupName}</strong> com <strong>{scenarioDraft.scenarios.length}</strong> cenarios?</>
                    }
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmScenarioSave(false)}
                      className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleSaveScenarioGroup}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
              {/* Default action row */}
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  {editingGroupId && !scenarioSavedFeedback && (
                    <button
                      onClick={() => { handleDeleteScenarioGroup(editingGroupId); setScenarioModalOpen(false); }}
                      className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                    >
                      Desfazer Agrupamento
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setScenarioModalOpen(false); setScenarioSavedFeedback(false); setConfirmScenarioSave(false); }}
                    className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    {scenarioSavedFeedback ? 'Fechar' : 'Cancelar'}
                  </button>
                  {!scenarioSavedFeedback && (
                    <button
                      onClick={() => {
                        if (scenarioDraft.groupName.trim() && scenarioDraft.scenarios.length >= 2)
                          setConfirmScenarioSave(true);
                      }}
                      disabled={!scenarioDraft.groupName.trim() || scenarioDraft.scenarios.length < 2 || confirmScenarioSave}
                      className="px-5 py-2 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {editingGroupId ? 'Salvar Alteracoes' : 'Criar Grupo'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Chat Panel */}
      {aiChatOpen && (
        <AIChatPanel onClose={() => setAiChatOpen(false)} />
      )}

      {/* AI Summary Modal */}
      {aiSummaryOpen && (
        <AISummaryModal onClose={() => setAiSummaryOpen(false)} />
      )}
    </div>
  );
}
