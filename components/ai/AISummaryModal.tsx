'use client';

import { useState, useRef } from 'react';
import { FileText, X, Loader2, Copy, Check, RefreshCw } from 'lucide-react';

interface AISummaryModalProps {
  onClose: () => void;
}

export function AISummaryModal({ onClose }: AISummaryModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  const generate = async () => {
    setText('');
    setLoading(true);
    setGenerated(false);
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setText(prev => prev + chunk);
      }
      setGenerated(true);
    } catch (e) {
      setText('Erro ao gerar resumo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStop = () => {
    readerRef.current?.cancel();
    setLoading(false);
    setGenerated(true);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-800">Resumo Executivo</h2>
            <p className="text-[11px] text-gray-400">Gerado por GPT-4o com base nos dados atuais do pipeline</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!generated && !loading && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Gerar resumo executivo</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  A IA analisa os dados do pipeline e cria um texto narrativo com visao geral, destaques, riscos e recomendacoes.
                </p>
              </div>
              <button
                onClick={generate}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Gerar Resumo
              </button>
            </div>
          )}

          {loading && !text && (
            <div className="flex items-center justify-center gap-3 py-12">
              <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
              <span className="text-sm text-gray-500">Gerando resumo executivo...</span>
            </div>
          )}

          {text && (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
              {loading && <span className="inline-block w-0.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-text-bottom" />}
            </div>
          )}
        </div>

        {/* Footer */}
        {(generated || loading) && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {generated && (
                <button
                  onClick={generate}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  Gerar novamente
                </button>
              )}
              {loading && (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition"
                >
                  <X className="w-3 h-3" />
                  Parar
                </button>
              )}
            </div>
            {generated && text && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition ${
                  copied
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar texto'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
