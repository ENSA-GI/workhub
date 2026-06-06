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
  '111e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  '990e8400-e29b-41d4-a716-446655440000',
  'CIN123456',
  '1998-03-10',
  'Rabat',
  'Hay Riad', 'Rabat', '10000', '+212600000000', 'mohammed.personal@mail.com',
  'SINGLE', 2,
  '2024-02-01', 'CDI', NULL,
  '990e8400-e29b-41d4-a716-446655440000',
  'cc0e8400-e29b-41d4-a716-446655440000',
  'CADRE',
  14000, 500, 300,
  'CNSS-0001', 'AMO-0001',
  'BMCE', 'RIB-TEST-123',
  'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;
