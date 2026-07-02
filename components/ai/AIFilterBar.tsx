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
}

const EXAMPLES = [
  'HPE acima de $500K',
  'Committed fechando esse mes',
  'deals em risco no Sao Paulo',
  'renovacoes sem eng ticket',
];

export function AIFilterBar({ onApplyFilters, onClear, activeInterpretation }: AIFilterBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const apply = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.error && !data.interpreted) throw new Error(data.error);
      onApplyFilters(data.filters ?? {}, data.interpreted ?? q);
      setQuery('');
    } catch {
      setError('Nao entendi. Tente reformular.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
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

      {/* Examples */}
      {!activeInterpretation && (
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
