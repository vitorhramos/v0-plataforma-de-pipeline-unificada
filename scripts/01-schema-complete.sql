-- TD SYNNEX Pipeline UPP - Complete Schema

DROP TABLE IF EXISTS batch_operations CASCADE;
DROP TABLE IF EXISTS quote_audit CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS territories CASCADE;
DROP TABLE IF EXISTS regions CASCADE;

-- Core tables
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE territories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region_id INT NOT NULL REFERENCES regions(id),
  manager VARCHAR(100)
);

CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  cpo_id VARCHAR(50) NOT NULL UNIQUE,
  revenda VARCHAR(100) NOT NULL,
  end_user VARCHAR(100) NOT NULL,
  fabricante VARCHAR(100) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  usd_value DECIMAL(15, 2) NOT NULL,
  territory_id INT REFERENCES territories(id),
  sales_rep VARCHAR(100),
  
  -- Classification fields
  stage VARCHAR(50) DEFAULT 'Pipelined',
  probability INT DEFAULT 0,
  close_date DATE,
  classification_date DATE,
  classified_by VARCHAR(100),
  
  -- Status
  is_budgetary BOOLEAN DEFAULT FALSE,
  is_lost BOOLEAN DEFAULT FALSE,
  lost_reason VARCHAR(100),
  lost_other VARCHAR(255),
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(100),
  
  INDEX idx_cpo (cpo_id),
  INDEX idx_revenda (revenda),
  INDEX idx_fabricante (fabricante),
  INDEX idx_stage (stage),
  INDEX idx_usd_value (usd_value)
);

CREATE TABLE quote_audit (
  id SERIAL PRIMARY KEY,
  quote_id INT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(100),
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE batch_operations (
  id SERIAL PRIMARY KEY,
  batch_name VARCHAR(255),
  file_name VARCHAR(255),
  total_records INT,
  successful INT DEFAULT 0,
  failed INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Processing',
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_log TEXT
);

-- Indexes for performance
CREATE INDEX idx_quotes_created ON quotes(created_at DESC);
CREATE INDEX idx_quotes_usd_range ON quotes(usd_value);
CREATE INDEX idx_audit_quote ON quote_audit(quote_id);
