'use client';

import { useState, useRef } from 'react';
import { Sparkles, Loader2, X, Search, ChevronRight } from 'lucide-react';

interface AIFilters {
  stage?: string;
  vendor?: string;
  territory?: string;
  team?: string;
  cif_min?: number;
  cif_max?: number;
  prob_min?: number;
  prob_max?: number;
  renew?: string;
  eng_ticket?: string;
  close_date_from?: string;
  close_date_to?: string;
  search?: string;
}

interface AIFilterBarProps {
  onApplyFilters: (filters: AIFilters, interpreted: string) => void;
  onClear: () => void;
  activeInterpretation?: string;
  compact?: boolean;
}

const EXAMPLES = [
  'HPE acima de $500K',
  'Committed fechando esse mes',
  'deals em risco no Sao Paulo',
  'renovacoes sem eng ticket',
];

// Interpretacao local de linguagem natural — sem chamar API
// Em producao, substituir por chamada real ao /api/ai/filter com dados do Snowflake
function interpretQuery(q: string): { filters: AIFilters; interpreted: string } | null {
  const lower = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filters: AIFilters = {};
  const parts: string[] = [];

  // Vendor
  if (lower.includes('hpe') || lower.includes('hewlett')) {
    filters.vendor = 'HPE'; parts.push('Vendor: HPE');
  } else if (lower.includes('cisco')) {
    filters.vendor = 'Cisco'; parts.push('Vendor: Cisco');
  } else if (lower.includes('dell')) {
    filters.vendor = 'Dell'; parts.push('Vendor: Dell');
  }

  // Stage
  if (lower.includes('committed') || lower.includes('75%')) {
    filters.stage = 'Committed 75%'; parts.push('Stage: Committed 75%');
  } else if (lower.includes('up selling') || lower.includes('upselling') || lower.includes('50%')) {
    filters.stage = 'Up Selling 50%'; parts.push('Stage: Up Selling 50%');
  } else if (lower.includes('pricing') || lower.includes('25%')) {
    filters.stage = 'Pricing 25%'; parts.push('Stage: Pricing 25%');
  } else if (lower.includes('pipelined') || lower.includes('pipeline')) {
    filters.stage = 'Pipelined'; parts.push('Stage: Pipelined');
  } else if (lower.includes('net lost') || lower.includes('netlost') || lower.includes('perdid')) {
    filters.stage = 'Net Lost'; parts.push('Stage: Net Lost');
  } else if (lower.includes('risco') || lower.includes('em risco')) {
    // Risco = Net Lost + deals parados, representa Pipelined+Not Classified
    filters.stage = 'Pipelined'; parts.push('Stage: Pipelined (em risco)');
  }

  // Valor minimo
  const matchK = lower.match(/acima de\s+\$?([\d,]+)k/);
  const matchM = lower.match(/acima de\s+\$?([\d,.]+)m/);
  const matchDolar = lower.match(/acima de\s+\$?([\d,.]+)/);
  if (matchK) {
    filters.cif_min = parseInt(matchK[1].replace(',', '')) * 1000;
    parts.push(`CIF > $${filters.cif_min.toLocaleString()}`);
  } else if (matchM) {
    filters.cif_min = parseFloat(matchM[1].replace(',', '')) * 1000000;
    parts.push(`CIF > $${filters.cif_min.toLocaleString()}`);
  } else if (matchDolar && !matchK && !matchM) {
    filters.cif_min = parseInt(matchDolar[1].replace(/[,\.]/g, ''));
    if (filters.cif_min > 100) parts.push(`CIF > $${filters.cif_min.toLocaleString()}`);
    else filters.cif_min = undefined;
  }

  // Territorio
  if (lower.includes('sao paulo') || lower.includes('sp')) {
    filters.territory = 'Sao Paulo'; parts.push('Territorio: Sao Paulo');
  } else if (lower.includes('sul') || lower.includes('rs') || lower.includes('sc') || lower.includes('pr')) {
    filters.territory = 'Sul'; parts.push('Territorio: Sul');
  } else if (lower.includes('nordeste') || lower.includes('ne')) {
    filters.territory = 'Nordeste'; parts.push('Territorio: Nordeste');
  }

  // Renovacoes
  if (lower.includes('renov')) {
    filters.renew = 'yes'; parts.push('Renovacoes: Sim');
  }

  // Eng ticket
  if (lower.includes('sem eng') || lower.includes('sem ticket') || lower.includes('sem engineering')) {
    filters.eng_ticket = 'no'; parts.push('Eng Ticket: Nao');
  }

  // Close date — esse mes
  if (lower.includes('esse mes') || lower.includes('este mes') || lower.includes('fechando') || lower.includes('fecha esse')) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    filters.close_date_from = firstDay;
    filters.close_date_to = lastDay;
    parts.push(`Close date: ${now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`);
  }

  if (parts.length === 0) return null;

  return { filters, interpreted: parts.join(' · ') };
}

export function AIFilterBar({ onApplyFilters, onClear, activeInterpretation, compact }: AIFilterBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const apply = (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');

    // Simula latencia de 600ms para dar sensacao de processamento
    setTimeout(() => {
      const result = interpretQuery(q);
      if (!result) {
        setError('Nao entendi. Tente: "HPE acima de $500K" ou "Committed fechando esse mes".');
      } else {
        onApplyFilters(result.filters, result.interpreted);
        setQuery('');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className={`flex flex-col ${compact ? 'gap-1' : 'gap-2'}`}>
      {/* Input row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setError(''); }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) apply(query);
            }}
            placeholder="Filtrar com IA... ex: HPE acima de $500K"
            className="w-full pl-9 pr-4 py-2 text-xs border border-violet-200 bg-violet-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white placeholder-violet-400 text-gray-700"
            disabled={loading}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-500 animate-spin" />
          )}
        </div>
        <button
          onClick={() => apply(query)}
          disabled={loading || !query.trim()}
          className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition whitespace-nowrap"
        >
          <Search className="w-3 h-3" />
          Buscar
        </button>
      </div>

      {/* Examples — only shown when not compact and no active interpretation */}
      {!compact && !activeInterpretation && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-gray-400">Exemplos:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); apply(ex); }}
              className="text-[10px] px-2 py-0.5 bg-gray-100 hover:bg-violet-100 hover:text-violet-700 text-gray-500 rounded-full transition border border-transparent hover:border-violet-200"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Active interpretation badge */}
      {activeInterpretation && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-violet-50 border border-violet-200 rounded-lg">
          <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
          <span className="text-[11px] text-violet-700 flex-1">
            <span className="font-semibold">IA interpretou:</span> {activeInterpretation}
          </span>
          <button onClick={onClear} className="text-violet-400 hover:text-violet-600 transition">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
