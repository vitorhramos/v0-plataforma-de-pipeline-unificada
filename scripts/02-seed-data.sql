-- Seed data with realistic pipeline information

INSERT INTO quotes (
  cpo_id, part_number, sales_terr, team, vendor, master_customer, customer, end_user,
  cif, net, fob, gm, probability_stage, lost, created_date, close_date,
  cpo_no, payment_method_code, payment_method_name, opportunity_name,
  product_type, vpc_code, renew, po_comments, budgetary, bu_sales,
  status_quote, item_type, deal_id, eu_company_name, probability_percent,
  quote_net_sales, avail_cred_usd, updated_by, user_profile
) VALUES
('PO-2024-001', 'HPE-SRV-001', 'AM01', 'Team A', 'HPE', 'Tech Reseller Inc', 'Tech Reseller Inc', 'Global Corp',
  125000, 95000, 72000, 18.5, '75', FALSE, '2024-01-15', '2024-02-28',
  'CPO-001', 'CC', 'Credit Card', 'Large Migration Project', 'HW', 'CAT-001', FALSE,
  'High priority account, closing this week', FALSE, 'BU Sales 1', 'COMMITTED', 'SERVER', 'DEAL-001',
  'Global Corp Operations', 75, 95000, 500000, 'salesperson1', 'vendedor'),

('PO-2024-002', 'DELL-WRK-002', 'AM02', 'Team B', 'Dell', 'Enterprise Solutions Ltd', 'Enterprise Solutions Ltd', 'Finance Dept',
  85000, 68000, 51000, 14.2, '50', FALSE, '2024-01-20', '2024-03-15',
  'CPO-002', 'NET30', 'Net 30', 'Workstation Refresh', 'HW', 'CAT-002', TRUE,
  'Waiting for budget approval', FALSE, 'BU Sales 2', 'UP_SELLING', 'WORKSTATION', 'DEAL-002',
  'Finance Dept Tech', 50, 68000, 350000, 'salesperson2', 'vendedor'),

('PO-2024-003', 'CISCO-SW-003', 'AM01', 'Team A', 'Cisco', 'Network Plus', 'Network Plus', 'IT Department',
  45000, 36000, 27000, 8.5, '25', FALSE, '2024-02-01', '2024-04-10',
  'CPO-003', 'NET60', 'Net 60', 'Network Upgrade Phase 1', 'HW', 'CAT-003', FALSE,
  'Pricing stage, awaiting quote review', FALSE, 'BU Sales 1', 'PRICING', 'SWITCH', 'DEAL-003',
  'IT Department HQ', 25, 36000, 200000, 'salesperson3', 'vendedor'),

('PO-2024-004', 'IBM-SVC-004', 'AM03', 'Team C', 'IBM', 'Tech Consulting Group', 'Tech Consulting Group', 'Enterprise Client',
  150000, 120000, 90000, 12.5, '75', FALSE, '2024-01-10', '2024-02-15',
  'CPO-004', 'CC', 'Credit Card', 'Enterprise Support Services', 'SVC', 'CAT-SVC-001', FALSE,
  'Service contract renewal, ready to close', FALSE, 'BU Sales 3', 'COMMITTED', 'SERVICE', 'DEAL-004',
  'Enterprise Client Services', 75, 120000, 600000, 'salesperson4', 'vendedor'),

('PO-2024-005', 'LENOVO-LAP-005', 'AM02', 'Team B', 'Lenovo', 'Business Tech Dist', 'Business Tech Dist', 'Corporate Office',
  65000, 52000, 39000, 10.3, '50', FALSE, '2024-01-25', '2024-03-20',
  'CPO-005', 'NET45', 'Net 45', 'Laptop Distribution Deal', 'HW', 'CAT-005', TRUE,
  'Negotiating volume discount', FALSE, 'BU Sales 2', 'UP_SELLING', 'LAPTOP', 'DEAL-005',
  'Corporate Office Supply', 50, 52000, 280000, 'salesperson2', 'vendedor'),

