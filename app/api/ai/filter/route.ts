import { generateText, gateway } from 'ai';

export const runtime = 'nodejs';

const FILTER_SCHEMA = `
Campos disponiveis para filtrar:
- stage: "Not Classified" | "Pricing 25%" | "Up Selling 50%" | "Committed 75%" | "Net Lost" | "Pipelined"
- vendor: string (nome do vendor, ex: "HPE", "Cisco", "Dell")
- territory: string (ex: "Sao Paulo", "Brazil Central", "South America")
- team: string (ex: "Team Alpha", "Team Beta")
- cif_min: number (valor minimo CIF em USD)
- cif_max: number (valor maximo CIF em USD)
- prob_min: number (probabilidade minima 0-100)
- prob_max: number (probabilidade maxima 0-100)
- renew: "Yes" | "No"
- eng_ticket: "Yes" | "No"
- close_date_from: "YYYY-MM-DD"
- close_date_to: "YYYY-MM-DD"
- search: string (busca livre em CPO ID, nome, part no)
`;

export async function POST(req: Request) {
  const { query } = await req.json();

  if (!query?.trim()) {
    return Response.json({ filters: {}, interpreted: '' });
  }

  const { text } = await generateText({
    model: gateway('openai/gpt-4o-mini'),
    system: `Voce converte perguntas em portugues em filtros JSON para um pipeline de vendas B2B.
Responda APENAS com JSON valido, sem markdown, sem explicacoes.
Inclua apenas os campos relevantes para o que foi pedido.
Inclua tambem um campo "interpreted" com uma frase descrevendo o que entendeu.

${FILTER_SCHEMA}

Formato:
{
  "interpreted": "Descricao do que foi interpretado",
  "filters": {
    // apenas campos relevantes aqui
  }
}`,
    prompt: `Converta esta busca em filtros: "${query}"`,
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);
    return Response.json(result);
  } catch {
    return Response.json({ filters: {}, interpreted: query, error: 'Erro ao interpretar filtro' }, { status: 500 });
  }
}
