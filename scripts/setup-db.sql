-- Create pipeline_quotes table
CREATE TABLE IF NOT EXISTS pipeline_quotes (
  id SERIAL PRIMARY KEY,
  cpo_id VARCHAR(50) UNIQUE NOT NULL,
  quote_number VARCHAR(50) NOT NULL,
  master_customer_name VARCHAR(255),
  customer_account VARCHAR(50),
  sales_territory VARCHAR(100),
  vendor_name VARCHAR(255),
  vendor_number VARCHAR(50),
  end_user_company VARCHAR(255),
  quote_name VARCHAR(255),
  quote_stage VARCHAR(20), -- 25%, 50%, 75% or 70%
  probability_percentage INT, -- 25, 50, 70, 75
  cif_value DECIMAL(15, 2), -- Total value in USD
  net_value DECIMAL(15, 2), -- Net value in USD
  fob_value DECIMAL(15, 2), -- FOB value in USD
  margin_percentage DECIMAL(5, 2), -- Margin %
  created_date DATE,
  close_date DATE,
  is_lost BOOLEAN DEFAULT FALSE,
  lost_reason VARCHAR(255),
  is_budgetary BOOLEAN DEFAULT FALSE,
  part_number VARCHAR(100),
  product_type VARCHAR(50), -- HW/SVC
  vpc_code VARCHAR(50),
  renewal_type VARCHAR(50), -- Renovação/Aquisição
  payment_method VARCHAR(100),
  po_comments TEXT,
  is_saved BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create batch_updates table for tracking batch operations
CREATE TABLE IF NOT EXISTS batch_updates (
  id SERIAL PRIMARY KEY,
  quote_id INT REFERENCES pipeline_quotes(id),
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255)
);

-- Create indexes for common queries
CREATE INDEX idx_sales_territory ON pipeline_quotes(sales_territory);
CREATE INDEX idx_vendor_name ON pipeline_quotes(vendor_name);
CREATE INDEX idx_quote_stage ON pipeline_quotes(quote_stage);
CREATE INDEX idx_close_date ON pipeline_quotes(close_date);
CREATE INDEX idx_created_date ON pipeline_quotes(created_date);
