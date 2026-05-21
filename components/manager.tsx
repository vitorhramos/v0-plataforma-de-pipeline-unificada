'use client';

import { useState, useMemo } from 'react';
import GlobalNavigation from './global-navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getQuotes, getPrimaryQuotes } from '@/lib/mock-store';

const STAGE_COLORS: Record<string, string> = {
  'Pipelined':       'bg-blue-100 text-blue-800',
  'Pricing 25%':     'bg-amber-100 text-amber-800',
  'Up Selling 50%':  'bg-violet-100 text-violet-800',
  'Committed 75%':   'bg-emerald-100 text-emerald-800',
  'Net Lost':        'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<string, string> = {
  'SALESORDER': 'bg-emerald-100 text-emerald-800',
  'QUOTEPO':    'bg-blue-100 text-blue-700',
  'CANCELLED':  'bg-red-100 text-red-700',
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

const STAGES = ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'];

export default function Manager() {
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  const [selected, setSelected] = useState<number[]>([]);
  const [filterStage, setFilterStage] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterProdType, setFilterProdType] = useState('');

  const allQuotes = useMemo(() => getQuotes(), []);
  const primaryQuotes = useMemo(() => getPrimaryQuotes(allQuotes), [allQuotes]);

  const vendors = useMemo(() => [...new Set(primaryQuotes.map(q => q.vendor))].sort(), [primaryQuotes]);
  const prodTypes = useMemo(() => [...new Set(primaryQuotes.map(q => q.prod_type).filter(Boolean))].sort() as string[], [primaryQuotes]);

  const filtered = useMemo(() => primaryQuotes.filter(q => {
    if (filterStage && q.stage !== filterStage) return false;
    if (filterVendor && q.vendor !== filterVendor) return false;
    if (filterProdType && q.prod_type !== filterProdType) return false;
    return true;
  }), [primaryQuotes, filterStage, filterVendor, filterProdType]);

  // Chart data
  const stageChartData = useMemo(() => STAGES.map(s => ({
    name: s,
    valor: filtered.filter(q => q.stage === s).reduce((a, q) => a + q.usd_value, 0),
    quantidade: filtered.filter(q => q.stage === s).length,
  })), [filtered]);

  const vendorChartData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(q => map.set(q.vendor, (map.get(q.vendor) ?? 0) + q.usd_value));
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  const prodTypeData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(q => {
      const key = q.prod_type ?? 'Outros';
      map.set(key, (map.get(key) ?? 0) + q.usd_value);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const renewData = useMemo(() => [
    { name: 'Renew', value: filtered.filter(q => q.renew === 'Yes').length },
    { name: 'New Business', value: filtered.filter(q => q.renew !== 'Yes').length },
  ], [filtered]);

  const totalCif = filtered.reduce((s, q) => s + q.usd_value, 0);
  const totalNet = filtered.reduce((s, q) => s + (q.net_value ?? 0), 0);
  const totalFob = filtered.reduce((s, q) => s + (q.fob_value ?? 0), 0);
  const avgGm = filtered.length ? filtered.reduce((s, q) => s + (q.gm_pct ?? 0), 0) / filtered.length : 0;

  const fmtMoney = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
  const fmtDate = (d?: string) => d ? d.split('-').reverse().join('/') : '—';

  const toggleSelect = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(q => q.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Visao gerencial com graficos e tabela completa dos {filtered.length} quotes primarios</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
              <Button
                onClick={() => setViewMode('charts')}
                className={`px-4 py-1.5 text-xs rounded-md font-medium transition ${viewMode === 'charts' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
              >
                Graficos
              </Button>
              <Button
                onClick={() => setViewMode('table')}
                className={`px-4 py-1.5 text-xs rounded-md font-medium transition ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
              >
                Tabela
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterVendor}
            onChange={e => setFilterVendor(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Vendors</option>
            {vendors.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select
            value={filterProdType}
            onChange={e => setFilterProdType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Prod Types</option>
            {prodTypes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {(filterStage || filterVendor || filterProdType) && (
            <button
              onClick={() => { setFilterStage(''); setFilterVendor(''); setFilterProdType(''); }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* KPI summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total CIF', value: fmtMoney(totalCif), color: 'border-l-emerald-500' },
            { label: 'Total NET', value: fmtMoney(totalNet), color: 'border-l-blue-500' },
            { label: 'Total FOB', value: fmtMoney(totalFob), color: 'border-l-violet-500' },
            { label: 'GM Medio', value: `${avgGm.toFixed(1)}%`, color: `border-l-${avgGm >= 15 ? 'emerald' : avgGm >= 8 ? 'amber' : 'red'}-500` },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${kpi.color} px-4 py-3`}>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{kpi.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{filtered.length} quotes</p>
            </div>
          ))}
        </div>

        {viewMode === 'charts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Stage Distribution */}
            <Card className="p-5 bg-white">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Stage Distribution</h3>
              <p className="text-[11px] text-gray-400 mb-4">Valor CIF por estagio</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stageChartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" angle={-20} height={55} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `$${(v/1_000_000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(value, name) => name === 'valor'
                      ? [`$${(Number(value)/1_000_000).toFixed(1)}M`, 'CIF']
                      : [value, 'Quotes']}
                    labelFormatter={l => `Stage: ${l}`}
                  />
                  <Bar dataKey="valor" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Vendors */}
            <Card className="p-5 bg-white">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Top Vendors</h3>
              <p className="text-[11px] text-gray-400 mb-4">Valor CIF por fabricante</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={vendorChartData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `$${(v/1_000_000).toFixed(0)}M`} />
                  <YAxis dataKey="name" type="category" width={65} tick={{ fontSize: 10, fill: '#374151' }} />
                  <Tooltip formatter={v => [`$${(Number(v)/1_000_000).toFixed(1)}M`, 'CIF']} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Prod Type */}
            <Card className="p-5 bg-white">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Prod Type</h3>
              <p className="text-[11px] text-gray-400 mb-4">Distribuicao por tipo de produto</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={prodTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={45}>
                    {prodTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `$${(Number(v)/1_000_000).toFixed(1)}M`} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Renew vs New Business */}
            <Card className="p-5 bg-white">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Renew vs New Business</h3>
              <p className="text-[11px] text-gray-400 mb-4">Proporcao de renovacoes no pipeline</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={renewData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={45}>
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        ) : (
          <Card className="bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500">{selected.length > 0 ? `${selected.length} selecionados` : `${filtered.length} quotes`}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: '2200px' }}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 w-8">
                      <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
                    </th>
                    {[
                      'CPO ID', 'CPO Status', 'VPC Code', 'Part No', 'Part Desc', 'Sales Terr', 'Team',
                      'Vendor', 'Master Customer', 'Bill To', 'End User',
                      'CIF', 'NET', 'FOB', 'GM %', 'CPO QTY',
                      'Stage', 'Prob', 'Lost',
                      'Created', 'Close',
                      'CPO No', 'CPO Pay', 'Pay Name',
                      'Opportunity', 'Prod Type', 'Renew', 'Budgetary', 'Eng. Ticket',
                    ].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide text-[10px] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(q => {
                    const gm = q.gm_pct ?? 0;
                    return (
                      <tr
                        key={q.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition ${selected.includes(q.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-3 py-2.5">
                          <input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggleSelect(q.id)} className="rounded" />
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold text-blue-600 whitespace-nowrap text-[11px]">{q.cpo_id}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[q.status] ?? 'bg-gray-100 text-gray-600'}`}>{q.status}</span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-gray-500 whitespace-nowrap text-[11px]">{q.vpc_code ?? '—'}</td>
                        <td className="px-3 py-2.5 font-mono text-gray-700 whitespace-nowrap text-[11px]">{q.part_no}</td>
                        <td className="px-3 py-2.5 max-w-[120px]"><span className="block truncate text-gray-700" title={q.description}>{q.description}</span></td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{q.sales_territory}</td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{q.team}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{q.vendor}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{q.master_customer}</td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{q.bill_to ?? '—'}</td>
                        <td className="px-3 py-2.5 max-w-[110px]"><span className="block truncate text-gray-700" title={q.end_user}>{q.end_user}</span></td>
                        <td className="px-3 py-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">{fmtMoney(q.usd_value)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-blue-700 whitespace-nowrap">{fmtMoney(q.net_value ?? 0)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-violet-700 whitespace-nowrap">{fmtMoney(q.fob_value ?? 0)}</td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <span className={`font-bold ${gm >= 15 ? 'text-emerald-700' : gm >= 8 ? 'text-amber-600' : 'text-red-600'}`}>{gm.toFixed(1)}%</span>
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-700 whitespace-nowrap">{q.cpo_qty ?? '—'}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STAGE_COLORS[q.stage] ?? 'bg-gray-100 text-gray-700'}`}>{q.stage}</span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${q.probability >= 75 ? 'bg-emerald-500' : q.probability >= 50 ? 'bg-amber-400' : q.probability >= 25 ? 'bg-blue-400' : 'bg-red-400'}`} style={{ width: `${q.probability}%` }} />
                            </div>
                            <span className="font-bold text-gray-800 text-[11px]">{q.probability}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {q.lost_reason
                            ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">{q.lost_reason}</span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-[11px]">{fmtDate(q.created_date)}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap text-[11px]">{fmtDate(q.close_date)}</td>
                        <td className="px-3 py-2.5 font-mono text-gray-500 whitespace-nowrap text-[11px]">{q.cpo_no ?? '—'}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">{q.cpo_pay_meth ?? '—'}</span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{q.pay_meth_name ?? '—'}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{q.quote_name}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">{q.prod_type ?? '—'}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          {q.renew === 'Yes'
                            ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Yes</span>
                            : <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">No</span>}
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${q.budgetary === 'Yes' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>{q.budgetary}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          {q.is_engineering_ticket === 'Yes'
                            ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">Yes</span>
                            : <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">No</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
