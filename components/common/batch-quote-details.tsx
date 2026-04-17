'use client';

import { Card } from '@/components/ui/card';

interface FieldProps {
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  tooltip?: string;
  style?: 'normal' | 'gray' | 'yellow';
}

export function EditableField({ label, value, editable, onChange, tooltip, style = 'normal' }: FieldProps) {
  const bgClasses = {
    normal: 'bg-white',
    gray: 'bg-gray-100',
    yellow: 'bg-yellow-50',
  };

  return (
    <div title={tooltip}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {editable ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${bgClasses[style]}`}
        />
      ) : (
        <div className={`px-2 py-1 rounded text-sm ${bgClasses[style]} border border-gray-300`}>
          {value}
        </div>
      )}
    </div>
  );
}

export function BatchQuoteDetailsForm() {
  const fields = [
    { key: 'cpo_id', label: 'CPO ID', style: 'gray' as const },
    { key: 'quote_number', label: 'Quote Number', style: 'yellow' as const },
    { key: 'part_number', label: 'Part Number', style: 'normal' as const },
    { key: 'vendor', label: 'Vendor', style: 'normal' as const },
    { key: 'revenda', label: 'Revenda', style: 'normal' as const },
    { key: 'end_user', label: 'End User', style: 'normal' as const },
    { key: 'description', label: 'Description', style: 'normal' as const },
    { key: 'stage', label: 'Stage', style: 'normal' as const },
    { key: 'probability', label: 'Probability %', style: 'normal' as const },
    { key: 'usd_value', label: 'USD Value', style: 'normal' as const },
    { key: 'currency', label: 'Currency', style: 'gray' as const },
    { key: 'budgetary', label: 'Budgetary', style: 'normal' as const },
    { key: 'cpo_date', label: 'CPO Date', style: 'normal' as const },
    { key: 'close_date', label: 'Close Date', style: 'normal' as const },
    { key: 'territory', label: 'Territory', style: 'normal' as const },
    { key: 'bu', label: 'Business Unit', style: 'normal' as const },
    { key: 'team', label: 'Sales Team', style: 'normal' as const },
    { key: 'quote_age', label: 'Quote Age (days)', style: 'gray' as const },
    { key: 'status', label: 'Status (S/N/U)', style: 'normal' as const },
  ];

  return (
    <Card className="p-6 bg-white">
      <h3 className="text-lg font-bold text-gray-900 mb-6">19 Campos de Batch Quote Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map(field => (
          <EditableField
            key={field.key}
            label={field.label}
            value={`Sample ${field.label}`}
            editable={field.style !== 'gray'}
            style={field.style}
            tooltip={field.style === 'gray' ? 'Campo somente leitura' : field.style === 'yellow' ? 'Campo crítico' : undefined}
          />
        ))}
      </div>
    </Card>
  );
}
