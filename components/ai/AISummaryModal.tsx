'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, X, Copy, Check, RefreshCw, Sparkles, TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';

interface AISummaryModalProps {
  onClose: () => void;
}

// Secoes do resumo executivo simulado
// Em producao, este texto e gerado com streaming pela rota /api/ai/summary
// usando dados reais do Snowflake via lib/ai-context.ts
const SUMMARY_SECTIONS = [
  {
    id: 'overview',
    icon: BarChart3,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'Visao Geral',
    content: `O pipeline atual registra 85 oportunidades ativas com valor total de $90.5M em CIF, distribuidas entre 6 stages. O quarter apresenta crescimento de 12% em relacao ao periodo anterior, puxado principalmente pelo avanço de deals no stage Committed 75%, que cresceu 18% no mes. A previsao de receita para os proximos 90 dias e de aproximadamente $34.2M, considerando apenas os deals com probabilidade acima de 50%.`,
  },
  {
    id: 'highlights',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    title: 'Destaques Positivos',
    content: `O crescimento de 18% no stage Committed indica maturidade do pipeline e maior previsibilidade de receita para o proximo quarter. O portfolio de renovacoes se destaca com 19 oportunidades ativas totalizando $12.1M, com taxa historica de conversao 3x superior a novos deals. A diversificacao geografica e positiva, com presenca em 8 territorios e concentracao saudavel no eixo Sao Paulo-Brasil Central, que representa 62% do valor total.`,
  },
  {
    id: 'risks',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'Riscos e Alertas',
    content: `O principal risco identificado e a alta concentracao em HPE, que representa 60% ($54.3M) do valor total do pipeline. Qualquer disrupcao neste relacionamento — seja por questoes de estoque, pricing ou competitividade — impacta diretamente a meta do quarter. Adicionalmente, 23 deals possuem close date vencida sem atualizacao, o que distorce o forecast e reduz a confiabilidade do pipeline. Os 14 deals sem atividade ha mais de 30 dias representam $18.7M em risco de perda silenciosa.`,
  },
  {
    id: 'recommendations',
    icon: Lightbulb,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    title: 'Recomendacoes',
    content: `Prioridade 1: Atualizar close dates dos 23 deals vencidos e agendar follow-up imediato para os 14 deals parados — estas acoes tem impacto direto na qualidade do forecast. Prioridade 2: Iniciar campanha de renovacoes para os 19 deals identificados, com proposta antecipada em 90 dias. Prioridade 3: Acionar pre-vendas para criar Engineering Tickets nos 31 deals pendentes em Pricing e Up Selling, reduzindo o risco de atrasos tecnicos no fechamento. Diversificacao do portfolio de vendors deve ser meta para o proximo quarter.`,
  },
];

// Simula streaming caractere por caractere
function useTypingEffect(text: string, active: boolean, speed = 8) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); indexRef.current = 0; return; }
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return { displayed, done };
}

function SummarySection({
  section,
  active,
  delay,
}: {
  section: typeof SUMMARY_SECTIONS[0];
  active: boolean;
  delay: number;
}) {
  const [started, setStarted] = useState(false);
  const Icon = section.icon;

  useEffect(() => {
    if (!active) { setStarted(false); return; }
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  const { displayed, done } = useTypingEffect(section.content, started, 6);

  if (!active && !started) return null;

  return (
    <div className={`rounded-xl border p-4 ${section.bg} ${section.border}`}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-white border ${section.border}`}>
          <Icon className={`w-3.5 h-3.5 ${section.color}`} />
        </div>
        <h3 className={`text-xs font-bold ${section.color}`}>{section.title}</h3>
      </div>
      <p className="text-xs text-gray-700 leading-relaxed">
        {displayed}
        {!done && started && (
          <span className="inline-block w-0.5 h-3.5 bg-gray-500 animate-pulse ml-0.5 align-text-bottom" />
        )}
      </p>
    </div>
  );
}

export function AISummaryModal({ onClose }: AISummaryModalProps) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    setGenerated(false);
    setGenerating(true);
    // Simula delay inicial de analise antes de comecar o streaming das secoes
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1400);
  };

  // Delays escalonados para cada secao aparecer em sequencia (efeito streaming real)
  const SECTION_DELAYS = [0, 2200, 5000, 8200];

  const fullText = SUMMARY_SECTIONS.map(s => `${s.title}\n\n${s.content}`).join('\n\n---\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setGenerated(false);
    setGenerating(false);
    setTimeout(() => generate(), 50);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-800">Resumo Executivo do Pipeline</h2>
            <p className="text-[11px] text-gray-400">Gerado por IA com base nos dados atuais — pronto para apresentacao</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Estado inicial */}
          {!generating && !generated && (
            <div className="flex flex-col items-center gap-5 py-10 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl flex items-center justify-center border border-violet-100">
                <Sparkles className="w-8 h-8 text-violet-500" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-800">Gerar Resumo Executivo</p>
                <p className="text-xs text-gray-400 mt-1.5 max-w-sm leading-relaxed">
                  A IA analisa os dados do pipeline e gera um documento estruturado com visao geral,
                  destaques, riscos e recomendacoes — pronto para apresentar ao seu diretor.
                </p>
              </div>
              {/* Preview das secoes */}
              <div className="w-full grid grid-cols-2 gap-2 text-left">
                {SUMMARY_SECTIONS.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className={`flex items-center gap-2.5 p-3 rounded-xl border ${s.bg} ${s.border}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${s.color}`} />
                      <span className={`text-xs font-medium ${s.color}`}>{s.title}</span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={generate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Gerar Resumo Agora
              </button>
            </div>
          )}

          {/* Gerando */}
          {generating && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl flex items-center justify-center border border-violet-100">
                  <Sparkles className="w-7 h-7 text-violet-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Analisando dados do pipeline...</p>
              <p className="text-xs text-gray-400">Preparando resumo executivo</p>
            </div>
          )}

          {/* Secoes com streaming simulado */}
          {generated && (
            <div className="flex flex-col gap-3.5">
              {SUMMARY_SECTIONS.map((section, i) => (
                <SummarySection
                  key={section.id}
                  section={section}
                  active={generated}
                  delay={SECTION_DELAYS[i]}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {generated && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition"
            >
              <RefreshCw className="w-3 h-3" />
              Gerar novamente
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition ${
                copied
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado!' : 'Copiar texto completo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
