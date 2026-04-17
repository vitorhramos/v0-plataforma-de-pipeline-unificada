'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, RotateCcw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface QuoteDetail {
  id: number;
  cpo_id: string;
  quote_number: string;
  master_customer_name: string;
  sales_territory: string;
  vendor_name: string;
  end_user_company: string;
  cif_value: number;
  net_value: number;
  margin_percentage: number;
  quote_stage: string;
  probability_percentage: number;
  created_date: string;
  close_date: string;
  part_number: string;
  product_type: string;
  is_lost: boolean;
  po_comments: string;
}

const mockDetailsData: QuoteDetail[] = [
  {
    id: 1,
    cpo_id: 'CPO-2024-001',
    quote_number: 'QT-001',
    master_customer_name: 'Revenda ABC',
    sales_territory: 'São Paulo',
    vendor_name: 'Dell',
    end_user_company: 'XYZ Company',
    cif_value: 250000,
    net_value: 180000,
    margin_percentage: 25.5,
    quote_stage: '75%',
    probability_percentage: 75,
    created_date: '2024-01-15',
    close_date: '2024-04-30',
    part_number: 'DELL-PN-123',
    product_type: 'HW',
    is_lost: false,
    po_comments: 'Cliente importante',
  },
  {
    id: 2,
    cpo_id: 'CPO-2024-002',
    quote_number: 'QT-002',
    master_customer_name: 'Revenda XYZ',
    sales_territory: 'Rio de Janeiro',
    vendor_name: 'HP',
    end_user_company: 'Tech Solutions',
    cif_value: 180000,
    net_value: 140000,
    margin_percentage: 22.0,
    quote_stage: '50%',
    probability_percentage: 50,
    created_date: '2024-01-20',
    close_date: '2024-05-15',
    part_number: 'HP-PN-456',
    product_type: 'HW',
    is_lost: false,
    po_comments: '',
  },
  {
    id: 3,
    cpo_id: 'CPO-2024-003',
    quote_number: 'QT-003',
    master_customer_name: 'Revenda Global',
    sales_territory: 'Brasília',
    vendor_name: 'Lenovo',
    end_user_company: 'Industries Corp',
    cif_value: 95000,
    net_value: 75000,
    margin_percentage: 18.75,
    quote_stage: '25%',
    probability_percentage: 25,
    created_date: '2024-01-25',
    close_date: '2024-06-01',
    part_number: 'LENOVO-PN-789',
    product_type: 'HW',
    is_lost: false,
    po_comments: 'Sujeito a aprovação',
  },
  {
    id: 4,
    cpo_id: 'CPO-2024-004',
    quote_number: 'QT-004',
    master_customer_name: 'Revenda Master',
    sales_territory: 'São Paulo',
    vendor_name: 'Cisco',
    end_user_company: 'Networks Plus',
    cif_value: 320000,
    net_value: 250000,
    margin_percentage: 28.0,
    quote_stage: '75%',
    probability_percentage: 75,
    created_date: '2024-02-01',
    close_date: '2024-04-15',
    part_number: 'CISCO-PN-321',
    product_type: 'HW',
    is_lost: false,
    po_comments: 'Urgente',
  },
  {
    id: 5,
    cpo_id: 'CPO-2024-005',
    quote_number: 'QT-005',
    master_customer_name: 'Revenda Tech',
    sales_territory: 'Minas Gerais',
    vendor_name: 'EMC',
    end_user_company: 'Data Centers Ltd',
    cif_value: 450000,
    net_value: 350000,
    margin_percentage: 26.5,
    quote_stage: '50%',
    probability_percentage: 50,
    created_date: '2024-02-05',
    close_date: '2024-05-20',
    part_number: 'EMC-PN-654',
    product_type: 'HW',
    is_lost: false,
    po_comments: '',
  },
];

export function PipelineDetailsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof QuoteDetail>('cpo_id');

  const filteredData = useMemo(() => {
    return mockDetailsData.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.cpo_id.toLowerCase().includes(searchLower) ||
        item.master_customer_name.toLowerCase().includes(searchLower) ||
        item.vendor_name.toLowerCase().includes(searchLower) ||
        item.end_user_company.toLowerCase().includes(searchLower) ||
        item.quote_number.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === 'string') {
        return (aVal as string).localeCompare(bVal as string);
      }
      return Number(aVal) - Number(bVal);
    });
  }, [filteredData, sortBy]);

  const handleExport = () => {
    const csv = [
      [
        'CPO ID',
        'Quote #',
        'Master Customer',
        'Sales Territory',
        'Vendor',
        'End User',
        'CIF (USD)',
        'NET (USD)',
        'Margin %',
        'Stage',
        'Probability %',
        'Created Date',
        'Close Date',
        'Part Number',
        'Product Type',
        'Comments',
      ],
      ...sortedData.map((item) => [
        item.cpo_id,
        item.quote_number,
        item.master_customer_name,
        item.sales_territory,
        item.vendor_name,
        item.end_user_company,
        item.cif_value.toFixed(2),
        item.net_value.toFixed(2),
        item.margin_percentage.toFixed(2),
        item.quote_stage,
        item.probability_percentage,
        item.created_date,
        item.close_date,
        item.part_number,
        item.product_type,
        item.po_comments,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-details-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      value,
    );
  };

  const getStageColor = (stage: string) => {
    if (stage.includes('75')) return 'bg-green-50 text-green-700';
    if (stage.includes('50')) return 'bg-blue-50 text-blue-700';
    if (stage.includes('25')) return 'bg-amber-50 text-amber-700';
    return 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="space-y-4">
      {/* Search and Export */}
      <Card className="p-4">
        <div className="flex gap-4 flex-col md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 block mb-2">Buscar Cotações</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="CPO ID, Revenda, Fabricante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSortBy('cpo_id');
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar
            </Button>
            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-semibold">{sortedData.length}</span> de{' '}
        <span className="font-semibold">{mockDetailsData.length}</span> cotações
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b">
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 font-semibold"
                  onClick={() => setSortBy('cpo_id')}
                >
                  CPO ID
                </TableHead>
                <TableHead className="font-semibold">Quote #</TableHead>
                <TableHead className="font-semibold">Master Customer</TableHead>
                <TableHead className="font-semibold">Sales Territory</TableHead>
                <TableHead className="font-semibold">Vendor</TableHead>
                <TableHead className="font-semibold">End User</TableHead>
                <TableHead className="text-right font-semibold">CIF (USD)</TableHead>
                <TableHead className="text-right font-semibold">NET (USD)</TableHead>
                <TableHead className="text-right font-semibold">Margin %</TableHead>
                <TableHead className="font-semibold">Stage</TableHead>
                <TableHead className="font-semibold">Close Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50 border-b">
                  <TableCell className="font-mono text-sm text-blue-600">{item.cpo_id}</TableCell>
                  <TableCell className="text-sm">{item.quote_number}</TableCell>
                  <TableCell className="text-sm font-medium">{item.master_customer_name}</TableCell>
                  <TableCell className="text-sm">{item.sales_territory}</TableCell>
                  <TableCell className="text-sm">{item.vendor_name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{item.end_user_company}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCurrency(item.cif_value)}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCurrency(item.net_value)}</TableCell>
                  <TableCell className="text-right text-sm">{item.margin_percentage.toFixed(2)}%</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStageColor(item.quote_stage)}`}>
                      {item.quote_stage}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{item.close_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
