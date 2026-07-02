import { generateText, gateway } from 'ai';
import { buildPipelineContext, contextToPrompt } from '@/lib/ai-context';
import { getQuotes } from '@/lib/mock-store';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { pipelineContext } = await req.json().catch(() => ({}));

  const quotes = getQuotes();
  const ctx = pipelineContext ?? buildPipelineContext(quotes);
  const contextString = contextToPrompt(ctx);

  const { text } = await generateText({
    model: gateway('openai/gpt-4o-mini'),
    system: `Voce e um analista de vendas especializado em pipeline B2B.
Analise os dados do pipeline e retorne exatamente 5 insights acionaveis em JSON.
Responda APENAS com JSON valido, sem markdown, sem explicacoes adicionais.

Formato esperado:
[
  {
    "type": "warning" | "success" | "info" | "danger",
    "title": "Titulo curto (max 8 palavras)",
    "description": "Descricao acionavel (max 20 palavras)",
    "metric": "valor ou percentual relevante (opcional)"
  }
]`,
    prompt: `Analise este pipeline e gere 5 insights:\n\n${contextString}`,
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const insights = JSON.parse(cleaned);
    return Response.json({ insights });
  } catch {
    return Response.json({ insights: [], error: 'Erro ao processar insights' }, { status: 500 });
  }
}
