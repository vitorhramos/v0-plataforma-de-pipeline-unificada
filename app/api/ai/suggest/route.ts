import { generateText, gateway } from 'ai';
import { buildPipelineContext, contextToPrompt } from '@/lib/ai-context';
import { getQuotes } from '@/lib/mock-store';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { quote } = await req.json();

  const quotes = getQuotes();
  const ctx = buildPipelineContext(quotes);
  const contextString = contextToPrompt(ctx);

  const dealInfo = `
Deal atual:
- CPO ID: ${quote.cpo_id ?? 'N/A'}
- Vendor: ${quote.vendor_name ?? 'N/A'}
- Territorio: ${quote.sales_territory ?? 'N/A'}
- Team: ${quote.team ?? 'N/A'}
- Valor CIF: $${(quote.cif_value_usd ?? 0).toLocaleString('en-US')}
- Stage atual: ${quote.quote_stage ?? 'N/A'}
- Close Date atual: ${quote.projected_close_date ?? 'N/A'}
- Criado em: ${quote.cpo_entry_datetime ?? quote.created_at ?? 'N/A'}
- Notas: ${quote.notes ?? 'N/A'}
`;

  const { text } = await generateText({
    model: gateway('openai/gpt-4o-mini'),
    system: `Voce e um analista de vendas experiente em pipeline B2B.
Com base nos dados do pipeline e no deal especifico, sugira o Stage mais adequado e uma Close Date realista.
Responda APENAS com JSON valido, sem markdown.

Formato:
{
  "suggested_stage": "Pricing 25%" | "Up Selling 50%" | "Committed 75%" | "Not Classified",
  "suggested_close_date": "YYYY-MM-DD",
  "stage_reasoning": "max 15 palavras explicando o stage sugerido",
  "date_reasoning": "max 15 palavras explicando a data sugerida",
  "confidence": "high" | "medium" | "low"
}`,
    prompt: `${contextString}\n\n${dealInfo}\n\nSugira Stage e Close Date para este deal.`,
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const suggestion = JSON.parse(cleaned);
    return Response.json({ suggestion });
  } catch {
    return Response.json({ suggestion: null, error: 'Erro ao gerar sugestao' }, { status: 500 });
  }
}
