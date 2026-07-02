import { Quote } from '@/lib/mock-store';

export interface PipelineContext {
  total_quotes: number;
  total_cif_usd: number;
  total_net_usd: number;
  by_stage: { stage: string; count: number; cif_usd: number }[];
  by_vendor: { vendor: string; count: number; cif_usd: number }[];
  by_territory: { territory: string; count: number; cif_usd: number }[];
  by_team: { team: string; count: number; cif_usd: number }[];
  at_risk: { cpo_id: string; stage: string; days_old: number; cif_usd: number; vendor: string }[];
  stale_30d: number;
  net_lost_count: number;
  net_lost_value: number;
  high_prob_count: number;
  high_prob_value: number;
}

export function buildPipelineContext(quotes: Quote[]): PipelineContext {
  const now = Date.now();
  const MS = 86_400_000;

  const active = quotes.filter(q => q.stage !== 'Net Lost');

  const total_cif_usd = active.reduce((s, q) => s + (q.usd_value ?? 0), 0);
  const total_net_usd = active.reduce((s, q) => s + (q.net_value ?? 0), 0);

  // By stage
  const stageMap = new Map<string, { count: number; cif: number }>();
  for (const q of quotes) {
    const s = q.stage ?? 'Unknown';
    const prev = stageMap.get(s) ?? { count: 0, cif: 0 };
    stageMap.set(s, { count: prev.count + 1, cif: prev.cif + (q.usd_value ?? 0) });
  }
  const by_stage = [...stageMap.entries()]
    .map(([stage, v]) => ({ stage, count: v.count, cif_usd: v.cif }))
    .sort((a, b) => b.cif_usd - a.cif_usd);

  // By vendor
  const vendorMap = new Map<string, { count: number; cif: number }>();
  for (const q of active) {
    const v = q.vendor ?? 'Unknown';
    const prev = vendorMap.get(v) ?? { count: 0, cif: 0 };
    vendorMap.set(v, { count: prev.count + 1, cif: prev.cif + (q.usd_value ?? 0) });
  }
  const by_vendor = [...vendorMap.entries()]
    .map(([vendor, v]) => ({ vendor, count: v.count, cif_usd: v.cif }))
    .sort((a, b) => b.cif_usd - a.cif_usd)
    .slice(0, 8);

  // By territory
  const terrMap = new Map<string, { count: number; cif: number }>();
  for (const q of active) {
    const t = q.sales_territory ?? 'Unknown';
    const prev = terrMap.get(t) ?? { count: 0, cif: 0 };
    terrMap.set(t, { count: prev.count + 1, cif: prev.cif + (q.usd_value ?? 0) });
  }
  const by_territory = [...terrMap.entries()]
    .map(([territory, v]) => ({ territory, count: v.count, cif_usd: v.cif }))
    .sort((a, b) => b.cif_usd - a.cif_usd);

  // By team
  const teamMap = new Map<string, { count: number; cif: number }>();
  for (const q of active) {
    const t = q.team ?? 'Unknown';
    const prev = teamMap.get(t) ?? { count: 0, cif: 0 };
    teamMap.set(t, { count: prev.count + 1, cif: prev.cif + (q.usd_value ?? 0) });
  }
  const by_team = [...teamMap.entries()]
    .map(([team, v]) => ({ team, count: v.count, cif_usd: v.cif }))
    .sort((a, b) => b.cif_usd - a.cif_usd);

  // At risk: low stage + close date in 45 days
  const at_risk = active
    .filter(q => {
      const isLow = q.stage === 'Pricing 25%' || q.stage === 'Not Classified';
      const closeDate = q.close_date ? new Date(q.close_date).getTime() : null;
      const daysToClose = closeDate ? (closeDate - now) / MS : null;
      return isLow && daysToClose !== null && daysToClose <= 45 && daysToClose >= 0;
    })
    .map(q => ({
      cpo_id: q.cpo_id,
      stage: q.stage,
      days_old: q.quote_age ?? 0,
      cif_usd: q.usd_value ?? 0,
      vendor: q.vendor ?? '',
    }))
    .slice(0, 10);

  // Stale 30+ days
  const stale_30d = active.filter(q => (q.quote_age ?? 0) > 30).length;

  // Net lost
  const lost = quotes.filter(q => q.stage === 'Net Lost');
  const net_lost_count = lost.length;
  const net_lost_value = lost.reduce((s, q) => s + (q.usd_value ?? 0), 0);

  // High probability
  const highProb = active.filter(q => (q.probability ?? 0) >= 75);
  const high_prob_count = highProb.length;
  const high_prob_value = highProb.reduce((s, q) => s + (q.usd_value ?? 0), 0);

  return {
    total_quotes: quotes.length,
    total_cif_usd,
    total_net_usd,
    by_stage,
    by_vendor,
    by_territory,
    by_team,
    at_risk,
    stale_30d,
    net_lost_count,
    net_lost_value,
    high_prob_count,
    high_prob_value,
  };
}

export function contextToPrompt(ctx: PipelineContext): string {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n.toFixed(0)}`;

  return `PIPELINE ATUAL:
Total: ${ctx.total_quotes} deals | CIF: ${fmt(ctx.total_cif_usd)} | NET: ${fmt(ctx.total_net_usd)}
Alta Prob (75%+): ${ctx.high_prob_count} deals (${fmt(ctx.high_prob_value)})
Net Lost: ${ctx.net_lost_count} deals (${fmt(ctx.net_lost_value)})
Sem atualizacao 30+ dias: ${ctx.stale_30d}

Por Stage:
${ctx.by_stage.map(s => `  ${s.stage}: ${s.count} deals (${fmt(s.cif_usd)})`).join('\n')}

Por Vendor (top 8):
${ctx.by_vendor.map(v => `  ${v.vendor}: ${v.count} deals (${fmt(v.cif_usd)})`).join('\n')}

Por Territorio:
${ctx.by_territory.map(t => `  ${t.territory}: ${t.count} deals (${fmt(t.cif_usd)})`).join('\n')}

Por Time:
${ctx.by_team.map(t => `  ${t.team}: ${t.count} deals (${fmt(t.cif_usd)})`).join('\n')}

Deals em Risco (stage baixo + close em 45 dias):
${ctx.at_risk.length ? ctx.at_risk.map(r => `  ${r.cpo_id} | ${r.stage} | ${r.vendor} | ${fmt(r.cif_usd)} | ${r.days_old}d`).join('\n') : '  Nenhum'}`;
}
