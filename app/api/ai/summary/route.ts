import { streamText, gateway } from 'ai';
import { buildPipelineContext, contextToPrompt } from '@/lib/ai-context';
import { getQuotes } from '@/lib/mock-store';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { pipelineContext } = await req.json().catch(() => ({}));

  const quotes = getQuotes();
  const ctx = pipelineContext ?? buildPipelineContext(quotes);
  const contextString = contextToPrompt(ctx);

  const result = streamText({
    model: gateway('openai/gpt-4o'),
    system: `Voce e um analista de vendas senior que prepara resumos executivos para diretores.
Escreva em portugues brasileiro, tom profissional e direto.
Use paragrafos curtos. Nao use bullet points.`,
    prompt: `Com base nos dados abaixo, escreva um resumo executivo do pipeline atual com as seguintes secoes:
1. Visao Geral (2-3 frases resumindo o estado atual)
2. Destaques Positivos (2-3 pontos fortes)
3. Riscos e Alertas (2-3 pontos de atencao)
4. Recomendacoes (2-3 acoes sugeridas para a equipe)

Dados do pipeline:
${contextString}`,
  });

  return result.toTextStreamResponse();
}
