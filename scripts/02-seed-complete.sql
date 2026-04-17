-- TD SYNNEX Pipeline UPP - Complete Seed Data (20 realistic quotes)

INSERT INTO regions (name, code) VALUES
  ('Americas', 'AMR'),
  ('EMEA', 'EUR'),
  ('APAC', 'ASI');

INSERT INTO territories (name, region_id, manager) VALUES
  ('North America', 1, 'John Smith'),
  ('Latin America', 1, 'Carlos Rodriguez'),
  ('Western Europe', 2, 'Maria Mueller'),
  ('Eastern Europe', 2, 'Ivan Petrov'),
  ('APAC East', 3, 'Liu Chen'),
  ('APAC Southeast', 3, 'Raj Patel');

-- 20 diverse quotes
INSERT INTO quotes (cpo_id, revenda, end_user, fabricante, usd_value, territory_id, sales_rep, stage, probability, close_date, is_budgetary) VALUES
  ('CPO-001', 'TechCorp Brasil', 'Banco Safra', 'Cisco', 125000, 2, 'Carlos Silva', 'Committed', 75, '2026-05-15', FALSE),
  ('CPO-002', 'DataSys México', 'Grupo Modelo', 'HPE', 250000, 2, 'Miguel Santos', 'Pricing 25%', 25, '2026-07-30', TRUE),
  ('CPO-003', 'CloudTech LATAM', 'Petrobras', 'VMware', 450000, 2, 'Ana Costa', 'Up Selling 50%', 50, '2026-06-15', FALSE),
  ('CPO-004', 'NetVision SA', 'KPMG Brasil', 'NetApp', 85000, 2, 'Pedro Oliveira', 'Pipelined', 0, NULL, FALSE),
  ('CPO-005', 'TechCorp NY', 'Morgan Stanley', 'Dell', 500000, 1, 'John Wagner', 'Committed', 75, '2026-04-30', FALSE),
  ('CPO-006', 'DataSys CA', 'Google Cloud', 'Cisco', 320000, 1, 'Sarah Chen', 'Up Selling 50%', 50, '2026-06-20', FALSE),
  ('CPO-007', 'CloudTech Boston', 'Red Hat', 'HPE', 180000, 1, 'Michael Brown', 'Pricing 25%', 25, '2026-08-10', TRUE),
  ('CPO-008', 'NetVision Chicago', 'United Airlines', 'VMware', 275000, 1, 'Lisa Anderson', 'Committed', 75, '2026-05-01', FALSE),
  ('CPO-009', 'TechCorp Europe', 'Siemens', 'NetApp', 350000, 3, 'Hans Mueller', 'Up Selling 50%', 50, '2026-07-15', FALSE),
  ('CPO-010', 'DataSys France', 'L\'Oreal', 'Cisco', 200000, 3, 'Pierre Dubois', 'Pipelined', 0, NULL, FALSE),
  ('CPO-011', 'CloudTech UK', 'Unilever', 'Dell', 420000, 3, 'James Wilson', 'Pricing 25%', 25, '2026-09-01', TRUE),
  ('CPO-012', 'NetVision Germany', 'Bayer', 'HPE', 160000, 3, 'Klaus Schmidt', 'Committed', 75, '2026-05-20', FALSE),
  ('CPO-013', 'TechCorp Singapore', 'DBS Bank', 'VMware', 310000, 5, 'David Lim', 'Up Selling 50%', 50, '2026-06-30', FALSE),
  ('CPO-014', 'DataSys Tokyo', 'NEC', 'NetApp', 220000, 5, 'Kenji Tanaka', 'Pricing 25%', 25, '2026-08-15', FALSE),
  ('CPO-015', 'CloudTech Sydney', 'Telstra', 'Cisco', 270000, 5, 'Robert Smith', 'Committed', 75, '2026-04-15', FALSE),
  ('CPO-016', 'NetVision Bangkok', 'CP Group', 'Dell', 145000, 6, 'Somchai Phuket', 'Pipelined', 0, NULL, TRUE),
  ('CPO-017', 'TechCorp Mumbai', 'TCS', 'HPE', 380000, 6, 'Rajesh Kumar', 'Up Selling 50%', 50, '2026-07-01', FALSE),
  ('CPO-018', 'DataSys Jakarta', 'Telkom', 'VMware', 95000, 6, 'Budi Santoso', 'Pricing 25%', 25, '2026-09-30', FALSE),
  ('CPO-019', 'CloudTech Seoul', 'Samsung', 'NetApp', 500000, 5, 'Kim Min-jun', 'Committed', 75, '2026-05-10', FALSE),
  ('CPO-020', 'NetVision Manila', 'Ayala Group', 'Cisco', 175000, 6, 'Juan Dela Cruz', 'Pipelined', 0, NULL, FALSE);