('PO-2024-006', 'VMWARE-LIC-006', 'AM01', 'Team A', 'VMware', 'Cloud Solutions Ltd', 'Cloud Solutions Ltd', 'Cloud Division',
  200000, 160000, 120000, 20.0, '75', FALSE, '2024-01-05', '2024-02-20',
  'CPO-006', 'CC', 'Credit Card', 'Multi-year Cloud License Agreement', 'SVC', 'CAT-SVC-002', FALSE,
  'Strategic account, committed deal', FALSE, 'BU Sales 3', 'COMMITTED', 'LICENSE', 'DEAL-006',
  'Cloud Division HQ', 75, 160000, 800000, 'salesperson5', 'vendedor'),

('PO-2024-007', 'CANON-PRINT-007', 'AM03', 'Team C', 'Canon', 'Office Equipment Plus', 'Office Equipment Plus', 'Regional Branch',
  35000, 28000, 21000, 9.2, '25', TRUE, '2023-12-15', '2024-02-01',
  'CPO-007', 'NET30', 'Net 30', 'Printer Fleet Replacement', 'HW', 'CAT-007', FALSE,
  'Lost to competitor, moved to Canon Direct', FALSE, 'BU Sales 1', 'LOST', 'PRINTER', 'DEAL-007',
  'Regional Branch Office', 25, 28000, 150000, 'salesperson1', 'vendedor'),

('PO-2024-008', 'MICROSOFT-365-008', 'AM02', 'Team B', 'Microsoft', 'Digital Transformation Inc', 'Digital Transformation Inc', 'Operations',
  110000, 88000, 66000, 15.5, '50', FALSE, '2024-02-05', '2024-03-30',
  'CPO-008', 'CC', 'Credit Card', 'Enterprise Microsoft 365 Rollout', 'SVC', 'CAT-SVC-003', FALSE,
  'Deployment phase, closing next month', FALSE, 'BU Sales 2', 'UP_SELLING', 'SOFTWARE', 'DEAL-008',
  'Operations Team', 50, 88000, 450000, 'salesperson6', 'vendedor'),

('PO-2024-009', 'NETAPP-STOR-009', 'AM01', 'Team A', 'NetApp', 'Data Storage Experts', 'Data Storage Experts', 'Data Center',
  320000, 256000, 192000, 22.5, '75', FALSE, '2024-01-08', '2024-02-25',
  'CPO-009', 'NET60', 'Net 60', 'Enterprise Storage Solution', 'HW', 'CAT-STORAGE', FALSE,
  'Large enterprise deal, final negotiations', FALSE, 'BU Sales 3', 'COMMITTED', 'STORAGE', 'DEAL-009',
  'Data Center Operations', 75, 256000, 1200000, 'salesperson7', 'vendedor'),

('PO-2024-010', 'ARISTA-NET-010', 'AM03', 'Team C', 'Arista', 'Network Innovation Group', 'Network Innovation Group', 'Infrastructure',
  180000, 144000, 108000, 16.7, '50', FALSE, '2024-02-10', '2024-04-05',
  'CPO-010', 'NET45', 'Net 45', 'Data Center Network Upgrade', 'HW', 'CAT-NET', FALSE,
  'Technical validation in progress', FALSE, 'BU Sales 1', 'UP_SELLING', 'NETWORKING', 'DEAL-010',
  'Infrastructure Team', 50, 144000, 700000, 'salesperson3', 'vendedor');

-- Create user profiles for demo
INSERT INTO user_profiles (user_id, profile_type, territory, team, can_edit, can_export, can_batch_update, can_view_all) VALUES
('user1', 'vendedor', 'AM01', 'Team A', TRUE, TRUE, FALSE, FALSE),
('user2', 'vendedor', 'AM02', 'Team B', TRUE, TRUE, FALSE, FALSE),
('user3', 'vendedor', 'AM03', 'Team C', TRUE, TRUE, FALSE, FALSE),
('user4', 'gerente', NULL, 'Team A', TRUE, TRUE, TRUE, TRUE),
('user5', 'gerente', NULL, 'Team B', TRUE, TRUE, TRUE, TRUE),
('user6', 'operacoes', NULL, NULL, TRUE, TRUE, TRUE, TRUE),
('user7', 'executivo', NULL, NULL, FALSE, TRUE, FALSE, TRUE),
('user8', 'admin', NULL, NULL, TRUE, TRUE, TRUE, TRUE);
