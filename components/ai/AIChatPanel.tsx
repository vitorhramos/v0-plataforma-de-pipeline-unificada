'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { X, Send, Bot, User, Loader2, MessageSquare, Minimize2, Maximize2 } from 'lucide-react';

interface AIChatPanelProps {
  onClose: () => void;
}

const SUGGESTIONS = [
  'Qual o total do pipeline atual?',
  'Quais deals fecham esse mes?',
  'Qual vendor tem mais oportunidades?',
  'Quais deals estao em risco?',
];

export function AIChatPanel({ onClose }: AIChatPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/ai/chat',
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  const panelWidth = expanded ? 'w-[520px]' : 'w-[360px]';
  const panelHeight = expanded ? 'h-[600px]' : 'h-[480px]';

  return (
    <div className={`fixed bottom-6 right-6 ${panelWidth} ${panelHeight} bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Assistente de Pipeline</p>
          <p className="text-[10px] text-blue-200">Powered by GPT-4o mini</p>
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
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Pergunte sobre o pipeline</p>
              <p className="text-xs text-gray-400 mt-1">Use linguagem natural em portugues</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-left text-xs px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-lg transition text-gray-600"
                >
                  {s}
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
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-sm'
            }`}>
              {m.parts?.map((part, i) =>
                part.type === 'text' ? <span key={i}>{part.text}</span> : null
              ) ?? m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl rounded-tl-sm px-3 py-2">
              <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 border-t border-gray-100">
        <input
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Pergunte sobre o pipeline..."
          className="flex-1 text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 resize-none"
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
