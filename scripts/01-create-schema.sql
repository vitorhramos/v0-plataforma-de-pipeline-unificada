-- TD SYNNEX Unified Pipeline Platform (UPP) - Database Schema
-- Complete implementation based on BI Pipeline v2 and Sales Pipeline Batch v2

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  cpo_id VARCHAR(50) UNIQUE NOT NULL,
  part_number VARCHAR(100),
  sales_terr VARCHAR(50),
  team VARCHAR(100),
  vendor VARCHAR(100),
  master_customer VARCHAR(100),
  customer VARCHAR(100),
  end_user VARCHAR(100),
  cif DECIMAL(15, 2),
  net DECIMAL(15, 2),
  fob DECIMAL(15, 2),
  gm DECIMAL(5, 2),
  probability_stage VARCHAR(10), -- 25, 50, 75
  lost BOOLEAN DEFAULT FALSE,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  close_date DATE,
  cpo_no VARCHAR(100),
  payment_method_code VARCHAR(20),
  payment_method_name VARCHAR(100),
  opportunity_name VARCHAR(255),
  product_type VARCHAR(20), -- HW/SVC
  vpc_code VARCHAR(50),
  renew BOOLEAN,
  po_comments TEXT,
  budgetary BOOLEAN DEFAULT FALSE,
  lost_reason VARCHAR(100),
  lost_other TEXT,
  bu_sales VARCHAR(100),
  vpc_category VARCHAR(100),
  status_quote VARCHAR(20),
  renewal_flag BOOLEAN,
  item_type VARCHAR(50),
  lost_type VARCHAR(50),
  deal_id VARCHAR(50),
  eu_company_name VARCHAR(255),
  expire_group VARCHAR(50),
  cpo_entry_datetime TIMESTAMP,
  projected_close_date DATE,
  quote_number VARCHAR(50),
  cpo_cust_number VARCHAR(50),
  cpo_cust_name VARCHAR(255),
  quote_net_sales DECIMAL(15, 2),
  avail_cred DECIMAL(15, 2),
  avail_cred_usd DECIMAL(15, 2),
  probability_percent INT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(100),
  user_profile VARCHAR(50) -- vendedor, gerente, operacoes, executivo, admin
);

CREATE TABLE IF NOT EXISTS batch_operations (
  id SERIAL PRIMARY KEY,
  operation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_profile VARCHAR(50),
  user_id VARCHAR(100),
  operation_type VARCHAR(50), -- excel_upload, manual_edit, batch_update
  affected_rows INT,
  changes JSONB,
  file_name VARCHAR(255),
  status VARCHAR(20), -- success, error, pending
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  cpo_id VARCHAR(50),
  field_changed VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(100),
  changed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_profile VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) UNIQUE NOT NULL,
  profile_type VARCHAR(50), -- vendedor, gerente, operacoes, executivo, admin
  territory VARCHAR(100),
  team VARCHAR(100),
  can_edit BOOLEAN DEFAULT FALSE,
  can_export BOOLEAN DEFAULT TRUE,
  can_batch_update BOOLEAN DEFAULT FALSE,
  can_view_all BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_cpo_id ON quotes(cpo_id);
CREATE INDEX idx_probability_stage ON quotes(probability_stage);
CREATE INDEX idx_created_date ON quotes(created_date);
CREATE INDEX idx_close_date ON quotes(close_date);
CREATE INDEX idx_vendor ON quotes(vendor);
CREATE INDEX idx_master_customer ON quotes(master_customer);
CREATE INDEX idx_lost ON quotes(lost);
