'use client';

import { useRef, useEffect, useState } from 'react';
import { X, Send, Bot, User, Loader2, MessageSquare, Minimize2, Maximize2, Sparkles } from 'lucide-react';

interface AIChatPanelProps {
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  { label: 'Total do pipeline atual', query: 'Qual e o valor total do pipeline atual?' },
  { label: 'Deals fechando esse mes', query: 'Quais deals tem close date esse mes?' },
  { label: 'Vendor com mais oportunidades', query: 'Qual vendor tem mais oportunidades em valor?' },
  { label: 'Deals em risco', query: 'Quais deals estao em maior risco de perda?' },
  { label: 'Deals sem atividade', query: 'Quais deals estao parados ha mais de 30 dias?' },
  { label: 'Resumo por stage', query: 'Qual a distribuicao do pipeline por stage?' },
];

// Respostas simuladas por palavra-chave
// Em producao, as respostas vem da rota /api/ai/chat com dados reais do Snowflake
const MOCK_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ['total', 'valor', 'pipeline', 'quanto'],
    response: `O pipeline atual possui 85 oportunidades ativas com valor total de **$90.5M em CIF**.\n\nDistribuicao por probabilidade:\n• Alta (>75%): $21.3M — 8 deals em Committed\n• Media (25–74%): $48.9M — 41 deals em Pricing e Up Selling\n• Baixa (<25%): $20.3M — 36 deals em Pipelined e Not Classified\n\nPrevisao de receita nos proximos 90 dias: **$34.2M** (considerando deals acima de 50% de probabilidade).`,
  },
  {
    keywords: ['fechando', 'fecha', 'mes', 'close date', 'este mes', 'esse mes'],
    response: `Identifiquei **12 deals** com close date prevista para este mes:\n\n• 3 deals em **Committed 75%** — total $4.8M (alta probabilidade)\n• 5 deals em **Up Selling 50%** — total $6.2M (atencao necessaria)\n• 4 deals em **Pricing 25%** — total $3.1M (risco elevado)\n\nRecomendo priorizar os deals Committed e agendar follow-up urgente com os deals de Up Selling que ainda nao tem PO criada.`,
  },
  {
    keywords: ['vendor', 'fornecedor', 'fabricante', 'mais oportunidades', 'maior'],
    response: `**HPE** lidera com folga o portfolio:\n\n• **HPE**: $54.3M — 47 deals (60% do valor total)\n• **Cisco**: $18.7M — 19 deals (21%)\n• **Dell**: $9.8M — 11 deals (11%)\n• **Outros**: $7.7M — 8 deals (8%)\n\nAtencao: a alta concentracao em HPE e um risco identificado. Recomendo diversificar ativamente nos proximos 60 dias para reduzir dependencia de um unico vendor.`,
  },
  {
    keywords: ['risco', 'perda', 'em risco', 'perdendo', 'preocupante'],
    response: `Identifiquei **3 categorias de risco** no pipeline atual:\n\n**Critico:**\n• 7 deals marcados como Net Lost nos ultimos 7 dias ($8.2M)\n• 14 deals sem atividade ha +30 dias ($18.7M em risco silencioso)\n\n**Atencao:**\n• 23 deals com close date vencida sem atualizacao\n• 5 deals em Committed sem PO iniciada, com close date em menos de 15 dias\n\nAcao imediata: contate os reps responsaveis pelos 14 deals parados e atualize o status esta semana.`,
  },
  {
    keywords: ['parado', 'parados', 'atividade', 'sem contato', 'inativo'],
    response: `Encontrei **14 deals sem atividade ha mais de 30 dias**, representando $18.7M:\n\n• 6 deals no stage **Up Selling 50%** — maior urgencia\n• 5 deals em **Pricing 25%**\n• 3 deals em **Committed 75%** — risco critico (deal avancado parado)\n\nOs responsaveis sao distribuidos entre 4 Sales Reps. Sugiro criar uma tarefa de follow-up para cada um com prazo de 48h. Deals em Committed parados sao o risco mais alto — o comprador pode estar reavaliando a decisao.`,
  },
  {
    keywords: ['stage', 'distribuicao', 'etapa', 'funil', 'breakdown'],
    response: `Distribuicao do pipeline por stage:\n\n• **Not Classified**: 12 deals — $9.2M (13.5% do valor, 14.1% dos deals)\n• **Pipelined**: 24 deals — $11.1M (12.3%)\n• **Pricing 25%**: 19 deals — $22.8M (25.2%)\n• **Up Selling 50%**: 18 deals — $26.1M (28.8%)\n• **Committed 75%**: 8 deals — $17.6M (19.4%)\n• **Net Lost**: 4 deals — $3.7M (fora do pipeline ativo)\n\nO pipeline tem uma distribuicao saudavel com boa concentracao nos stages medios (Pricing + Up Selling = 54% do valor).`,
  },
  {
    keywords: ['renovacao', 'renovacoes', 'renew', 'renewal'],
    response: `Existem **19 deals de renovacao** identificados no pipeline, totalizando **$12.1M**:\n\n• 8 deals em stage avancado (Up Selling/Committed) — $7.3M\n• 11 deals em stage inicial (Pricing/Pipelined) — $4.8M\n\nRenovacoes tem taxa de conversao historica de 3x em relacao a novos deals e ciclo medio 40% menor. Recomendo criar uma campanha dedicada com proposta antecipada em 90 dias para todas as renovacoes identificadas.`,
  },
  {
    keywords: ['team', 'time', 'equipe', 'squad'],
    response: `Distribuicao do pipeline por time:\n\n• **Team Alpha**: 38 deals — $41.2M (45.5% do valor)\n• **Team Beta**: 24 deals — $28.7M (31.7%)\n• **Team Gamma**: 14 deals — $13.4M (14.8%)\n• **Team Delta**: 9 deals — $7.2M (8.0%)\n\nTeam Alpha concentra quase metade do valor. Isso pode indicar sub-aproveitamento dos outros times ou uma questao de territorio e vertical. Vale analisar se e possivel redistribuir algumas contas estrategicas.`,
  },
  {
    keywords: ['eng ticket', 'engineering ticket', 'ticket tecnico', 'ticket'],
    response: `Encontrei **31 deals sem Engineering Ticket** atribuido:\n\n• 18 deals em **Pricing 25%** — tickets pendentes bloqueiam proposta tecnica\n• 13 deals em **Up Selling 50%** — risco de atraso no fechamento\n\nDeals sem ticket tecnico ativo tendem a ter timeline de fechamento 35% maior. Recomendo acionar o time de pre-vendas esta semana para criar todos os tickets pendentes, priorizando os deals de maior valor.`,
  },
];

