'use client';

import { useState } from 'react';

interface FieldDef {
  key: string;
  label: string;
  style: 'normal' | 'readonly' | 'critical';
  type?: 'text' | 'select' | 'date' | 'number';
  options?: string[];
  placeholder?: string;
}

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Identificacao',
    fields: [
      { key: 'cpo_id', label: 'CPO ID', style: 'readonly', placeholder: 'CPO-1001' },
      { key: 'quote_number', label: 'Quote Number', style: 'critical', placeholder: 'QT-024001' },
      { key: 'part_number', label: 'Part Number', style: 'normal', placeholder: 'NX-10137' },
    ],
  },
  {
    title: 'Partes Envolvidas',
    fields: [
      { key: 'vendor', label: 'Vendor', style: 'normal', type: 'select', options: ['Cisco', 'HPE', 'Dell', 'Lenovo'] },
      { key: 'revenda', label: 'Revenda', style: 'normal', placeholder: 'Revenda A' },
      { key: 'end_user', label: 'End User', style: 'normal', placeholder: 'Cliente Ltda' },
    ],
  },
  {
    title: 'Oportunidade',
    fields: [
      { key: 'description', label: 'Description', style: 'normal', placeholder: 'Solucao Enterprise' },
      { key: 'stage', label: 'Stage', style: 'critical', type: 'select', options: ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'] },
      { key: 'probability', label: 'Probability %', style: 'normal', type: 'number', placeholder: '60' },
    ],
  },
  {
    title: 'Financeiro',
    fields: [
      { key: 'usd_value', label: 'USD Value', style: 'critical', type: 'number', placeholder: '450000' },
      { key: 'currency', label: 'Currency', style: 'readonly', placeholder: 'USD' },
      { key: 'budgetary', label: 'Budgetary', style: 'normal', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  {
    title: 'Datas e Localizacao',
    fields: [
      { key: 'cpo_date', label: 'CPO Date', style: 'normal', type: 'date' },
      { key: 'close_date', label: 'Close Date', style: 'critical', type: 'date' },
      { key: 'territory', label: 'Territory', style: 'normal', type: 'select', options: ['Sao Paulo', 'Rio de Janeiro', 'Minas Gerais'] },
    ],
  },
  {
    title: 'Classificacao',
    fields: [
      { key: 'bu', label: 'Business Unit', style: 'normal', type: 'select', options: ['BU Storage', 'BU Network', 'BU Compute'] },
      { key: 'team', label: 'Sales Team', style: 'normal', type: 'select', options: ['Team Alpha', 'Team Beta', 'Team Gamma'] },
      { key: 'quote_age', label: 'Quote Age (dias)', style: 'readonly', placeholder: '34' },
      { key: 'status', label: 'Status', style: 'normal', type: 'select', options: ['S', 'N', 'U'] },
    ],
  },
];

const INITIAL_VALUES: Record<string, string> = {
  cpo_id: 'CPO-1001', quote_number: 'QT-024001', part_number: 'NX-10137',
  vendor: 'Cisco', revenda: 'Revenda A', end_user: 'Cliente Ltda',
  description: 'Solucao Enterprise', stage: 'Committed 75%', probability: '75',
  usd_value: '450000', currency: 'USD', budgetary: 'Yes',
  cpo_date: '2024-11-01', close_date: '2025-07-22', territory: 'Sao Paulo',
  bu: 'BU Network', team: 'Team Alpha', quote_age: '34', status: 'S',
};

const STYLE_CONFIG = {
  readonly: {
    input: 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed',
    badge: 'bg-gray-100 text-gray-600 border border-gray-200',
    label: 'Somente leitura',
  },
  critical: {
    input: 'bg-amber-50 border-amber-300 text-gray-900 focus:ring-amber-400 focus:border-amber-400',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    label: 'Campo critico',
  },
  normal: {
    input: 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500',
    badge: '',
    label: '',
  },
};

function FieldInput({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  const cfg = STYLE_CONFIG[field.style];
  const base = `w-full px-3 py-2 rounded-md border text-sm transition focus:outline-none focus:ring-2 ${cfg.input}`;
  const isReadonly = field.style === 'readonly';

  if (field.type === 'select') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isReadonly}
        className={base}
      >
        {(field.options ?? []).map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <input
      type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={isReadonly}
      placeholder={field.placeholder}
      className={base}
    />
  );
}

export function BatchQuoteDetailsForm() {
  const [values, setValues] = useState<Record<string, string>>(INITIAL_VALUES);

  const set = (key: string, val: string) => setValues((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-1">
      {/* Legenda */}
      <div className="flex items-center gap-4 mb-4 text-xs font-medium text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-white border border-gray-300 inline-block" />
          Editavel
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300 inline-block" />
          Campo critico
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200 inline-block" />
          Somente leitura
        </span>
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <div key={section.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h4>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-gray-700">{field.label}</span>
                  {field.style === 'critical' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200 uppercase tracking-wide">
                      critico
                    </span>
                  )}
                  {field.style === 'readonly' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200 uppercase tracking-wide">
                      leitura
                    </span>
                  )}
                </label>
                <FieldInput
                  field={field}
                  value={values[field.key] ?? ''}
                  onChange={(v) => set(field.key, v)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { BatchQuoteDetailsForm as default };
