// BI Pipeline Quote Types
export interface Quote {
  id: number;
  cpo_id: string;
  quote_number: string;
  part_no: string;
  sales_territory: string;
  team: string;
  vendor_name: string;
  master_customer_name: string;
  cpo_customer: string;
  end_user_company: string;
  quote_stage: 'Pipelined' | 'Pricing 25%' | 'Up Selling 50%' | 'Committed 75%' | 'Net Lost';
  quote_name: string;
  cif_value_usd: number;
  probability_percentage: number;
  projected_close_date: string;
  cpo_entry_datetime: string;
  available_credit: number;
  available_credit_usd: number;
  is_budgetary: boolean;
  is_lost: boolean;
  lost_reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BatchFilter {
  quote_number?: string;
  quote_stage?: string;
  vendor_name?: string;
  master_customer?: string;
  probability_min?: number;
  probability_max?: number;
  date_from?: string;
  date_to?: string;
  close_date_from?: string;
  close_date_to?: string;
  sales_territory?: string;
  team?: string;
  is_budgetary?: boolean;
}

export interface BatchOperation {
  id: string;
  timestamp: string;
  user: string;
  operation_type: 'update' | 'upload' | 'export';
  quotes_affected: number;
  status: 'pending' | 'completed' | 'failed';
  details: string;
}

export interface DashboardKPI {
  label: string;
  value: number;
  format: 'currency' | 'count' | 'percentage';
  trend?: number;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
  count?: number;
  [key: string]: any;
}
