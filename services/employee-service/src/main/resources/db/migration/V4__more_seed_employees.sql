INSERT INTO employees (
  id, organization_id, user_id,
  cin, birth_date, birth_place,
  address, city, postal_code, personal_phone, personal_email,
  marital_status, children_count,
  hire_date, contract_type, contract_end_date,
  department_id, position_id, category,
  base_salary, transport_bonus, meal_bonus,
  cnss_number, amo_number,
  bank_name, bank_account,
  status
) VALUES 
(
  '111e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  '990e8400-e29b-41d4-a716-446655440001',
  'CIN222222',
  '1995-05-15',
  'Casablanca',
  'Maarif', 'Casablanca', '20000', '+212600000001', 'yassine.personal@mail.com',
  'MARRIED', 1,
  '2023-01-10', 'CDI', NULL,
  '990e8400-e29b-41d4-a716-446655440000',
  'cc0e8400-e29b-41d4-a716-446655440000',
  'CADRE',
  16500.00, 600.00, 400.00,
  'CNSS-0002', 'AMO-0002',
  'CIH', 'RIB-TEST-222',
  'ACTIVE'
),
(
  '111e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  '990e8400-e29b-41d4-a716-446655440002',
  'CIN333333',
  '1997-09-20',
  'Tanger',
  'Malabata', 'Tanger', '90000', '+212600000002', 'leila.personal@mail.com',
  'SINGLE', 0,
  '2024-03-01', 'CDI', NULL,
  '990e8400-e29b-41d4-a716-446655440000',
  'cc0e8400-e29b-41d4-a716-446655440000',
  'EMPLOYE',
  8500.00, 300.00, 300.00,
  'CNSS-0003', 'AMO-0003',
  'Attijariwafa', 'RIB-TEST-333',
  'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;
