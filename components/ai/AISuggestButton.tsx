'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, X, TrendingUp, Calendar, ChevronDown } from 'lucide-react';

interface Suggestion {
  suggested_stage: string;
  suggested_close_date: string;
  stage_reasoning: string;
  date_reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}

interface AISuggestButtonProps {
  quote: Record<string, unknown>;
  onApply: (stage: string, closeDate: string) => void;
}

const CONFIDENCE_CONFIG = {
  high:   { label: 'Alta confianca', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  medium: { label: 'Media confianca', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  low:    { label: 'Baixa confianca', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
};

export function AISuggestButton({ quote, onApply }: AISuggestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestion = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote }),
      });
      const data = await res.json();
      if (data.error || !data.suggestion) throw new Error(data.error ?? 'Erro desconhecido');
      setSuggestion(data.suggestion);
      setOpen(true);
    } catch {
      setError('Erro ao gerar sugestao.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    onApply(suggestion.suggested_stage, suggestion.suggested_close_date);
    setOpen(false);
    setSuggestion(null);
  };

  const conf = suggestion ? (CONFIDENCE_CONFIG[suggestion.confidence] ?? CONFIDENCE_CONFIG.medium) : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={suggestion ? () => setOpen(o => !o) : fetchSuggestion}
        disabled={loading}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition ${
          suggestion
            ? 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
      >
        {loading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Sparkles className="w-3.5 h-3.5 text-violet-500" />
        }
        <span>{loading ? 'Analisando...' : suggestion ? 'Ver sugestao' : 'Sugerir com IA'}</span>
        {suggestion && <ChevronDown className={`w-3 h-3 transition ${open ? 'rotate-180' : ''}`} />}
      </button>

      {error && (
        <p className="absolute top-full mt-1 left-0 text-[10px] text-red-500 bg-white border border-red-200 rounded-lg px-2 py-1 shadow-sm whitespace-nowrap z-10">
          {error}
        </p>
      )}

      {open && suggestion && conf && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">Sugestao da IA</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${conf.bg} ${conf.color}`}>
              {conf.label}
            </span>
          </div>

          {/* Stage suggestion */}
          <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">Stage Sugerido</p>
              <p className="text-xs font-bold text-blue-800">{suggestion.suggested_stage}</p>
              <p className="text-[10px] text-blue-600 mt-0.5">{suggestion.stage_reasoning}</p>
            </div>
          </div>

          {/* Date suggestion */}
          <div className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wide">Close Date Sugerida</p>
              <p className="text-xs font-bold text-emerald-800">{suggestion.suggested_close_date}</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">{suggestion.date_reasoning}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
            >
              <Check className="w-3 h-3" />
              Aplicar
            </button>
            <button
              onClick={() => { setOpen(false); setSuggestion(null); }}
              className="flex items-center justify-center w-8 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg transition"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
