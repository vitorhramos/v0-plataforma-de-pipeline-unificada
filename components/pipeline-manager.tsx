'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, RotateCcw, Download, Upload } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuoteForBatch {
  id: number;
  cpo_id: string;
  quote_number: string;
  master_customer_name: string;
  quote_stage: string;
  quote_name: string;
  close_date: string;
  cif_value: number;
  probability_percentage: number;
  is_lost: boolean;
  lost_reason: string;
  is_budgetary: boolean;
  end_user_company: string;
  saved: boolean;
  changes: Map<string, { old: string | number; new: string | number }>;
}

const mockBatchData: QuoteForBatch[] = [
  {
    id: 1,
    cpo_id: 'CPO-2024-001',
    quote_number: 'QT-001',
    master_customer_name: 'Revenda ABC',
    quote_stage: '75%',
    quote_name: 'Enterprise Suite Q1',
    close_date: '2024-04-30',
    cif_value: 250000,
    probability_percentage: 75,
    is_lost: false,
    lost_reason: '',
    is_budgetary: false,
    end_user_company: 'XYZ Company',
    saved: false,
    changes: new Map(),
  },
  {
    id: 2,
    cpo_id: 'CPO-2024-002',
    quote_number: 'QT-002',
    master_customer_name: 'Revenda XYZ',
    quote_stage: '50%',
    quote_name: 'Server Bundle',
    close_date: '2024-05-15',
    cif_value: 180000,
    probability_percentage: 50,
    is_lost: false,
    lost_reason: '',
    is_budgetary: false,
    end_user_company: 'Tech Solutions',
    saved: false,
    changes: new Map(),
  },
  {
    id: 3,
    cpo_id: 'CPO-2024-003',
    quote_number: 'QT-003',
    master_customer_name: 'Revenda Global',
    quote_stage: '25%',
    quote_name: 'Laptop Fleet',
    close_date: '2024-06-01',
    cif_value: 95000,
    probability_percentage: 25,
    is_lost: false,
    lost_reason: '',
    is_budgetary: false,
    end_user_company: 'Industries Corp',
    saved: false,
    changes: new Map(),
  },
  {
    id: 4,
    cpo_id: 'CPO-2024-004',
    quote_number: 'QT-004',
    master_customer_name: 'Revenda Master',
    quote_stage: '75%',
    quote_name: 'Switch Infrastructure',
    close_date: '2024-04-15',
    cif_value: 320000,
    probability_percentage: 75,
    is_lost: false,
    lost_reason: '',
    is_budgetary: false,
    end_user_company: 'Networks Plus',
    saved: false,
    changes: new Map(),
  },
];

export function PipelineManager() {
  const [data, setData] = useState<QuoteForBatch[]>(mockBatchData);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStage, setBulkStage] = useState('');
  const [bulkCloseDate, setBulkCloseDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const selectedCount = selectedIds.size;
  const hasChanges = data.some((item) => item.changes.size > 0);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(data.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleApplyBulkChanges = () => {
    if (selectedCount === 0 || (!bulkStage && !bulkCloseDate)) {
      alert('Selecione itens e altere pelo menos um campo');
      return;
    }

    setData(
      data.map((item) => {
        if (selectedIds.has(item.id)) {
          const newItem = { ...item };
          if (bulkStage) {
            newItem.changes.set('quote_stage', { old: item.quote_stage, new: bulkStage });
            newItem.quote_stage = bulkStage;
            newItem.probability_percentage = parseInt(bulkStage);
          }
          if (bulkCloseDate) {
            newItem.changes.set('close_date', { old: item.close_date, new: bulkCloseDate });
            newItem.close_date = bulkCloseDate;
          }
          return newItem;
        }
        return item;
      }),
    );

    setBulkStage('');
    setBulkCloseDate('');
  };

  const handleSaveChanges = () => {
    setData(
      data.map((item) => ({
        ...item,
        saved: item.changes.size > 0,
        changes: new Map(),
      })),
    );
    alert('Alterações salvas com sucesso!');
  };

  const handleResetChanges = () => {
    setData(
      data.map((item) => ({
        ...item,
        changes: new Map(),
      })),
    );
  };

  const handleToggleLost = (id: number) => {
    setData(
      data.map((item) => {
        if (item.id === id) {
          const newItem = { ...item };
          newItem.is_lost = !newItem.is_lost;
          if (!newItem.is_lost) {
            newItem.lost_reason = '';
          }
          return newItem;
        }
        return item;
      }),
    );
  };

  const handleToggleBudgetary = (id: number) => {
    setData(
      data.map((item) => {
        if (item.id === id) {
          return { ...item, is_budgetary: !item.is_budgetary };
        }
        return item;
      }),
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      value,
    );
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-sm font-medium text-gray-700">
            {selectedCount} item(s) selecionado(s)
          </div>
          {selectedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs"
            >
              Limpar seleção
            </Button>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Quote Stage</label>
              <Select value={bulkStage} onValueChange={setBulkStage}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25%">25% (Pricing)</SelectItem>
                  <SelectItem value="50%">50% (Up Selling)</SelectItem>
                  <SelectItem value="75%">75% (Committed)</SelectItem>
                  <SelectItem value="70%">70%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Projected Close Date
              </label>
              <Input
                type="date"
                value={bulkCloseDate}
                onChange={(e) => setBulkCloseDate(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleApplyBulkChanges}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                Aplicar
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Save Controls */}
      {hasChanges && (
        <Card className="p-4 bg-amber-50 border-amber-200 flex gap-2">
          <Button
            onClick={handleSaveChanges}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
          <Button
            onClick={handleResetChanges}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Desfazer
          </Button>
        </Card>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCount === data.length && data.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-semibold">CPO ID</TableHead>
                <TableHead className="font-semibold">Quote #</TableHead>
                <TableHead className="font-semibold">Quote Name</TableHead>
                <TableHead className="font-semibold">Master Customer</TableHead>
                <TableHead className="font-semibold">End User</TableHead>
                <TableHead className="text-right font-semibold">CIF (USD)</TableHead>
                <TableHead className="font-semibold">Stage</TableHead>
                <TableHead className="font-semibold">Close Date</TableHead>
                <TableHead className="font-semibold text-center">Lost</TableHead>
                <TableHead className="font-semibold text-center">Budget</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow
                  key={item.id}
                  className={`border-b hover:bg-gray-50 ${selectedIds.has(item.id) ? 'bg-blue-100' : ''}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm font-semibold">{item.cpo_id}</TableCell>
                  <TableCell className="text-sm">{item.quote_number}</TableCell>
                  <TableCell className="text-sm">{item.quote_name}</TableCell>
                  <TableCell className="text-sm font-medium">{item.master_customer_name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{item.end_user_company}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(item.cif_value)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {item.quote_stage}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{item.close_date}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={item.is_lost}
                      onCheckedChange={() => handleToggleLost(item.id)}
                      className="mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={item.is_budgetary}
                      onCheckedChange={() => handleToggleBudgetary(item.id)}
                      className="mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    {item.saved ? (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Salvo
                      </span>
                    ) : item.changes.size > 0 ? (
                      <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                        Modificado
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
