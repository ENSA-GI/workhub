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
) VALUES (
  'bbbb8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  'aaaa8400-e29b-41d4-a716-446655440000',
  'CIN999999',
  '1995-01-01',
  'Casablanca',
  '123 Boulevard d Anfa', 'Casablanca', '20000', '+212600000001', 'aitjaakikemohamedamine@gmail.com',
  'SINGLE', 0,
  '2023-01-01', 'CDI', NULL,
  'aa0e8400-e29b-41d4-a716-446655440000', 
  'dd0e8400-e29b-41d4-a716-446655440000', 
  'CADRE',
  25000, 1000, 500,
  'CNSS-0009', 'AMO-0009',
  'Attijariwafa Bank', 'RIB-TEST-999',
  'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;
