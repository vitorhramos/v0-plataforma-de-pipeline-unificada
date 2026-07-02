'use client';

import { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Info, CheckCircle, X, Loader2, RefreshCw } from 'lucide-react';

interface Insight {
  type: 'warning' | 'success' | 'info' | 'danger';
  title: string;
  description: string;
  metric?: string;
}

interface AIInsightsPanelProps {
  onClose: () => void;
}

const TYPE_CONFIG = {
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-500' },
  success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
  info:    { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-500' },
  danger:  { icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', iconColor: 'text-red-500' },
};

export function AIInsightsPanel({ onClose }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInsights(data.insights ?? []);
      setLoaded(true);
    } catch (e) {
      setError('Erro ao gerar insights. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[380px] flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-700 rounded-t-2xl">
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Insights do Pipeline</p>
          <p className="text-[10px] text-violet-200">Analise automatica por IA</p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 max-h-[420px] overflow-y-auto">
        {!loaded && !loading && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Gerar insights com IA</p>
              <p className="text-xs text-gray-400 mt-1">A IA analisa seu pipeline e identifica oportunidades e riscos</p>
            </div>
            <button
              onClick={fetchInsights}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition"
            >
              Gerar Insights
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            <p className="text-xs text-gray-500">Analisando pipeline...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {loaded && !loading && insights.map((insight, i) => {
          const cfg = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.info;
          const Icon = cfg.icon;
          return (
            <div key={i} className={`flex gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${cfg.text}`}>{insight.title}</p>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{insight.description}</p>
                {insight.metric && (
                  <span className={`inline-block mt-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                    {insight.metric}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loaded && !loading && (
        <div className="px-4 pb-4">
          <button
            onClick={fetchInsights}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-violet-600 hover:text-violet-700 border border-violet-200 hover:border-violet-300 rounded-lg transition bg-violet-50 hover:bg-violet-100"
          >
            <RefreshCw className="w-3 h-3" />
            Atualizar Insights
          </button>
        </div>
      )}
    </div>
  );
}
