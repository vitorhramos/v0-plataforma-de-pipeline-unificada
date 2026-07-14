'use client';

import { useState } from 'react';
import {
  Sparkles, TrendingUp, AlertTriangle, Info, CheckCircle,
  X, Loader2, RefreshCw, Clock, Target, ShieldAlert,
} from 'lucide-react';

interface Insight {
  type: 'warning' | 'success' | 'info' | 'danger';
  category: string;
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

interface AIInsightsPanelProps {
  onClose: () => void;
}

const TYPE_CONFIG = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50', border: 'border-amber-200',
    text: 'text-amber-800', iconColor: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50', border: 'border-emerald-200',
    text: 'text-emerald-800', iconColor: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50', border: 'border-blue-200',
    text: 'text-blue-800', iconColor: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
  danger: {
    icon: ShieldAlert,
    bg: 'bg-red-50', border: 'border-red-200',
    text: 'text-red-800', iconColor: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
  },
};

// Regras de negocio que o agente deve verificar em producao (dados reais do Snowflake):
// 1. DEALS PARADOS: close_date < hoje E stage != "Net Lost" E ultimo contato > 30 dias
// 2. CONCENTRACAO DE VENDOR: se um vendor representa > 50% do valor total do pipeline
// 3. CLOSE DATES DESATUALIZADAS: close_date < hoje E stage ativo (nao fechado)
// 4. CRESCIMENTO DE STAGE: variacao percentual de deals em Committed vs mes anterior
// 5. DEALS SEM ENG TICKET: eng_ticket = "No" E stage IN ("Pricing 25%", "Up Selling 50%")
// 6. CONCENTRACAO DE TIME: se um time concentra > 40% dos deals
// 7. NET LOST RECENTE: deals marcados como Net Lost nos ultimos 7 dias
// 8. RENOVACOES NAO PRIORIZADAS: renew = "Yes" E stage = "Pipelined" ou "Not Classified"
const MOCK_INSIGHTS: Insight[] = [
  {
    type: 'danger',
    category: 'Risco de Pipeline',
    title: '14 deals sem atividade ha mais de 30 dias',
    description: 'Oportunidades paradas aumentam o risco de perda silenciosa. Deals sem contato recente tendem a esfriar e sair do radar do comprador.',
    metric: '16% do pipeline total',
    action: 'Agendar follow-up imediato com os Sales Reps responsaveis.',
  },
  {
    type: 'warning',
    category: 'Concentracao de Risco',
    title: 'HPE representa mais de 60% do valor total',
    description: 'Alta concentracao em um unico vendor cria fragilidade. Qualquer problema de estoque, preco ou relacionamento impacta diretamente a meta do trimestre.',
    metric: '$54.3M de $90.5M total',
    action: 'Diversificar ativamente o pipeline com Cisco e Dell nos proximos 30 dias.',
  },
  {
    type: 'warning',
    category: 'Urgencia de Fechamento',
    title: '23 deals com close date vencida sem atualizacao',
    description: 'Datas de fechamento desatualizadas distorcem a previsao de receita e a confiabilidade do forecast. O pipeline parece maior do que realmente e.',
    metric: '27% dos deals ativos',
    action: 'Revisar e atualizar close dates com base no status real de cada deal.',
  },
  {
    type: 'success',
    category: 'Oportunidade',
    title: 'Stage Committed 75% cresceu 18% este mes',
    description: 'Aumento nos deals em Committed indica maturidade do pipeline. Este e o momento ideal para acelerar a criacao de POs e garantir o reconhecimento de receita.',
    metric: '+18% vs. mes anterior',
    action: 'Priorizar criacao de POs para os 8 deals Committed acima de $200K.',
  },
  {
    type: 'info',
    category: 'Eficiencia Operacional',
    title: '31 deals sem Engineering Ticket atribuido',
    description: 'Deals sem ENG Ticket ativo perdem prioridade na fila tecnica e podem ter atrasos na proposta, comprometendo o timeline de fechamento.',
    metric: '36% dos deals Pricing e Up Selling',
    action: 'Acionar time de pre-vendas para criacao dos tickets pendentes esta semana.',
  },
  {
    type: 'info',
    category: 'Saude do Pipeline',
    title: 'Team Alpha concentra 45% de todos os deals',
    description: 'Concentracao de oportunidades em um unico time pode indicar sub-aproveitamento dos demais. Analisar se e questao de territorio, vertical ou capacidade.',
    metric: '38 de 85 deals',
    action: 'Avaliar redistribuicao de contas estrategicas para balancear a carga.',
  },
  {
    type: 'danger',
    category: 'Perda Iminente',
    title: '7 deals marcados Net Lost nos ultimos 7 dias',
    description: 'Aumento recente em perdas pode indicar problema competitivo pontual. Analise dos motivos de perda e critica para ajuste rapido de proposta e posicionamento.',
    metric: '$8.2M em valor perdido',
    action: 'Conduzir win/loss review urgente com os reps envolvidos.',
  },
  {
    type: 'success',
    category: 'Renovacoes',
    title: '19 renovacoes identificadas com alto potencial',
    description: 'Renovacoes tem taxa de conversao 3x maior que novos deals e ciclo de venda mais curto. Priorizar este subconjunto pode acelerar significativamente o quarter.',
    metric: '$12.1M em renovacoes ativas',
    action: 'Criar campanha dedicada com proposta antecipada em 90 dias para cada renovacao.',
  },
];

