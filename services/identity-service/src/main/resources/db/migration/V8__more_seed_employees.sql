CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, organization_id, email, first_name, last_name, role, active, email_verified, password)
VALUES
(
  '990e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'yassine@techvision.ma',
  'Yassine',
  'Bennani',
  'EMPLOYEE',
  true,
  true,
  crypt('password123', gen_salt('bf', 10))
),
(
  '990e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'leila@techvision.ma',
  'Leila',
  'Alaoui',
  'EMPLOYEE',
  true,
  true,
  crypt('password123', gen_salt('bf', 10))
)
ON CONFLICT (id) DO NOTHING;
