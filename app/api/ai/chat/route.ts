import { streamText } from 'ai';
import { buildPipelineContext, contextToPrompt } from '@/lib/ai-context';
import { getQuotes } from '@/lib/mock-store';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, pipelineContext } = await req.json();

  const quotes = getQuotes();
  const ctx = pipelineContext ?? buildPipelineContext(quotes);
  const contextString = contextToPrompt(ctx);

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: `Voce e um assistente especializado em vendas B2B e gestao de pipeline. 
Responda sempre em portugues brasileiro de forma concisa e direta.
Use os dados abaixo para responder perguntas sobre o pipeline atual.
Quando citar valores, use o formato USD (ex: $1.2M, $500K).
Quando nao souber, diga claramente.

${contextString}`,
    messages,
  });

  return result.toTextStreamResponse();
}