export function AIInsightsPanel({ onClose }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'danger' | 'warning' | 'success' | 'info'>('all');

  const fetchInsights = () => {
    setLoading(true);
    setLoaded(false);
    setInsights([]);
    setFilter('all');
    // Simula latencia de analise — em producao chama /api/ai/insights com dados reais do Snowflake
    setTimeout(() => {
      setInsights(MOCK_INSIGHTS);
      setLoaded(true);
      setLoading(false);
    }, 1800);
  };

  const filtered = filter === 'all' ? insights : insights.filter(i => i.type === filter);
  const counts = {
    danger: insights.filter(i => i.type === 'danger').length,
    warning: insights.filter(i => i.type === 'warning').length,
    success: insights.filter(i => i.type === 'success').length,
    info: insights.filter(i => i.type === 'info').length,
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[430px] flex flex-col z-50 overflow-hidden max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-700 rounded-t-2xl shrink-0">
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Insights do Pipeline</p>
          <p className="text-[10px] text-violet-200">
            {loaded ? `${MOCK_INSIGHTS.length} alertas identificados` : 'Analise automatica por IA'}
          </p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Estado inicial */}
      {!loaded && !loading && (
        <div className="flex flex-col items-center gap-4 py-10 px-6 text-center">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Analise inteligente do pipeline</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs">
              A IA examina stage distribution, risco de concentracao, deals parados,
              urgencias de fechamento e oportunidades de aceleracao.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full text-left">
            {[
              { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50', label: 'Risco de perda iminente' },
              { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Concentracao e urgencias' },
              { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Oportunidades de acelerar' },
              { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Eficiencia operacional' },
            ].map(({ icon: Icon, color, bg, label }) => (
              <div key={label} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <p className="text-[11px] text-gray-600 leading-tight">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={fetchInsights}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition"
          >
            Gerar Insights Agora
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-12 px-6">
          <div className="relative">
            <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
            <Loader2 className="absolute -top-1 -right-1 w-5 h-5 text-violet-600 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Analisando pipeline...</p>
            <p className="text-xs text-gray-400 mt-1">Verificando regras de negocio e boas praticas</p>
          </div>
          <div className="w-full flex flex-col gap-2">
            {[
              'Checando deals sem atividade...',
              'Analisando concentracao por vendor...',
              'Identificando urgencias de fechamento...',
              'Verificando tickets e renovacoes...',
            ].map((step) => (
              <div key={step} className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin text-violet-400 shrink-0" />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights carregados */}
      {loaded && (
        <>
          {/* Filtros por tipo */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 shrink-0 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition whitespace-nowrap ${filter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
              Todos ({insights.length})
            </button>
            {counts.danger > 0 && (
              <button onClick={() => setFilter('danger')} className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition whitespace-nowrap ${filter === 'danger' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}>
                Critico ({counts.danger})
              </button>
            )}
            {counts.warning > 0 && (
              <button onClick={() => setFilter('warning')} className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition whitespace-nowrap ${filter === 'warning' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'}`}>
                Atencao ({counts.warning})
              </button>
            )}
            {counts.success > 0 && (
              <button onClick={() => setFilter('success')} className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition whitespace-nowrap ${filter === 'success' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                Positivo ({counts.success})
              </button>
            )}
            {counts.info > 0 && (
              <button onClick={() => setFilter('info')} className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition whitespace-nowrap ${filter === 'info' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
                Info ({counts.info})
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="flex flex-col gap-2.5 p-4 overflow-y-auto">
            {filtered.map((insight, i) => {
              const cfg = TYPE_CONFIG[insight.type];
              const Icon = cfg.icon;
              return (
                <div key={i} className={`rounded-xl border p-3.5 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-start gap-2.5">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.badge}`}>
                          {insight.category}
                        </span>
                        {insight.metric && (
                          <span className="text-[10px] font-bold text-gray-500">{insight.metric}</span>
                        )}
                      </div>
                      <p className={`text-xs font-semibold ${cfg.text} mb-1`}>{insight.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                      {insight.action && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <Target className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-gray-500 italic leading-tight">{insight.action}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 shrink-0">
            <button
              onClick={fetchInsights}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-violet-600 hover:text-violet-700 border border-violet-200 hover:border-violet-300 rounded-lg transition bg-violet-50 hover:bg-violet-100"
            >
              <RefreshCw className="w-3 h-3" />
              Atualizar Insights
            </button>
          </div>
        </>
      )}
    </div>
  );
}