const DEFAULT_RESPONSE = `Entendi sua pergunta sobre o pipeline. Com base nos dados atuais de 85 deals e $90.5M em valor total, posso ajudar com analises de vendors, stages, riscos, close dates, renovacoes e performance por time.\n\nTente perguntar de forma mais especifica, por exemplo:\n• "Quais deals fecham esse mes?"\n• "Qual vendor tem mais risco?"\n• "Como esta a distribuicao por stage?"`;

function getSimulatedResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const { keywords, response } of MOCK_RESPONSES) {
    if (keywords.some(k => lower.includes(k))) return response;
  }
  return DEFAULT_RESPONSE;
}

// Simula streaming de texto
function useStreamingText(text: string, active: boolean) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active || !text) return;
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current += 3; // velocidade
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text, active]);

  return { displayed, done };
}

function AssistantMessage({ content }: { content: string }) {
  const { displayed, done } = useStreamingText(content, true);
  return (
    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
      {displayed}
      {!done && <span className="inline-block w-0.5 h-3.5 bg-gray-400 animate-pulse ml-0.5 align-text-bottom" />}
    </p>
  );
}

export function AIChatPanel({ onClose }: AIChatPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simula latencia de resposta (400–900ms)
    const delay = 400 + Math.random() * 500;
    setTimeout(() => {
      const response = getSimulatedResponse(text);
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const panelWidth = expanded ? 'w-[540px]' : 'w-[380px]';
  const panelHeight = expanded ? 'h-[620px]' : 'h-[500px]';

  return (
    <div className={`fixed bottom-6 right-6 ${panelWidth} ${panelHeight} bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl shrink-0">
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Assistente de Pipeline</p>
          <p className="text-[10px] text-blue-200">Pergunte em portugues sobre seus deals</p>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="text-white/70 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
          {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onClose} className="text-white/70 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 h-full justify-center text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Assistente do Pipeline</p>
              <p className="text-xs text-gray-400 mt-1">Pergunte sobre deals, vendors, stages e riscos</p>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.query)}
                  className="text-left text-xs px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-lg transition text-gray-600 flex items-center gap-2"
                >
                  <MessageSquare className="w-3 h-3 text-gray-400 shrink-0" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${m.role === 'user' ? 'bg-blue-600' : 'bg-gray-100'}`}>
              {m.role === 'user'
                ? <User className="w-3.5 h-3.5 text-white" />
                : <Bot className="w-3.5 h-3.5 text-gray-500" />
              }
            </div>
            <div className={`max-w-[82%] px-3 py-2.5 rounded-xl ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm text-xs leading-relaxed'
                : 'bg-gray-50 border border-gray-100 rounded-tl-sm'
            }`}>
              {m.role === 'user'
                ? <p className="text-xs leading-relaxed">{m.content}</p>
                : <AssistantMessage content={m.content} />
              }
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-gray-100 shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Pergunte sobre o pipeline..."
          className="flex-1 text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
